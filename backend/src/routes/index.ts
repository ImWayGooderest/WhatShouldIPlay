import { Router } from 'express';
import gameRoutes from './gameRoutes';
import steamRoutes from './steamRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'WhatShouldIPlay API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/games', gameRoutes);
router.use('/steam', steamRoutes);

export default router;
