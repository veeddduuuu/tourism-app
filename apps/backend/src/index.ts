import './config'; // must be first: loads .env before db/index.ts reads DATABASE_URL

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // base64 audio for /api/translation can exceed the default 100kb

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    ts: new Date().toISOString()
  });
});

// API routes
app.use('/api', router);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
