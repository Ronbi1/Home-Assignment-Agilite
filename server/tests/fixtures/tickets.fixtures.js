import pool from '../../src/config/db.js';

export const ticketPayload = (overrides = {}) => ({
  customerName: 'Alice Johnson',
  customerEmail: 'alice@example.com',
  subject: 'Package arrived damaged',
  message: 'The package was damaged and the product is scratched badly.',
  productId: 101,
  productTitle: 'Keyboard',
  productPrice: 49,
  productImage: 'https://cdn.example.com/keyboard.png',
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
    product_title: 'Chair',
    product_price: 149,
    product_image: 'https://cdn.example.com/chair.png',
    status: 'open',
    ...overrides,
  };

  const { rows } = await pool.query(
    `INSERT INTO tickets (id, customer_name, customer_email, subject, message, product_id, product_title, product_price, product_image, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      ticket.id,
      ticket.customer_name,
      ticket.customer_email,
      ticket.subject,
      ticket.message,
      ticket.product_id,
      ticket.product_title,
      ticket.product_price,
      ticket.product_image,
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
