import * as aiService from './ai.service.js';

const createError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const suggestReply = async (req, res, next) => {
  try {
    const ticketId = typeof req.body?.ticketId === 'string' ? req.body.ticketId.trim() : '';
    if (!ticketId) {
      throw createError('ticketId is required', 400);
    }

    const result = await aiService.suggestReply(ticketId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
