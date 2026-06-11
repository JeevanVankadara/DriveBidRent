import { Router } from 'express';
import { queryBuyerRagChatbot } from './buyerRag.controller.js';

const router = Router();

router.post('/query', queryBuyerRagChatbot);

export default router;
