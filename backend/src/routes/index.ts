import { Router } from 'express';
import gameRoutes from './gameRoutes';
import steamRoutes from './steamRoutes';
import docsRoutes from './docs';

const router = Router();

// Health check
/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: WhatShouldIPlay API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
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
router.use('/docs', docsRoutes);

export default router;
