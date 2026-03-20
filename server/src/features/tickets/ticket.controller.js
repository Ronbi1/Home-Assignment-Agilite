import * as ticketService from './ticket.service.js';

// ── Tickets ──────────────────────────────────────────────────────────────────

export const getTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getAllTickets(req.query.status);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await ticketService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicketStatus(req.params.id, req.body.status);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.deleteTicket(req.params.id);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// ── Replies ───────────────────────────────────────────────────────────────────

export const getReplies = async (req, res, next) => {
  try {
    const replies = await ticketService.getReplies(req.params.id);
    res.json(replies);
  } catch (err) {
    next(err);
  }
};

export const addReply = async (req, res, next) => {
  try {
    const reply = await ticketService.addReply(req.params.id, req.body);
    res.status(201).json(reply);
  } catch (err) {
    next(err);
  }
};
