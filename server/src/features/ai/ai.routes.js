import { Router } from 'express';
import * as aiController from './ai.controller.js';

const router = Router();

router.post('/suggest-reply', aiController.suggestReply);
router.get('/urgent-feed', aiController.getUrgentFeed);

export default router;
