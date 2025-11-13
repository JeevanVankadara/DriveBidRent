const User = require("../../models/User");
const RentalRequest = require("../../models/RentalRequest");
const AuctionRequest = require("../../models/AuctionRequest");
const RentalCost = require("../../models/RentalCost");
const AuctionCost = require("../../models/AuctionCost");

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCarsRented = await RentalCost.countDocuments();
    const totalAuctionListings = await AuctionRequest.countDocuments();

    const vehiclePerformance = await AuctionRequest.aggregate([
      {
        $match: {
          status: "approved",
          started_auction: "ended",
          winnerId: { $exists: true, $ne: null },
          vehicleName: { $exists: true, $ne: null },
          startingBid: { $exists: true },
          finalPurchasePrice: { $exists: true },
        },
      },
      {
        $project: {
          vehicleName: 1,
          startingPrice: "$startingBid",
          finalSalePrice: "$finalPurchasePrice",
        },
      },
      { $sort: { finalSalePrice: -1 } },
    ]);

    res.json({
      success: true,
      message: "Analytics data fetched successfully",
      data: {
        totalUsers,
        totalCarsRented,
        totalAuctionListings,
        vehiclePerformance,
      },
    });
  } catch (err) {
    console.error("Error fetching analytics data:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics data: " + err.message,
      data: null,
    });
  }
};

module.exports = { getAnalytics };