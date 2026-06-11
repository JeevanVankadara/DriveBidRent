export const DEFAULT_QUICK_REPLIES = [
  'Show cheaper options',
  'Only automatic',
  'Compare these'
];

export const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const formatINR = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Price not listed';
  return `Rs. ${amount.toLocaleString('en-IN')}`;
};

export const compactHistory = (history = []) => {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-6)
    .map((entry) => ({
      role: entry.role === 'assistant' ? 'assistant' : 'user',
      text: String(entry.text || '').slice(0, 500)
    }))
    .filter((entry) => entry.text);
};

export const parseJsonObject = (text = '') => {
  const cleaned = String(text)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Gemini response did not contain a JSON object');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
};

const parsePriceAmount = (raw) => {
  const value = Number(String(raw).replace(/,/g, ''));
  if (!Number.isFinite(value)) return null;
  return value;
};

export const buildFallbackPlan = (message = '', history = []) => {
  const combined = [...compactHistory(history).map((entry) => entry.text), message].join(' ').toLowerCase();
  const filters = {};

  const maxPatterns = [
    /(?:under|below|less than|within|upto|up to)\s*(?:rs\.?|₹)?\s*([\d,.]+)\s*(lakh|lakhs|lac|lacs|cr|crore|crores|k|thousand)?/i,
    /budget\s*(?:is|of|around)?\s*(?:rs\.?|₹)?\s*([\d,.]+)\s*(lakh|lakhs|lac|lacs|cr|crore|crores|k|thousand)?/i
  ];

  for (const pattern of maxPatterns) {
    const match = combined.match(pattern);
    if (match) {
      let amount = parsePriceAmount(match[1]);
      const unit = match[2] || '';
      if (amount) {
        if (/lakh|lac/.test(unit)) amount *= 100000;
        if (/cr|crore/.test(unit)) amount *= 10000000;
        if (/k|thousand/.test(unit)) amount *= 1000;
        filters.maxPrice = Math.round(amount);
        break;
      }
    }
  }

  const carTypes = ['suv', 'sedan', 'hatchback', 'pickup', 'wagon'];
  const carType = carTypes.find((type) => combined.includes(type));
  if (carType) filters.carType = carType.charAt(0).toUpperCase() + carType.slice(1);

  const fuelTypes = ['petrol', 'diesel', 'cng', 'electric', 'hybrid'];
  const fuelType = fuelTypes.find((type) => combined.includes(type));
  if (fuelType) filters.fuelType = fuelType;

  const transmissions = ['automatic', 'manual', 'semi-automatic'];
  const transmission = transmissions.find((type) => combined.includes(type));
  if (transmission) filters.transmission = transmission;

  const conditions = ['excellent', 'good', 'fair'];
  const condition = conditions.find((type) => combined.includes(type));
  if (condition) filters.condition = condition;

  const capacityMatch = combined.match(/(\d+)\s*(?:seater|seat|people|passenger)/);
  if (capacityMatch) filters.minCapacity = Number(capacityMatch[1]);

  if (combined.includes('driver')) filters.driverAvailable = true;

  const cityMatch = combined.match(/\b(?:in|near|around)\s+([a-zA-Z ]{3,30})/);
  if (cityMatch) {
    filters.city = cityMatch[1]
      .replace(/\b(under|below|with|automatic|manual|petrol|diesel|suv|sedan|hatchback)\b.*$/i, '')
      .trim();
  }

  const wantsAuction = /\b(auction|bid|bidding|live)\b/i.test(combined);
  const wantsRental = /\b(rental|rent|book|driver|per day|daily)\b/i.test(combined);

  const cleanedSearchText = message
    .replace(/(?:under|below|less than|within|upto|up to)\s*(?:rs\.?|₹)?\s*[\d,.]+\s*(?:lakh|lakhs|lac|lacs|cr|crore|crores|k|thousand)?/gi, '')
    .replace(/\b(show|find|me|live|available|cars?|vehicles?|options?|only|with|without|under|below|budget|automatic|manual|semi-automatic|petrol|diesel|cng|electric|hybrid|excellent|good|fair|auction|auctions|rental|rentals|rent|bid|bidding|compare|cheapest|driver|seater|seat|people|passenger)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    intent: combined.includes('compare') ? 'compare' : 'search',
    listingTypes: wantsAuction && !wantsRental ? ['auction'] : wantsRental && !wantsAuction ? ['rental'] : ['auction', 'rental'],
    filters,
    searchText: cleanedSearchText.length >= 3 ? cleanedSearchText : '',
    limit: 6
  };
};

export const normalizePlan = (plan = {}) => {
  const allowedTypes = new Set(['auction', 'rental']);
  const listingTypes = Array.isArray(plan.listingTypes)
    ? plan.listingTypes.filter((type) => allowedTypes.has(type))
    : [];

  return {
    intent: ['search', 'compare', 'clarify'].includes(plan.intent) ? plan.intent : 'search',
    listingTypes: listingTypes.length ? listingTypes : ['auction', 'rental'],
    filters: {
      searchText: String(plan.searchText || plan.filters?.searchText || '').trim().slice(0, 80),
      carType: plan.filters?.carType || undefined,
      fuelType: plan.filters?.fuelType || undefined,
      transmission: plan.filters?.transmission || undefined,
      condition: plan.filters?.condition || undefined,
      city: plan.filters?.city || undefined,
      minPrice: Number(plan.filters?.minPrice) || undefined,
      maxPrice: Number(plan.filters?.maxPrice) || undefined,
      minCapacity: Number(plan.filters?.minCapacity) || undefined,
      driverAvailable: typeof plan.filters?.driverAvailable === 'boolean' ? plan.filters.driverAvailable : undefined
    },
    limit: Math.min(Math.max(Number(plan.limit) || 6, 1), 8)
  };
};
