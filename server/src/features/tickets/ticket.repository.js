import pool from '../../config/db.js';

export const findAll = async (status) => {
  const query = status
    ? 'SELECT * FROM tickets WHERE status = $1 ORDER BY created_at DESC'
    : 'SELECT * FROM tickets ORDER BY created_at DESC';
  const values = status ? [status] : [];
  const { rows } = await pool.query(query, values);
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
  return rows[0] || null;
};

export const create = async ({ id, customerName, customerEmail, subject, message, productId, productTitle, productPrice, productImage }) => {
  const { rows } = await pool.query(
    `INSERT INTO tickets (id, customer_name, customer_email, subject, message, product_id, product_title, product_price, product_image)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [id, customerName, customerEmail, subject, message, productId, productTitle, productPrice, productImage]
  );
  return rows[0];
};

export const updateStatus = async (id, status) => {
  const { rows } = await pool.query(
    `UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
};

export const getStats = async () => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                    AS total,
      COUNT(*) FILTER (WHERE status = 'open')::int     AS open,
      COUNT(*) FILTER (WHERE status = 'closed')::int   AS closed
    FROM tickets
  `);
  return rows[0];
};
