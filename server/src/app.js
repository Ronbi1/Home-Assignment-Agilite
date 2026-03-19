import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './features/tickets/ticket.routes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL || '(not set)'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***set***' : '(NOT SET — DB will fail!)'}`);
});

export default app;
