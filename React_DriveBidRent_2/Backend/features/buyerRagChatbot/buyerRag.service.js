import { createAnswerWithGemini, createRetrievalPlanWithGemini } from './buyerRag.gemini.js';
import { retrieveVehicleListings } from './buyerRag.retriever.js';
import {
  buildFallbackPlan,
  compactHistory,
  DEFAULT_QUICK_REPLIES,
  normalizePlan
} from './buyerRag.utils.js';

const buildFallbackAnswer = ({ plan, results }) => {
  if (results.length === 0) {
    return 'I could not find matching live listings right now. Try broadening the budget, removing a fuel or transmission filter, or asking for both auctions and rentals.';
  }

  const typeText = plan.listingTypes.length === 2
    ? 'live auctions and available rentals'
    : plan.listingTypes[0] === 'auction'
      ? 'live auctions'
      : 'available rentals';

  const names = results.slice(0, 3).map((result) => `${result.title} (${result.price})`).join(', ');
  return `I found ${results.length} matching ${typeText}. Top matches: ${names}. Open a card to view full details.`;
};

const buildQuickReplies = (plan, results) => {
  if (results.length === 0) return ['Show all auctions', 'Show rentals', 'Remove budget filter'];
  if (plan.intent === 'compare') return ['Show cheaper options', 'Only automatic', 'Show rentals'];
  return DEFAULT_QUICK_REPLIES;
};

export const answerBuyerRagQuery = async ({ message, history }) => {
  const safeHistory = compactHistory(history);
  let plan = null;

  try {
    plan = await createRetrievalPlanWithGemini({ message, history: safeHistory });
  } catch (error) {
    console.warn('[BuyerRAG] Gemini retrieval plan failed, using fallback:', error.message);
  }

  const normalizedPlan = normalizePlan(plan || buildFallbackPlan(message, safeHistory));
  const results = await retrieveVehicleListings(normalizedPlan);

  let answer = null;
  try {
    answer = await createAnswerWithGemini({
      message,
      history: safeHistory,
      plan: normalizedPlan,
      results
    });
  } catch (error) {
    console.warn('[BuyerRAG] Gemini answer failed, using fallback:', error.message);
  }

  return {
    answer: answer || buildFallbackAnswer({ plan: normalizedPlan, results }),
    intent: normalizedPlan.intent,
    quickReplies: buildQuickReplies(normalizedPlan, results),
    results
  };
};
