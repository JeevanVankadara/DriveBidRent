// controllers/sellerControllers/rentalDetail.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import RentalCost from '../../models/RentalCost.js';

export const getRentalDetail = async (req, res) => {
  try {
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    }).populate('buyerId', 'firstName lastName email phone');
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }
    
    const rentalCost = await RentalCost.findOne({ rentalCarId: rental._id });
    const moneyReceived = rentalCost ? rentalCost.totalCost : null;

    res.json({
      success: true,
      data: { rental, moneyReceived }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rental details' });
  }
};