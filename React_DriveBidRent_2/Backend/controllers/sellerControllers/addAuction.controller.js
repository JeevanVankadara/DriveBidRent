// controllers/sellerControllers/addAuction.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import { uploadToCloudinary } from '../../utils/fileUpload.js';

const parseAiPriceEstimate = (value) => {
  if (!value) return undefined;

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    const confidence = ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : undefined;
    return {
      recommendedStartingBid: Number(parsed.recommendedStartingBid) || undefined,
      reservePrice: Number(parsed.reservePrice) || undefined,
      priceRange: {
        low: Number(parsed.priceRange?.low) || undefined,
        high: Number(parsed.priceRange?.high) || undefined
      },
      confidence,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 4) : [],
      marketNotes: parsed.marketNotes || '',
      source: parsed.source || 'unknown',
      acceptedBySeller: reqBoolean(parsed.acceptedBySeller),
      estimatedAt: parsed.estimatedAt ? new Date(parsed.estimatedAt) : new Date()
    };
  } catch (error) {
    console.warn('[Add Auction] Failed to parse AI price estimate:', error.message);
    return undefined;
  }
};

const reqBoolean = (value) => value === true || value === 'true' || value === 'yes';

// Vehicle photo rules: exactly one main photo, plus 1-5 side/additional photos.
const MIN_ADDITIONAL_IMAGES = 1;
const MAX_ADDITIONAL_IMAGES = 5;

export const postAddAuction = async (req, res) => {
  console.log('📋 [Add Auction] ========================================');
  console.log('📋 [Add Auction] Request received');
  console.log('📋 [Add Auction] Files:', req.files ? Object.keys(req.files) : 'No files');
  console.log('📋 [Add Auction] Body keys:', Object.keys(req.body));
  console.log('📋 [Add Auction] Documentation fields received:', {
    registrationNumber: req.body['registration-number'],
    insuranceStatus: req.body['insurance-status'],
    accidentHistory: req.body['accident-history'],
    pollutionCertificate: req.body['pollution-certificate'],
  });

  try {
    const files = req.files || {};

    // The form posts the main photo and the side photos as separate fields.
    // 'vehicleImage' is the old combined field — still accepted, with the
    // first file treated as the main photo, so older clients keep working.
    const legacyImages = files['vehicleImage'] || [];
    const mainImageFile = files['mainImage']?.[0] || legacyImages[0] || null;
    const additionalImageFiles = files['additionalImages'] || legacyImages.slice(1);

    if (!mainImageFile) {
      console.log('❌ [Add Auction] Main vehicle image missing');
      return res.status(400).json({ success: false, message: 'Main vehicle image is required' });
    }

    if (additionalImageFiles.length < MIN_ADDITIONAL_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `At least ${MIN_ADDITIONAL_IMAGES} additional photo is required`
      });
    }

    if (additionalImageFiles.length > MAX_ADDITIONAL_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `You can upload at most ${MAX_ADDITIONAL_IMAGES} additional photos`
      });
    }

    // Helper function to upload single file
    const uploadFile = async (file, folder = 'drivebidrent/documents') => {
      if (!file) return null;
      try {
        const uploaded = await uploadToCloudinary(file.buffer, folder);
        return uploaded?.secure_url || uploaded?.url || null;
      } catch (error) {
        console.error(`Upload error for ${folder}:`, error);
        return null;
      }
    };

    const mainImageUrl = await uploadFile(mainImageFile, 'drivebidrent/vehicles');
    if (!mainImageUrl) {
      return res.status(500).json({ success: false, message: 'Failed to upload the main vehicle image' });
    }

    const additionalImageUrls = [];
    for (const file of additionalImageFiles) {
      const url = await uploadFile(file, 'drivebidrent/vehicles');
      if (url) additionalImageUrls.push(url);
    }

    if (additionalImageUrls.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to upload the additional vehicle photos' });
    }

    console.log(`✅ [Add Auction] Uploaded main image + ${additionalImageUrls.length} additional image(s)`);

    // Upload the remaining document files
    const registrationCertUrl = files['registration-certificate']
      ? await uploadFile(files['registration-certificate'][0], 'drivebidrent/documents/rc')
      : null;

    const insuranceDocUrl = files['insurance-document']
      ? await uploadFile(files['insurance-document'][0], 'drivebidrent/documents/insurance')
      : null;

    // Build vehicle documentation object
    const vehicleDocumentation = {
      // Registration & Ownership
      registrationNumber: req.body['registration-number'],
      registrationState: req.body['registration-state'],
      ownershipType: req.body['ownership-type'],
      registrationCertificate: registrationCertUrl,

      // Insurance
      insuranceStatus: req.body['insurance-status'],
      insuranceExpiryDate: req.body['insurance-expiry-date'] || null,
      insuranceType: req.body['insurance-type'] || null,
      previousInsuranceClaims: req.body['previous-insurance-claims'] === 'yes',
      insuranceClaimDetails: req.body['insurance-claim-details'] || '',
      insuranceDocument: insuranceDocUrl,
      
      // Accident History
      accidentHistory: req.body['accident-history'] === 'yes',
      numberOfAccidents: parseInt(req.body['number-of-accidents']) || 0,
      accidentDetails: req.body['accident-details'] || '',
      majorRepairs: req.body['major-repairs'] === 'yes',
      repairDetails: req.body['repair-details'] || '',
      
      // Transfer readiness
      readyForTransfer: req.body['ready-for-transfer'] === 'yes',

      // Service
      serviceHistory: req.body['service-history'] || 'No Records',
      lastServiceDate: req.body['last-service-date'] || null,
      serviceBookAvailable: req.body['service-book-available'] === 'yes',
      
      // Pollution
      pollutionCertificate: req.body['pollution-certificate'],
      pollutionExpiryDate: req.body['pollution-expiry-date'] || null,

      // Verification Status (defaults)
      documentsVerified: false,
      verifiedBy: null,
      verificationDate: null,
      verificationNotes: ''
    };

    // Create auction request with complete data
    const auction = new AuctionRequest({
      // Basic Vehicle Info
      vehicleName: req.body['vehicle-name'],
      mainImage: mainImageUrl,
      additionalImages: additionalImageUrls,
      carType: req.body['car-type'],
      year: parseInt(req.body['vehicle-year']),
      mileage: parseInt(req.body['vehicle-mileage']),
      fuelType: req.body['fuel-type'],
      transmission: req.body['transmission'],
      condition: req.body['vehicle-condition'],
      auctionDate: req.body['auction-date'],
      purchaseDate: req.body['purchase-date'] || null,
      expectedBid: parseFloat(req.body['starting-bid']),  // seller's expected amount
      aiPriceEstimate: parseAiPriceEstimate(req.body['ai-price-estimate']),
      
      // Documentation
      vehicleDocumentation,
      
      // Seller info & status
      sellerId: req.user._id,
      status: 'pending',
    });

    await auction.save();
    
    console.log('✅ [Add Auction] Auction created successfully:', auction._id);
    console.log('✅ [Add Auction] Vehicle Documentation saved:', {
      hasDocumentation: !!auction.vehicleDocumentation,
      registrationNumber: auction.vehicleDocumentation?.registrationNumber,
      insuranceStatus: auction.vehicleDocumentation?.insuranceStatus,
      images: 1 + (auction.additionalImages?.length || 0),
    });
    console.log('📋 [Add Auction] ========================================');
    
    res.json({ 
      success: true, 
      message: 'Auction request submitted successfully. Awaiting verification and mechanic inspection.', 
      data: auction 
    });
  } catch (err) {
    console.error('Add Auction Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to create auction request' 
    });
  }
};
