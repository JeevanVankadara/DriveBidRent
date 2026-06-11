const INR_STEP = 1000;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundToStep = (value, step = INR_STEP) => Math.max(step, Math.round(value / step) * step);

const normalizeEstimate = (estimate, source = 'llm') => {
  const recommendedStartingBid = roundToStep(toNumber(estimate.recommendedStartingBid));
  const reservePrice = roundToStep(toNumber(estimate.reservePrice, recommendedStartingBid * 1.1));
  const low = roundToStep(toNumber(estimate.priceRange?.low, recommendedStartingBid * 0.9));
  const high = roundToStep(toNumber(estimate.priceRange?.high, reservePrice * 1.08));

  return {
    recommendedStartingBid,
    reservePrice: Math.max(reservePrice, recommendedStartingBid),
    priceRange: {
      low: Math.min(low, recommendedStartingBid),
      high: Math.max(high, reservePrice)
    },
    confidence: ['low', 'medium', 'high'].includes(estimate.confidence) ? estimate.confidence : 'medium',
    reasons: Array.isArray(estimate.reasons) ? estimate.reasons.slice(0, 4) : [],
    marketNotes: estimate.marketNotes || 'Estimate is based on submitted vehicle details and should be reviewed before approval.',
    source
  };
};

const buildFallbackEstimate = (vehicle) => {
  const year = toNumber(vehicle.year, new Date().getFullYear() - 5);
  const mileage = toNumber(vehicle.mileage);
  const age = Math.max(0, new Date().getFullYear() - year);

  const bodyTypeBase = {
    Hatchback: 520000,
    Sedan: 720000,
    SUV: 1050000,
    Pickup: 900000,
    Wagon: 680000
  };

  const conditionFactor = {
    excellent: 1.08,
    good: 0.96,
    fair: 0.78
  };

  const fuelFactor = {
    petrol: 0.98,
    diesel: 1.02,
    cng: 0.9,
    electric: 1.08,
    hybrid: 1.04
  };

  const transmissionFactor = vehicle.transmission === 'automatic' ? 1.06 : vehicle.transmission === 'semi-automatic' ? 1.02 : 1;
  const ageFactor = Math.max(0.34, 1 - age * 0.075);
  const mileageFactor = Math.max(0.55, 1 - mileage / 350000);
  const accidentPenalty = vehicle.accidentHistory === 'yes' ? 0.84 : 1;
  const repairPenalty = vehicle.majorRepairs === 'yes' ? 0.92 : 1;
  const claimsPenalty = vehicle.previousInsuranceClaims === 'yes' ? 0.95 : 1;

  const base = bodyTypeBase[vehicle.carType] || 650000;
  const valuation = base
    * (conditionFactor[vehicle.condition] || 0.92)
    * (fuelFactor[vehicle.fuelType] || 1)
    * transmissionFactor
    * ageFactor
    * mileageFactor
    * accidentPenalty
    * repairPenalty
    * claimsPenalty;

  const reservePrice = roundToStep(Math.max(75000, valuation));
  const recommendedStartingBid = roundToStep(reservePrice * 0.88);

  return normalizeEstimate({
    recommendedStartingBid,
    reservePrice,
    priceRange: {
      low: recommendedStartingBid * 0.9,
      high: reservePrice * 1.12
    },
    confidence: 'medium',
    reasons: [
      `Adjusted for ${age} year vehicle age and ${mileage.toLocaleString('en-IN')} km mileage.`,
      `Condition, fuel type, and transmission were weighted for Indian auction demand.`,
      vehicle.accidentHistory === 'yes'
        ? 'Accident history reduced the recommended auction entry price.'
        : 'No accident history helped preserve the reserve estimate.'
    ],
    marketNotes: 'Fallback estimate used because the LLM service is not configured or unavailable.'
  }, 'rule-based-fallback');
};

const extractTextFromResponse = (payload) => {
  if (payload.output_text) return payload.output_text;

  const textParts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) textParts.push(content.text);
      if (content.type === 'text' && content.text) textParts.push(content.text);
    }
  }
  return textParts.join('\n');
};

const callOpenAIForEstimate = async (vehicle) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_PRICE_ESTIMATOR_MODEL || process.env.OPENAI_MODEL || 'gpt-5.4-mini';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'You estimate Indian used-vehicle auction pricing. Return conservative INR numbers for an auction starting bid and reserve price. Use only the submitted facts; do not invent exact live market data. Keep explanations short.'
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(vehicle)
            }
          ]
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'auction_price_estimate',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              recommendedStartingBid: { type: 'number' },
              reservePrice: { type: 'number' },
              priceRange: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  low: { type: 'number' },
                  high: { type: 'number' }
                },
                required: ['low', 'high']
              },
              confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
              reasons: {
                type: 'array',
                minItems: 2,
                maxItems: 4,
                items: { type: 'string' }
              },
              marketNotes: { type: 'string' }
            },
            required: ['recommendedStartingBid', 'reservePrice', 'priceRange', 'confidence', 'reasons', 'marketNotes']
          }
        }
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI estimate failed: ${response.status} ${details}`);
  }

  const payload = await response.json();
  return JSON.parse(extractTextFromResponse(payload));
};

export const estimateAuctionPrice = async (req, res) => {
  try {
    const vehicle = {
      vehicleName: String(req.body.vehicleName || '').trim(),
      carType: req.body.carType,
      year: toNumber(req.body.year),
      mileage: toNumber(req.body.mileage),
      fuelType: req.body.fuelType,
      transmission: req.body.transmission,
      condition: req.body.condition,
      purchaseDate: req.body.purchaseDate || null,
      auctionDate: req.body.auctionDate || null,
      registrationState: req.body.registrationState || '',
      ownershipType: req.body.ownershipType || '',
      accidentHistory: req.body.accidentHistory || 'no',
      numberOfAccidents: toNumber(req.body.numberOfAccidents),
      majorRepairs: req.body.majorRepairs || 'no',
      previousInsuranceClaims: req.body.previousInsuranceClaims || 'no',
      serviceHistory: req.body.serviceHistory || 'No Records'
    };

    if (!vehicle.vehicleName || !vehicle.carType || !vehicle.year || !vehicle.mileage || !vehicle.fuelType || !vehicle.transmission || !vehicle.condition) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle name, type, year, mileage, fuel, transmission, and condition are required for price estimation.'
      });
    }

    let estimate = null;
    try {
      estimate = await callOpenAIForEstimate(vehicle);
    } catch (error) {
      console.error('[Price Estimator] LLM unavailable, using fallback:', error.message);
    }

    const data = estimate
      ? normalizeEstimate(estimate, 'llm')
      : buildFallbackEstimate(vehicle);

    res.json({
      success: true,
      message: data.source === 'llm' ? 'AI price estimate generated.' : 'Fallback price estimate generated.',
      data
    });
  } catch (error) {
    console.error('[Price Estimator] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate auction price estimate.'
    });
  }
};
