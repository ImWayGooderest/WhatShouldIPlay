import { Request, Response } from 'express';
import { gameService } from '../services/gameService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { z } from 'zod';

export class GameController {
  /**
   * GET /api/games/random
   * Get a random game from the database
   */
  getRandomGame = asyncHandler(async (req: Request, res: Response) => {
    const game = await gameService.getRandomGame();

    if (!game) {
      throw new AppError(404, 'No games found in database');
    }

    res.json({
      status: 'success',
      data: { game },
    });
  });

  /**
   * GET /api/games/:id
   * Get game by GiantBomb ID
   */
  getGameById = asyncHandler(async (req: Request, res: Response) => {
    const gbId = parseInt(req.params.id);

    if (isNaN(gbId)) {
      throw new AppError(400, 'Invalid game ID');
    }

    const game = await gameService.getGameById(gbId);

    if (!game) {
      throw new AppError(404, 'Game not found');
    }

    res.json({
      status: 'success',
      data: { game },
    });
  });

  /**
   * GET /api/games/search
   * Search games by genre, theme, concept, or developer
   */
  searchGames = asyncHandler(async (req: Request, res: Response) => {
    const { type, value, limit } = req.query;

    if (!type || !value) {
      throw new AppError(400, 'Missing required parameters: type and value');
    }

    const filterType = type as 'genre' | 'theme' | 'concept' | 'developer';
    const validTypes = ['genre', 'theme', 'concept', 'developer'];

    if (!validTypes.includes(filterType)) {
      throw new AppError(400, 'Invalid filter type. Must be: genre, theme, concept, or developer');
    }

    const games = await gameService.getGamesByFilter(
      filterType,
      value as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json({
      status: 'success',
      data: {
        games,
        count: games.length,
      },
    });
  });

  /**
   * GET /api/games/filters/:type
   * Get all available values for a filter type
   */
  getFilterValues = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.params;
    const validTypes = ['genres', 'themes', 'concepts', 'developers'];

    if (!validTypes.includes(type)) {
      throw new AppError(400, 'Invalid filter type. Must be: genres, themes, concepts, or developers');
    }

    // Remove 's' from end to match service method
    const filterType = type.slice(0, -1) as 'genre' | 'theme' | 'concept' | 'developer';
    const values = await gameService.getFilterValues(filterType);

    res.json({
      status: 'success',
      data: {
        type,
        values,
        count: values.length,
      },
    });
  });

  /**
   * POST /api/games/match
   * Match a Steam game to GiantBomb
   */
  matchGame = asyncHandler(async (req: Request, res: Response) => {
    const { steamAppId, steamGameName } = req.body;

    if (!steamAppId || !steamGameName) {
      throw new AppError(400, 'Missing required parameters: steamAppId and steamGameName');
    }

    const game = await gameService.matchSteamToGiantBomb(
      parseInt(steamAppId),
      steamGameName
    );

    res.json({
      status: 'success',
      data: {
        matched: !!game,
        game: game || null,
      },
    });
  });
}

export const gameController = new GameController();
