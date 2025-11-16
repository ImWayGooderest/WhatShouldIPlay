import { Router } from 'express';
import { steamController } from '../controllers/steamController';
import { strictLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply stricter rate limiting to Steam routes (they hit external APIs)
router.use(strictLimiter);

// POST /api/steam/lookup - Lookup Steam user
router.post('/lookup', steamController.lookupUser);

// GET /api/steam/:steamId64/games - Get user's games
router.get('/:steamId64/games', steamController.getUserGames);

// GET /api/steam/:steamId64/random - Get random game from user's library
router.get('/:steamId64/random', steamController.getRandomUserGame);

export default router;
