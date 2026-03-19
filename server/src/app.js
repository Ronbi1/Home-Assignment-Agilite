import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './features/tickets/ticket.routes.js';
import aiRoutes from './features/ai/ai.routes.js';
import productRoutes from './features/products/product.routes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173']
  : undefined;

app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const { default: pool } = await import('./config/db.js');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.use('/api/tickets', ticketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productRoutes);

app.use(errorHandler);

export default app;
