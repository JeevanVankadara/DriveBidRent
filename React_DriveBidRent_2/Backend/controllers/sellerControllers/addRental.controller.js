// controllers/sellerControllers/addRental.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import { uploadToCloudinary } from '../../utils/fileUpload.js';

// Vehicle photo rules: exactly one main photo, plus 1-5 side/additional photos.
const MIN_ADDITIONAL_IMAGES = 1;
const MAX_ADDITIONAL_IMAGES = 5;

export const postAddRental = async (req, res) => {
  console.log('Request Body:', req.body);

  const files = req.files || {};

  // The form posts the main photo and the side photos as separate fields.
  // `req.file` / 'vehicleImage' is the old single-image field, still accepted
  // so older clients keep working.
  const legacyImages = files['vehicleImage'] || (req.file ? [req.file] : []);
  const mainImageFile = files['mainImage']?.[0] || legacyImages[0] || null;
  const additionalImageFiles = files['additionalImages'] || [];

  if (!mainImageFile) {
    return res.status(400).json({
      success: false,
      message: 'Main vehicle image is required.'
    });
  }

  // Only enforced for clients that use the new split fields — a legacy
  // single-image post has no additional photos to check.
  if (files['mainImage'] && additionalImageFiles.length < MIN_ADDITIONAL_IMAGES) {
    return res.status(400).json({
      success: false,
      message: `At least ${MIN_ADDITIONAL_IMAGES} additional photo is required.`
    });
  }

  if (additionalImageFiles.length > MAX_ADDITIONAL_IMAGES) {
    return res.status(400).json({
      success: false,
      message: `You can upload at most ${MAX_ADDITIONAL_IMAGES} additional photos.`
    });
  }

  try {
    const requiredFields = [
      'vehicle-name', 
      'vehicle-year',
      'vehicle-ac',
      'vehicle-capacity',
      'vehicle-condition',
      'vehicle-fuel-type',
      'vehicle-transmission',
      'rental-cost',
      'driver-available'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (req.body['driver-available'] === 'yes' && !req.body['driver-rate']) {
      return res.status(400).json({
        success: false,
        message: 'Driver rate is required when driver is available'
      });
    }

    const uploadImage = async (file) => {
      if (!file) return null;
      if (file.path) return file.path;
      if (!file.buffer) return null;
      const uploaded = await uploadToCloudinary(file.buffer, 'drivebidrent');
      return uploaded?.secure_url || uploaded?.url || null;
    };

    const imageUrl = await uploadImage(mainImageFile);
    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload the main vehicle image.'
      });
    }

    const additionalImageUrls = [];
    for (const file of additionalImageFiles) {
      const url = await uploadImage(file);
      if (url) additionalImageUrls.push(url);
    }

    const newRental = new RentalRequest({
      vehicleName: req.body['vehicle-name'],
      vehicleImage: imageUrl,
      additionalImages: additionalImageUrls,
      year: parseInt(req.body['vehicle-year']),
      AC: req.body['vehicle-ac'],
      capacity: parseInt(req.body['vehicle-capacity']),
      condition: req.body['vehicle-condition'],
      fuelType: req.body['vehicle-fuel-type'],
      transmission: req.body['vehicle-transmission'],
      costPerDay: parseFloat(req.body['rental-cost']),
      driverAvailable: req.body['driver-available'] === 'yes',
      driverRate: req.body['driver-available'] === 'yes' ? parseFloat(req.body['driver-rate']) : undefined,
      sellerId: req.user._id,
      status: 'available'
    });

    const savedRental = await newRental.save();
    console.log('Saved Rental:', savedRental);

    return res.json({
      success: true,
      message: 'Rental Request Submitted',
      data: savedRental
    });

  } catch (err) {
    console.error('Save Error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Error saving rental: ' + err.message
    });
  }
};