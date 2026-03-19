import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const isRemote = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isRemote && { ssl: { rejectUnauthorized: false } }),
});

const PRODUCTS_API = 'https://api.escuelajs.co/api/v1/products?limit=6';

async function fetchProductIds() {
  const res = await fetch(PRODUCTS_API);
  if (!res.ok) throw new Error(`Products API returned ${res.status}`);
  const products = await res.json();
  return products.map((p) => p.id);
}

function buildTickets(productIds) {
  return [
    {
      id: 'TKT-A1B2C3',
      customer_name: 'Alice Johnson',
      customer_email: 'alice@example.com',
      subject: 'Product arrived damaged',
      message: 'My order arrived with significant damage to the packaging and the item itself is scratched. I would like a replacement sent as soon as possible.',
      product_id: productIds[0],
      status: 'open',
    },
    {
      id: 'TKT-D4E5F6',
      customer_name: 'Bob Smith',
      customer_email: 'bob@example.com',
      subject: 'Wrong item delivered',
      message: 'I ordered the blue variant but received the red one. Could you please arrange an exchange at no extra cost?',
      product_id: productIds[1],
      status: 'open',
    },
    {
      id: 'TKT-G7H8I9',
      customer_name: 'Carol White',
      customer_email: 'carol@example.com',
      subject: 'Item missing from order',
      message: 'My order was incomplete. The product I paid for was not inside the box when it arrived.',
      product_id: productIds[2],
      status: 'closed',
    },
    {
      id: 'TKT-J1K2L3',
      customer_name: 'David Brown',
      customer_email: 'david@example.com',
      subject: 'Refund request',
      message: 'I changed my mind about the product and would like to initiate a return and receive a full refund within the return window.',
      product_id: productIds[3],
      status: 'open',
    },
    {
      id: 'TKT-M4N5O6',
      customer_name: 'Emma Davis',
      customer_email: 'emma@example.com',
      subject: 'Product not as described',
      message: 'The product description on the website does not match what I received. The dimensions were completely different from what was advertised.',
      product_id: productIds[4],
      status: 'closed',
    },
    {
      id: 'TKT-P7Q8R9',
      customer_name: 'Frank Wilson',
      customer_email: 'frank@example.com',
      subject: 'Delivery delay inquiry',
      message: "My order was supposed to arrive 3 days ago. The tracking page hasn't updated in a week. Please investigate what happened.",
      product_id: productIds[5],
      status: 'open',
    },
  ];
}

const replies = [
  {
    ticket_id: 'TKT-A1B2C3',
    author: 'Support Agent',
    content: "Hi Alice, I'm sorry to hear about the damage! We'll arrange a replacement shipment right away. Could you please send us photos of the damage for our records?",
  },
  {
    ticket_id: 'TKT-A1B2C3',
    author: 'Alice Johnson',
    content: 'Sure, the damage is quite visible on both the box and the product itself. The corner is completely crushed.',
  },
  {
    ticket_id: 'TKT-D4E5F6',
    author: 'Support Agent',
    content: 'Hello Bob, I apologize for the mix-up. Our warehouse team has been notified and we will send the correct item within 2-3 business days.',
  },
  {
    ticket_id: 'TKT-G7H8I9',
    author: 'Support Agent',
    content: "Hi Carol, I'm sorry for the inconvenience. We've reshipped the missing item via express delivery. You should receive it by tomorrow.",
  },
  {
    ticket_id: 'TKT-G7H8I9',
    author: 'Carol White',
    content: 'Received it today! Thank you for the fast resolution.',
  },
  {
    ticket_id: 'TKT-G7H8I9',
    author: 'Support Agent',
    content: "Great to hear! We've closed this ticket. Feel free to reach out if you need anything else.",
  },
  {
    ticket_id: 'TKT-M4N5O6',
    author: 'Support Agent',
    content: "Hi Emma, we've reviewed your case and confirmed the discrepancy. A full refund has been processed to your original payment method.",
  },
  {
    ticket_id: 'TKT-M4N5O6',
    author: 'Emma Davis',
    content: 'Received the refund. Thank you for handling this so quickly.',
  },
];

async function seed() {
  console.log('Fetching current product IDs from external API...');
  const productIds = await fetchProductIds();
  console.log(`Using product IDs: ${productIds.join(', ')}`);

  const tickets = buildTickets(productIds);

  console.log('Seeding database...');

  await pool.query('TRUNCATE tickets CASCADE');
  for (const ticket of tickets) {
    await pool.query(
      `INSERT INTO tickets (id, customer_name, customer_email, subject, message, product_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [ticket.id, ticket.customer_name, ticket.customer_email, ticket.subject, ticket.message, ticket.product_id, ticket.status]
    );
  }
  console.log(`Inserted ${tickets.length} tickets`);

  for (const reply of replies) {
    await pool.query(
      `INSERT INTO replies (ticket_id, author, content) VALUES ($1, $2, $3)`,
      [reply.ticket_id, reply.author, reply.content]
    );
  }
  console.log(`Inserted ${replies.length} replies`);

  await pool.end();
  console.log('Done!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
