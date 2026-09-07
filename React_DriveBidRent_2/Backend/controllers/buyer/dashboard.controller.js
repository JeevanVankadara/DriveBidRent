// controllers/buyer/dashboard.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import redisClient from '../../utils/redisClient.js';

// Controller for dashboard home with featured listings
export const getDashboardHome = async (req, res) => {
  try {
    // Featured listings are the same for every buyer, so one shared cache key
    const cacheKey = 'dashboard:featured';
    const startTime = Date.now();

    // Check Redis Cache first
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        console.log(`\x1b[32m[REDIS HIT]\x1b[0m  Key: ${cacheKey} | Time: ${responseTime}ms (served from Redis cache)\x1b[0m`);
        return res.json({
          success: true,
          message: 'Dashboard data fetched successfully (Cached)',
          cacheStatus: 'HIT',
          responseTime: responseTime,
          // user is never cached — always taken from the current request
          data: { ...JSON.parse(cachedData), user: req.user }
        });
      }
    }

    // CACHE MISS — fetch from MongoDB Atlas
    const featuredRentals = await RentalRequest.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .lean();

    const featuredAuctions = await AuctionRequest.find({
      status: 'approved',
      started_auction: 'yes'
    })
      .sort({ auctionDate: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .lean();

    const auctionIds = featuredAuctions.map((auction) => auction._id);
    let featuredAuctionsWithBids = featuredAuctions;

    if (auctionIds.length) {
      const currentBids = await AuctionBid.find({
        auctionId: { $in: auctionIds },
        isCurrentBid: true
      })
        .select('auctionId bidAmount')
        .lean();

      const currentBidMap = currentBids.reduce((acc, bid) => {
        acc[bid.auctionId.toString()] = bid.bidAmount;
        return acc;
      }, {});

      featuredAuctionsWithBids = featuredAuctions.map((auction) => ({
        ...auction,
        currentHighestBid: currentBidMap[auction._id.toString()] ?? auction.startingBid
      }));
    }

    const responseData = { featuredRentals, featuredAuctions: featuredAuctionsWithBids };

    // Save to Redis Cache with 90 second TTL
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 90, JSON.stringify(responseData));
    }

    const responseTime = Date.now() - startTime;
    console.log(`\x1b[33m[REDIS MISS]\x1b[0m Key: ${cacheKey} | Time: ${responseTime}ms (fetched from MongoDB Atlas)\x1b[0m`);

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      cacheStatus: 'MISS',
      responseTime: responseTime,
      data: { ...responseData, user: req.user }
    });

  } catch (err) {
    console.error('Error fetching dashboard home:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the dashboard',
      data: null
    });

  }
};
