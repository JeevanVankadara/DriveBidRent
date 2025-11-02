const RentalRequest = require('../../models/RentalRequest');

// GET: Get rentals
const getViewRentals = async (req, res) => {
  try {
    // Fetch rentals for this seller from the database
    const rentals = await RentalRequest.find({ sellerId: req.user._id });
    
    // Process rentals to include the seller's city as location
    const processedRentals = rentals.map(rental => {
      return {
        ...rental._doc,
        location: req.user.city || 'City not specified'
      };
    });
    
    res.json({
      success: true,
      data: processedRentals
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load rental listings'
    });
  }
};

// POST: Toggle rental status
const postToggleRentalStatus = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const rental = await RentalRequest.findById(rentalId);
    
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }
    
    // Check if the rental belongs to the logged-in seller
    if (rental.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Toggle the status
    rental.status = rental.status === 'available' ? 'unavailable' : 'available';
    await rental.save();
    
    return res.json({ success: true, newStatus: rental.status });
  } catch (err) {
    console.error('Error toggling status:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getViewRentals, postToggleRentalStatus };