import AuctionRequest from '../../models/AuctionRequest.js';

// 1. Lock the official inspection date
// so cloudinary.uploader.upload_stream works out of the box.

// 1. Lock the official inspection date
export const scheduleInspection = async (req, res) => {
  try {
    const { auctionId, date, time } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'Date and time are required' });
    }

    const auction = await AuctionRequest.findOneAndUpdate(
      { _id: auctionId, assignedMechanic: req.user._id },
      { 
        inspectionDate: date, 
        inspectionTime: time, 
        inspectionStatus: 'scheduled' 
      },
      { new: true }
    );

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction request not found or unauthorized' });
    }

    res.json({ success: true, message: 'Inspection scheduled successfully', data: auction });
  } catch (err) {
    console.error('Schedule Inspection Error:', err);
    res.status(500).json({ success: false, message: 'Server error while scheduling inspection' });
  }
};

export const submitInspection = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const { interiorRating, engineRating, overallRating, additionalNotes } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const auction = await AuctionRequest.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (!auction.assignedMechanic || auction.assignedMechanic.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not assigned to you' });
    }

    // Three 1-5 ratings and a note. Validated here as well as on the form,
    // since a client-side check is not a check.
    const ratings = { interiorRating, engineRating, overallRating };
    for (const [name, value] of Object.entries(ratings)) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        return res.status(400).json({
          success: false,
          message: `${name} must be a whole number from 1 to 5`
        });
      }
    }

    if (!additionalNotes || !String(additionalNotes).trim()) {
      return res.status(400).json({ success: false, message: 'Additional notes are required' });
    }

    const updatePayload = {
      inspectionStatus: 'completed',
      reviewStatus: 'completed',
      multipointInspection: {
        interiorRating: Number(interiorRating),
        engineRating: Number(engineRating),
        overallRating: Number(overallRating),
        additionalNotes: String(additionalNotes).trim()
      }
    };

    await AuctionRequest.findByIdAndUpdate(auctionId, updatePayload, { 
      new: true,
      runValidators: false 
    });

    return res.json({ 
      success: true, 
      message: 'Inspection report submitted successfully!' 
    });

  } catch (err) {
    console.error('Submit Inspection Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while submitting inspection'
    });
  }
};
