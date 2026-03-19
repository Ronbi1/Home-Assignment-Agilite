import pool from '../../src/config/db.js';

export const ticketPayload = (overrides = {}) => ({
  customerName: 'Alice Johnson',
  customerEmail: 'alice@example.com',
  subject: 'Package arrived damaged',
  message: 'The package was damaged and the product is scratched badly.',
  productId: 101,
  ...overrides,
});

export const insertTicket = async (overrides = {}) => {
  const ticket = {
    id: 'TKT-SEED01',
    customer_name: 'Seed User',
    customer_email: 'seed@example.com',
    subject: 'Seeded ticket',
    message: 'This ticket is inserted directly for integration tests.',
    product_id: 202,
    status: 'open',
    ...overrides,
  };

  const { rows } = await pool.query(
    `INSERT INTO tickets (id, customer_name, customer_email, subject, message, product_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      ticket.id,
      ticket.customer_name,
      ticket.customer_email,
      ticket.subject,
      ticket.message,
      ticket.product_id,
      ticket.status,
    ]
  );

  return rows[0];
};

export const insertReply = async (ticketId, overrides = {}) => {
  const reply = {
    author: 'Support Agent',
    content: 'Thanks for reaching out. We are investigating this now.',
    ...overrides,
  };

  const { rows } = await pool.query(
    `INSERT INTO replies (ticket_id, author, content) VALUES ($1, $2, $3) RETURNING *`,
    [ticketId, reply.author, reply.content]
  );

  return rows[0];
};
