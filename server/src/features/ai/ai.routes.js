import { Router } from 'express';
import * as aiController from './ai.controller.js';

const router = Router();

router.post('/suggest-reply', aiController.suggestReply);

export default router;
