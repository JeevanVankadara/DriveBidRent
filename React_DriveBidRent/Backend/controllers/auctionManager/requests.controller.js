// Backend/controllers/auctionManager/requests.controller.js
const AuctionRequest = require('../../models/AuctionRequest');

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

exports.getRequests = async (req, res) => {
  try {
    const requests = await AuctionRequest.find({ status: 'pending' })
      .populate('sellerId', 'firstName lastName city email')
      .sort({ createdAt: -1 });

    res.json(send(true, 'Requests fetched', requests));
  } catch (err) {
    console.error('Requests error:', err);
    res.json(send(false, 'Failed to load requests'));
  }
};