import { Router } from 'express';
import * as ticketController from './ticket.controller.js';

const router = Router();

// Stats must be before /:id to prevent Express matching "stats" as an ID
router.get('/stats', ticketController.getStats);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicket);
router.post('/', ticketController.createTicket);
router.patch('/:id/status', ticketController.updateStatus);
router.delete('/:id', ticketController.deleteTicket);

// Replies — nested under tickets domain
router.get('/:id/replies', ticketController.getReplies);
router.post('/:id/replies', ticketController.addReply);

export default router;
