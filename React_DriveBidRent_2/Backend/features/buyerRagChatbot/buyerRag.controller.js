import { answerBuyerRagQuery } from './buyerRag.service.js';

export const queryBuyerRagChatbot = async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please ask a shorter question.'
      });
    }

    const data = await answerBuyerRagQuery({ message, history });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[BuyerRAG] Query failed:', error);
    res.status(500).json({
      success: false,
      message: 'DriveBot could not answer right now. Please try again.'
    });
  }
};
