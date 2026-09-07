// client/src/pages/seller/components/vehicleImageRules.js
//
// Photo rules shared by the Add Auction and Add Rental forms, kept in a plain
// module so VehicleImageFields.jsx only exports components (React Fast Refresh
// requires that). Mirrored server-side in addAuction/addRental controllers.

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_ADDITIONAL_IMAGES = 1;
export const MAX_ADDITIONAL_IMAGES = 5;

export const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Returns an error string, or null when the selection is valid.
export const validateVehicleImages = (
  mainImage,
  additionalImages,
  minCount = MIN_ADDITIONAL_IMAGES,
  maxCount = MAX_ADDITIONAL_IMAGES
) => {
  if (!mainImage) return 'Main car image is required';
  if (!mainImage.type.startsWith('image/')) return 'Main car image must be a valid image file';
  if (mainImage.size > MAX_FILE_SIZE) return 'Main car image exceeds the 10 MB limit';

  const extras = additionalImages || [];
  if (extras.length < minCount) return `At least ${minCount} additional photo is required`;
  if (extras.length > maxCount) return `Maximum ${maxCount} additional photos allowed`;
  if (extras.some((f) => !f.type.startsWith('image/')))
    return 'All additional photos must be valid image files';
  if (extras.some((f) => f.size > MAX_FILE_SIZE))
    return 'Each additional photo must be under 10 MB';

  return null;
};
