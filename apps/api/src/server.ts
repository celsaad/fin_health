/**
 * Express server with tRPC endpoints
 */

import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import dotenv from 'dotenv';
import { appRouter } from './router.js';
import { createContext } from './context.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC endpoint
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
  console.log(`tRPC endpoint: http://localhost:${port}/trpc`);
});
