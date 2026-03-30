import AuctionRequest from '../../models/AuctionRequest.js';
import InspectionReport from '../../models/InspectionReport.js';
import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';

// Standard Cloudinary config is assumed to be loaded in app.js
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

// 2. Submit the multi-point checklist and generate PDF
export const submitInspection = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const {
      exterior, interior, engine, testDrive, overallRating, isApprovedForAuction, mechanicSummary
    } = req.body;

    // Validate Auction
    const auction = await AuctionRequest.findOne({ _id: auctionId, assignedMechanic: req.user._id })
      .populate('sellerId', 'firstName lastName')
      .populate('assignedMechanic', 'firstName lastName shopName');

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction request not found or unauthorized' });
    }

    // Step 1: Generate PDF in memory using PDFKit
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // PDF Styling & Content
    doc.fontSize(24).fillColor('#ff6b00').text('DriveBidRent', { align: 'center' });
    doc.fontSize(16).fillColor('#333333').text('Official Multi-Point Vehicle Inspection Report', { align: 'center' });
    doc.moveDown();

    // Vehicle Details
    doc.fontSize(14).fillColor('#000000').text(`Vehicle: ${auction.vehicleName} (${auction.year})`);
    doc.fontSize(12).text(`VIN: ${auction.vehicleDocumentation?.vinNumber || 'N/A'}`);
    doc.text(`Owner: ${auction?.sellerId?.firstName} ${auction?.sellerId?.lastName}`);
    doc.text(`Mechanic: ${auction?.assignedMechanic?.firstName} ${auction?.assignedMechanic?.lastName}`);
    doc.text(`Date of Inspection: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Summary Box
    doc.rect(50, doc.y, 500, 60).stroke('#ff6b00');
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor(isApprovedForAuction ? '#22c55e' : '#ef4444').text(
      isApprovedForAuction ? 'OVERALL STATUS: APPROVED FOR AUCTION' : 'OVERALL STATUS: REJECTED',
      { align: 'center' }
    );
    doc.fontSize(12).fillColor('#000000').text(`Overall Rating: ${overallRating} / 10`, { align: 'center' });
    doc.moveDown(2);

    // Section Helper
    const drawSection = (title, data) => {
      doc.fontSize(14).fillColor('#ff6b00').text(title, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#333333');
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'notes') {
          doc.text(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`);
        }
      }
      if (data.notes) {
        doc.fillColor('#666666').text(`Notes: ${data.notes}`, { font: 'Helvetica-Oblique' });
      }
      doc.moveDown(1);
    };

    if (exterior) drawSection('1. Exterior Inspection', exterior);
    if (interior) drawSection('2. Interior Inspection', interior);
    if (engine) drawSection('3. Engine & Under Hood', engine);
    if (testDrive) drawSection('4. Test Drive & Performance', testDrive);

    // Summary
    doc.fontSize(14).fillColor('#ff6b00').text('Mechanic Final Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#333333').text(mechanicSummary);

    // End the PDF
    doc.end();

    // Wait for the PDF chunk stream to finish
    await new Promise(resolve => doc.on('end', resolve));
    const pdfBuffer = Buffer.concat(chunks);

    // Step 2: Upload to Cloudinary
    let pdfReportUrl = '';
    try {
      pdfReportUrl = await uploadPdfToCloudinary(pdfBuffer);
    } catch (uploadErr) {
      console.error('PDF Cloudinary Upload Error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Failed to upload generated PDF report' });
    }

    // Step 3: Save to DB
    const newReport = new InspectionReport({
      auctionId,
      mechanicId: req.user._id,
      exterior,
      interior,
      engine,
      testDrive,
      overallRating,
      isApprovedForAuction,
      mechanicSummary,
      pdfReportUrl
    });

    await newReport.save();

    // Step 4: Update Auction Request
    // We auto-fill the legacy mechanicReview for backward compatibility 
    // but the real juice is in `inspectionReportPdf`.
    auction.inspectionStatus = 'completed';
    auction.inspectionReportPdf = pdfReportUrl;
    auction.mechanicReview = {
      mechanicalCondition: "See attached PDF report",
      bodyCondition: "See attached PDF report",
      recommendations: mechanicSummary,
      conditionRating: `${overallRating}/10`
    };
    // Usually the mechanic review completes the process
    auction.reviewStatus = 'completed';
    auction['vehicleDocumentation.documentsVerified'] = true;
    auction['vehicleDocumentation.verificationDate'] = new Date();
    auction['vehicleDocumentation.verifiedBy'] = req.user._id;

    await auction.save();

    res.json({ success: true, message: 'Inspection report submitted and PDF generated successfully!', pdfUrl: pdfReportUrl });
  } catch (err) {
    console.error('Submit Inspection Error:', err);
    res.status(500).json({ success: false, message: 'Server error while submitting inspection' });
  }
};
