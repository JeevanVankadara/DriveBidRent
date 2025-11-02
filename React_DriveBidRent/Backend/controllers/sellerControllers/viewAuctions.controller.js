const AuctionRequest = require('../../models/AuctionRequest');
const AuctionBid = require('../../models/AuctionBid');

// GET: Get seller auctions
const getViewAuctions = async (req, res) => {
  try {
    // Fetch all auctions for this seller, populate assignedMechanic
    const auctions = await AuctionRequest.find({ sellerId: req.user._id })
      .populate('assignedMechanic', 'firstName lastName doorNo street city state')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: auctions || []
    });
  } catch (err) {
    console.error('Error fetching auction data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load auction data'
    });
  }
};

// GET: Get bids for auction
const getViewBids = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const auction = await AuctionRequest.findOne({ 
      _id: auctionId,
      sellerId: req.user._id
    }).populate('assignedMechanic', 'firstName lastName doorNo street city state').lean();
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    // Check if auction is approved
    if (auction.status !== 'approved' && auction.status !== 'assignedMechanic') {
      return res.status(400).json({
        success: false,
        message: 'This auction has not been approved yet.'
      });
    }
    
    // Check if auction has started or ended
    if (auction.started_auction !== 'yes' && auction.started_auction !== 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Auction has not yet started.'
      });
    }
    
    // Fetch bids for this auction and populate buyerId with additional fields
    const bids = await AuctionBid.find({ auctionId })
      .populate('buyerId', 'firstName lastName email phone')
      .sort({ bidTime: -1 })
      .lean();
    
    // Separate current bid and bid history
    const currentBid = bids.find(bid => bid.isCurrentBid) || null;
    const bidHistory = bids.filter(bid => !bid.isCurrentBid).slice(0, 3);
    
    res.json({
      success: true,
      data: { auction, currentBid, bidHistory }
    });
    
  } catch (err) {
    console.error('Error accessing auction bids:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to access auction bids.'
    });
  }
};

module.exports = { getViewAuctions, getViewBids };