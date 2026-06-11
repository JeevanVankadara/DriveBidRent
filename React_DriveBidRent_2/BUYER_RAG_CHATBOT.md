# Buyer RAG Chatbot Implementation

## What This Feature Does

DriveBot AI is a buyer-only chatbot for finding vehicles in DriveBidRent.

Buyers can ask natural questions like:

- "Show live auctions under 10 lakh"
- "Find automatic rentals with driver"
- "Compare the cheapest options"
- "Show petrol cars in good condition"

The chatbot does not invent listings. It first retrieves real vehicle data from MongoDB and then uses Gemini to explain the results in simple language.

## What RAG Means Here

RAG means Retrieval Augmented Generation.

In this project:

1. The buyer asks a question.
2. Gemini converts the question into search filters.
3. MongoDB retrieves matching live auctions and available rentals.
4. Gemini writes a natural answer using only those MongoDB results.
5. The frontend shows the answer and vehicle cards.

This makes the chatbot more reliable than a normal chatbot because the answer is grounded in actual database listings.

## Why MongoDB Is The Retrieval Source

Vehicle availability changes often:

- Auctions can start or stop.
- Current bids can change.
- Rentals can become unavailable.
- Prices and cities come from seller-created records.

So the chatbot must read from MongoDB at request time instead of relying on Gemini memory.

## Buyer-Only Access

The chatbot is added inside the buyer layout only.

That means it appears on:

- `/buyer`
- `/buyer/auctions`
- `/buyer/rentals`
- `/buyer/wishlist`
- other buyer pages

It does not appear on seller, admin, superadmin, mechanic, auction manager, or public pages.

The backend endpoint is also protected by `buyerMiddleware`.

## Files Added

Backend feature folder:

```txt
Backend/features/buyerRagChatbot/
  buyerRag.controller.js
  buyerRag.gemini.js
  buyerRag.retriever.js
  buyerRag.routes.js
  buyerRag.service.js
  buyerRag.utils.js
```

Frontend feature folder:

```txt
client/src/features/buyerRagChatbot/
  BuyerRagChatbot.jsx
  ChatComposer.jsx
  ChatMessage.jsx
  ChatSidebar.jsx
  buyerRagChatbot.api.js
```

Small references were added to:

- `Backend/routes/buyer.routes.js`
- `client/src/pages/buyer/BuyerLayout.jsx`

## API Endpoint

```http
POST /api/buyer/rag-chatbot/query
```

Request:

```json
{
  "message": "Show automatic SUVs under 10 lakh",
  "history": [
    { "role": "user", "text": "Show SUVs" },
    { "role": "assistant", "text": "I found live SUV auctions and rentals." }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "answer": "I found matching live auctions and rentals...",
    "intent": "search",
    "quickReplies": ["Show cheaper options", "Only automatic", "Compare these"],
    "results": [
      {
        "id": "vehicle_id",
        "type": "auction",
        "title": "Honda City",
        "image": "https://...",
        "badge": "AUTOMATIC",
        "price": "Rs. 7,50,000",
        "detailsPath": "/buyer/auctions/vehicle_id",
        "meta": ["Live auction", "petrol", "good", "2022", "Mumbai"]
      }
    ]
  }
}
```

## Gemini Setup

Add these variables in `Backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_RAG_MODEL=gemini-2.5-flash
```

`GEMINI_RAG_MODEL` is optional. If it is not set, the backend uses `gemini-2.5-flash`.

If `GEMINI_API_KEY` is missing or Gemini fails, DriveBot still returns MongoDB results with a simple fallback answer.

## Retrieval Rules

For auctions, DriveBot only retrieves:

```js
status: 'approved'
started_auction: 'yes'
auction_stopped: false
```

For rentals, DriveBot only retrieves:

```js
status: 'available'
```

This prevents buyers from seeing pending, rejected, stopped, ended, or unavailable listings.

## What Buyers Can Ask

Search examples:

- "Show me automatic cars"
- "Find diesel rentals"
- "Live auctions under 8 lakh"
- "Cars with driver available"

Comparison examples:

- "Compare these options"
- "Which is cheapest?"
- "Which one is better for a family?"

Follow-up examples:

- "Only automatic"
- "Show cheaper options"
- "Now show rentals only"

## Placement Preparation Explanation

You can explain this feature in interviews like this:

"I implemented a RAG-based buyer chatbot where MongoDB acts as the retrieval layer and Gemini acts as the language layer. The system first converts the buyer's natural language query into structured filters, retrieves only valid live listings from MongoDB, and then asks Gemini to summarize those retrieved results. This avoids hallucination because Gemini is not allowed to answer from memory; it answers only from real database context."

## Limitations

- Chat history is session-only and is not saved in MongoDB.
- The chatbot only searches current auctions and rentals.
- It does not place bids or book rentals directly.
- Gemini is used for natural language understanding and answer generation, not as the source of truth.
