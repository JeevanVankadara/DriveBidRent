// client/src/utils/vehicleImage.util.js
//
// Auction listings store their cover photo as `mainImage` (with the rest in
// `additionalImages`); rentals use `vehicleImage`. Reading the wrong one is
// the reason images silently render blank, so resolve it in one place.

export const getVehicleCoverImage = (vehicle) =>
  vehicle?.mainImage || vehicle?.vehicleImage || '';

// Same, but resolves a relative path against the API host for older records
// that stored a server-relative upload path instead of a full URL.
export const getVehicleCoverImageUrl = (vehicle) => {
  const src = getVehicleCoverImage(vehicle);
  if (!src) return '';
  if (src.startsWith('http')) return src;
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
  return `${backendUrl}${src}`;
};

// Every photo for a vehicle, cover first, de-duplicated.
export const getVehicleImages = (vehicle) => {
  const all = [getVehicleCoverImage(vehicle), ...(vehicle?.additionalImages || [])];
  return [...new Set(all.filter(Boolean))];
};
