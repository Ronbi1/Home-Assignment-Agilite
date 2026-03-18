import pool from '../../config/db.js';

export const findByTicketId = async (ticketId) => {
  const { rows } = await pool.query(
    'SELECT * FROM replies WHERE ticket_id = $1 ORDER BY created_at ASC',
    [ticketId]
  );
  return rows;
};

export const create = async ({ ticketId, author, content }) => {
  const { rows } = await pool.query(
    `INSERT INTO replies (ticket_id, author, content) VALUES ($1, $2, $3) RETURNING *`,
    [ticketId, author || 'Support Agent', content]
  );
  return rows[0];
};
