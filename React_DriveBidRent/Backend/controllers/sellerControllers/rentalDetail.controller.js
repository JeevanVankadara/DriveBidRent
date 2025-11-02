const RentalRequest = require('../../models/RentalRequest');
const RentalCost = require('../../models/RentalCost');

// GET: Get rental details
const getRentalDetail = async (req, res) => {
  try {
    const rental = await RentalRequest.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    })
    .populate('buyerId', 'firstName lastName email phone'); // Populate buyerId with specific fields
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }
    
    // Fetch the rental cost to get the total money received
    const rentalCost = await RentalCost.findOne({ rentalCarId: rental._id });
    const moneyReceived = rentalCost ? rentalCost.totalCost : null;

    res.json({
      success: true,
      data: { rental, moneyReceived }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental details'
    });
  }
};

module.exports = { getRentalDetail };