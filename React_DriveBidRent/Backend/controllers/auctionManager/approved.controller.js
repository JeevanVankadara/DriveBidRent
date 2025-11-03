// Backend/controllers/auctionManager/approved.controller.js
const AuctionRequest = require('../../models/AuctionRequest');

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

exports.getApproved = async (req, res) => {
  try {
    const cars = await AuctionRequest.find({ status: 'approved' })
      .populate('sellerId', 'firstName lastName city email')
      .sort({ createdAt: -1 });

    res.json(send(true, 'Approved cars fetched', cars));
  } catch (err) {
    console.error('Approved cars error:', err);
    res.json(send(false, 'Failed to load approved cars'));
  }
};