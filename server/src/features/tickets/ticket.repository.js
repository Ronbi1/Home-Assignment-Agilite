import pool from '../../config/db.js';

const TICKET_SELECT = `
  SELECT
    t.*,
    COALESCE(first_reply.author = 'AI Support Agent', FALSE) AS has_ai_first_reply
  FROM tickets t
  LEFT JOIN LATERAL (
    SELECT author
    FROM replies
    WHERE ticket_id = t.id
    ORDER BY created_at ASC, id ASC
    LIMIT 1
  ) AS first_reply ON TRUE
`;

export const findAll = async (status) => {
  const query = status
    ? `${TICKET_SELECT} WHERE t.deleted_at IS NULL AND t.status = $1 ORDER BY t.created_at DESC`
    : `${TICKET_SELECT} WHERE t.deleted_at IS NULL ORDER BY t.created_at DESC`;
  const values = status ? [status] : [];
  const { rows } = await pool.query(query, values);
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query(`${TICKET_SELECT} WHERE t.id = $1 AND t.deleted_at IS NULL`, [id]);
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
    `UPDATE tickets SET status = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
};

export const softDelete = async (id) => {
  const { rows } = await pool.query(
    `UPDATE tickets
     SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
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
    WHERE deleted_at IS NULL
  `);
  return rows[0];
};
