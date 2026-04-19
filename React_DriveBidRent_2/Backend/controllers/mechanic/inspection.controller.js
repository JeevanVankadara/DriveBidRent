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

// Helper: upload PDF buffer stream to Cloudinary
const uploadPdfToCloudinary = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'inspection_reports',
        resource_type: 'raw',
        format: 'pdf',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(pdfBuffer);
  });
};

export const submitInspection = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const {
      exterior, interior, engine, testDrive, overallRating, isApprovedForAuction, mechanicSummary
    } = req.body;

    // Validate Auction
    const auction = await AuctionRequest.findOne({ _id: auctionId, assignedMechanic: req.user._id });

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction request not found or unauthorized' });
    }

    // Update Auction Request
    auction.inspectionStatus = 'completed';
    
    // Save to multipointInspection natively
    auction.multipointInspection = {
      exterior, interior, engine, testDrive, overallRating, isApprovedForAuction, mechanicSummary
    };
    
    // Construct meaningful string summaries from checkpoints for backward compatibility
    const mechCond = `Engine: ${engine.startupSmoothness}, Battery: ${engine.batteryHealth}. Brakes: ${testDrive.brakesCondition}, Transmission: ${testDrive.transmissionShift}. Leaks: ${engine.fluidLeaks ? 'Yes' : 'No'}.`;
    const bodyCond = `Paint: ${exterior.paintCondition}/10. Tires: ${exterior.tiresCondition}. Seats: ${interior.seatsCondition}. AC/Electronics: ${interior.acWorks && interior.electronicsWork ? 'Working' : 'Review Needed'}.`;

    auction.mechanicReview = {
      mechanicalCondition: mechCond,
      bodyCondition: bodyCond,
      recommendations: mechanicSummary,
      conditionRating: `${overallRating}/10`
    };

    // Usually the mechanic review completes the process
    auction.reviewStatus = 'completed';
    
    if (!auction.vehicleDocumentation) {
      auction.vehicleDocumentation = {};
    }
    auction.vehicleDocumentation.documentsVerified = true;
    auction.vehicleDocumentation.verificationDate = new Date();
    auction.vehicleDocumentation.verifiedBy = req.user._id;

    await auction.save();

    res.json({ success: true, message: 'Inspection report submitted successfully!' });
  } catch (err) {
    console.error('Submit Inspection Error:', err);
    res.status(500).json({ success: false, message: 'Server error while submitting inspection' });
  }
};
