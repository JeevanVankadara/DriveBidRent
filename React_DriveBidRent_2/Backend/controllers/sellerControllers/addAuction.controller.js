// controllers/sellerControllers/addAuction.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import { uploadToCloudinary } from '../../utils/fileUpload.js';

export const postAddAuction = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image required' });
  }

  try {
    let imageUrl = req.file.path;
    if (!imageUrl && req.file.buffer) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'drivebidrent');
      imageUrl = uploaded?.secure_url || uploaded?.url || null;
    }

    const auction = new AuctionRequest({
      vehicleName: req.body['vehicle-name'],
      vehicleImage: imageUrl,
      year: req.body['vehicle-year'],
      mileage: req.body['vehicle-mileage'],
      fuelType: req.body['fuel-type'],
      transmission: req.body['transmission'],
      condition: req.body['vehicle-condition'],
      auctionDate: req.body['auction-date'],
      startingBid: req.body['starting-bid'],
      sellerId: req.user._id,
      status: 'pending',
    });

    await auction.save();
    res.json({ success: true, message: 'Auction created', data: auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};