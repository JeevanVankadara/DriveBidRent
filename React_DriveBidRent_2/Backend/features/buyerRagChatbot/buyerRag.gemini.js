import { GoogleGenAI } from '@google/genai';
import { parseJsonObject } from './buyerRag.utils.js';

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

const getModel = () => process.env.GEMINI_RAG_MODEL || 'gemini-2.5-flash';

export const createRetrievalPlanWithGemini = async ({ message, history }) => {
  const client = getClient();
  if (!client) return null;

  const prompt = `
You convert buyer vehicle-search chat messages into a MongoDB retrieval plan.
Return JSON only. Do not include markdown.

Allowed listingTypes: "auction", "rental".
Allowed intent: "search", "compare", "clarify".
Allowed filters:
- searchText: string
- carType: Sedan | SUV | Hatchback | Pickup | Wagon
- fuelType: petrol | diesel | cng | electric | hybrid
- transmission: manual | automatic | semi-automatic
- condition: excellent | good | fair
- city: string
- minPrice: number
- maxPrice: number
- minCapacity: number
- driverAvailable: boolean

If the user asks for bidding, live auctions, current bid, or auction price, prefer auctions.
If the user asks for rent, daily cost, booking, driver, AC, or seating capacity, prefer rentals.
For broad vehicle search, include both auctions and rentals.

Conversation history:
${JSON.stringify(history)}

Buyer message:
${message}

JSON shape:
{
  "intent": "search",
  "listingTypes": ["auction", "rental"],
  "filters": {},
  "searchText": "",
  "limit": 6
}
`;

  const response = await client.models.generateContent({
    model: getModel(),
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  });

  return parseJsonObject(response.text);
};

export const createAnswerWithGemini = async ({ message, history, plan, results }) => {
  const client = getClient();
  if (!client) return null;

  const prompt = `
You are DriveBot AI inside DriveBidRent. You help buyers find vehicles.
Answer ONLY from the retrieved MongoDB listings below. Do not invent vehicles, prices, cities, or availability.
If no results are available, say that no matching live listings were found and suggest how to broaden the search.
Keep the answer concise, practical, and buyer-friendly. Mention whether results are auctions or rentals.

Buyer message:
${message}

Recent history:
${JSON.stringify(history)}

Retrieval plan:
${JSON.stringify(plan)}

Retrieved listings:
${JSON.stringify(results)}
`;

  const response = await client.models.generateContent({
    model: getModel(),
    contents: prompt,
    config: {
      temperature: 0.35
    }
  });

  return response.text?.trim() || null;
};
