// controllers/home.controller.js
import RentalRequest from '../models/RentalRequest.js';
import AuctionRequest from '../models/AuctionRequest.js';

const homeController = {
  getHomeData: async (req, res) => {
    try {
      const topRentals = await RentalRequest.find({ status: 'available' })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      // Same definition of "live" the buyer auction list uses, so the home
      // page can never advertise an auction that is stopped or not yet
      // approved. Soonest first, so the most urgent auctions surface.
      const topAuctions = await AuctionRequest.find({
        status: 'approved',
        started_auction: 'yes',
        auction_stopped: false
      })
        .sort({ auctionDate: 1 })
        .limit(4)
        .lean();

      return res.status(200).json({
        success: true,
        message: 'Home data fetched successfully',
        data: { topRentals, topAuctions }
      });
    } catch (err) {
      console.error("Error fetching top rentals and auctions:", err);
      return res.status(500).json({
        success: false,
        message: 'Failed to load top rentals and auctions',
        data: { topRentals: [], topAuctions: [] }
      });
    }
  }
};

export default homeController;