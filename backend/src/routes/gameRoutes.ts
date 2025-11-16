import { Router } from 'express';
import { gameController } from '../controllers/gameController';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all game routes
router.use(apiLimiter);

// GET /api/games/random - Get random game
router.get('/random', gameController.getRandomGame);

// GET /api/games/filters/:type - Get all values for a filter (genres, themes, etc.)
router.get('/filters/:type', gameController.getFilterValues);

// GET /api/games/search - Search games by filter
router.get('/search', gameController.searchGames);

// GET /api/games/:id - Get game by ID
router.get('/:id', gameController.getGameById);

// POST /api/games/match - Match Steam game to GiantBomb
router.post('/match', gameController.matchGame);

export default router;
