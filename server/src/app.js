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

// All ticket + reply routes are handled by the tickets feature
app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
