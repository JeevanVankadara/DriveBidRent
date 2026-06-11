import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';
import RentalRequest from '../../models/RentalRequest.js';
import { escapeRegex, formatINR } from './buyerRag.utils.js';

const compactMeta = (...items) => items.filter(Boolean).map((item) => String(item));

const matchesCity = (seller, city) => {
  if (!city) return true;
  return seller?.city?.toLowerCase() === city.toLowerCase();
};

const mapAuctionResult = (auction, currentBidMap) => {
  const currentPrice = currentBidMap[auction._id.toString()] ?? auction.startingBid;
  return {
    id: auction._id.toString(),
    type: 'auction',
    title: auction.vehicleName,
    image: auction.mainImage || auction.vehicleImage || auction.additionalImages?.[0] || '',
    badge: (auction.transmission || 'auction').toUpperCase(),
    price: formatINR(currentPrice),
    detailsPath: `/buyer/auctions/${auction._id}`,
    meta: compactMeta(
      'Live auction',
      auction.fuelType,
      auction.condition,
      auction.year,
      auction.sellerId?.city,
      auction.carType
    ),
    raw: {
      startingBid: auction.startingBid,
      currentHighestBid: currentPrice,
      mileage: auction.mileage,
      auctionDate: auction.auctionDate
    }
  };
};

const mapRentalResult = (rental) => ({
  id: rental._id.toString(),
  type: 'rental',
  title: rental.vehicleName,
  image: rental.vehicleImage || '',
  badge: rental.driverAvailable ? 'DRIVER' : (rental.transmission || 'rental').toUpperCase(),
  price: `${formatINR(rental.costPerDay)} / day`,
  detailsPath: `/buyer/rentals/${rental._id}`,
  meta: compactMeta(
    'Available rental',
    rental.fuelType,
    rental.transmission,
    rental.condition,
    `${rental.capacity} seats`,
    rental.sellerId?.city
  ),
  raw: {
    costPerDay: rental.costPerDay,
    driverAvailable: rental.driverAvailable,
    driverRate: rental.driverRate || 0,
    AC: rental.AC,
    year: rental.year
  }
});

export const retrieveVehicleListings = async (plan) => {
  const filters = plan.filters || {};
  const wantsAuctions = plan.listingTypes.includes('auction');
  const wantsRentals = plan.listingTypes.includes('rental');
  const limit = Number(plan.limit) || 6;
  const searchText = filters.searchText || plan.searchText;
  const regex = searchText ? new RegExp(escapeRegex(searchText), 'i') : null;

  const [auctionResults, rentalResults] = await Promise.all([
    wantsAuctions ? retrieveAuctions({ filters, regex, limit }) : Promise.resolve([]),
    wantsRentals ? retrieveRentals({ filters, regex, limit }) : Promise.resolve([])
  ]);

  return [...auctionResults, ...rentalResults].slice(0, limit);
};

const retrieveAuctions = async ({ filters, regex, limit }) => {
  const query = {
    status: 'approved',
    started_auction: 'yes',
    auction_stopped: false
  };

  if (regex) query.vehicleName = regex;
  if (filters.carType) query.carType = filters.carType;
  if (filters.fuelType) query.fuelType = filters.fuelType;
  if (filters.transmission) query.transmission = filters.transmission;
  if (filters.condition) query.condition = filters.condition;
  if (filters.minPrice || filters.maxPrice) {
    query.startingBid = {};
    if (filters.minPrice) query.startingBid.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.startingBid.$lte = Number(filters.maxPrice);
  }

  const auctions = await AuctionRequest.find(query)
    .populate('sellerId', 'firstName lastName city state')
    .sort({ auctionDate: 1 })
    .limit(30)
    .lean();

  const cityFiltered = auctions.filter((auction) => matchesCity(auction.sellerId, filters.city));
  const auctionIds = cityFiltered.map((auction) => auction._id);
  const currentBids = auctionIds.length
    ? await AuctionBid.find({ auctionId: { $in: auctionIds }, isCurrentBid: true })
      .select('auctionId bidAmount')
      .lean()
    : [];

  const currentBidMap = currentBids.reduce((acc, bid) => {
    acc[bid.auctionId.toString()] = bid.bidAmount;
    return acc;
  }, {});

  return cityFiltered.slice(0, limit).map((auction) => mapAuctionResult(auction, currentBidMap));
};

const retrieveRentals = async ({ filters, regex, limit }) => {
  const query = { status: 'available' };

  if (regex) query.vehicleName = regex;
  if (filters.fuelType && ['petrol', 'diesel'].includes(filters.fuelType)) query.fuelType = filters.fuelType;
  if (filters.transmission) query.transmission = filters.transmission;
  if (filters.condition) query.condition = filters.condition;
  if (filters.minCapacity) query.capacity = { $gte: Number(filters.minCapacity) };
  if (typeof filters.driverAvailable === 'boolean') query.driverAvailable = filters.driverAvailable;
  if (filters.minPrice || filters.maxPrice) {
    query.costPerDay = {};
    if (filters.minPrice) query.costPerDay.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.costPerDay.$lte = Number(filters.maxPrice);
  }

  const rentals = await RentalRequest.find(query)
    .populate('sellerId', 'firstName lastName city state')
    .sort({ costPerDay: 1 })
    .limit(30)
    .lean();

  return rentals
    .filter((rental) => matchesCity(rental.sellerId, filters.city))
    .slice(0, limit)
    .map(mapRentalResult);
};
