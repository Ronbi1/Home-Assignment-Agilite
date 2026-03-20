import { customAlphabet } from 'nanoid';
import * as ticketRepo from './ticket.repository.js';
import * as repliesRepo from './replies.repository.js';

const ALLOWED_STATUSES = ['open', 'closed'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const generateId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const createError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const validateTicketFields = ({ customerName, customerEmail, subject, message, productId, productTitle, productPrice, productImage }) => {
  const normalizedProductId = Number(productId);

  if (!customerName || !customerEmail || !subject || !message || !productId) {
    throw createError('All fields are required');
  }
  if (customerName.trim().length < 2) throw createError('Name must be at least 2 characters');
  if (!EMAIL_RE.test(customerEmail)) throw createError('Please enter a valid email address');
  if (subject.trim().length < 5) throw createError('Subject must be at least 5 characters');
  if (message.trim().length < 10) throw createError('Message must be at least 10 characters');
  if (!Number.isInteger(normalizedProductId) || normalizedProductId < 1) throw createError('Please select a valid product');
  if (!productTitle || productTitle.trim().length < 1) throw createError('Product details are required');
  if (!Number.isFinite(productPrice) || productPrice < 0) throw createError('Please select a valid product');
  if (!productImage || productImage.trim().length < 1) throw createError('Product details are required');
};

// ── Tickets ──────────────────────────────────────────────────────────────────

export const getAllTickets = (status) => ticketRepo.findAll(status);

export const getStats = () => ticketRepo.getStats();

export const getTicketById = async (id) => {
  const ticket = await ticketRepo.findById(id);
  if (!ticket) throw createError('Ticket not found', 404);
  return ticket;
};

export const createTicket = async ({ customerName, customerEmail, subject, message, productId, productTitle, productPrice, productImage }) => {
  validateTicketFields({ customerName, customerEmail, subject, message, productId, productTitle, productPrice, productImage });
  const id = `TKT-${generateId()}`;
  return ticketRepo.create({
    id,
    customerName,
    customerEmail,
    subject,
    message,
    productId: Number(productId),
    productTitle,
    productPrice,
    productImage,
  });
};

export const updateTicketStatus = async (id, status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw createError(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }
  const ticket = await ticketRepo.updateStatus(id, status);
  if (!ticket) throw createError('Ticket not found', 404);
  return ticket;
};

// ── Replies ───────────────────────────────────────────────────────────────────

export const getReplies = async (ticketId) => {
  await getTicketById(ticketId);
  return repliesRepo.findByTicketId(ticketId);
};

export const addReply = async (ticketId, { author, content }) => {
  const ticket = await getTicketById(ticketId);
  if (ticket.status === 'closed') throw createError('Cannot reply to a closed ticket', 403);
  if (!content?.trim()) throw createError('Reply content is required');
  return repliesRepo.create({ ticketId, author, content: content.trim() });
};
