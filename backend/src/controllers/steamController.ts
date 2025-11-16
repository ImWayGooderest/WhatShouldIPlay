import { Request, Response } from 'express';
import { gameService } from '../services/gameService';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export class SteamController {
  /**
   * POST /api/steam/lookup
   * Lookup Steam user and get their game library
   */
  lookupUser = asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.body;

    if (!identifier) {
      throw new AppError(400, 'Missing required parameter: identifier (Steam username or ID64)');
    }

    if (typeof identifier !== 'string' || identifier.length === 0) {
      throw new AppError(400, 'Identifier must be a non-empty string');
    }

    if (identifier.length > 100) {
      throw new AppError(400, 'Identifier is too long');
    }

    const steamUser = await gameService.getSteamUserWithGames(identifier);

    res.json({
      status: 'success',
      data: {
        steamUser: {
          steamID64: steamUser.steamID64,
          username: steamUser.username,
          realname: steamUser.realname,
          avatarIcon: steamUser.avatarIcon,
          avatarMedium: steamUser.avatarMedium,
          avatarFull: steamUser.avatarFull,
          profileUrl: steamUser.profileUrl,
          gameCount: steamUser.gameCount,
          lastUpdated: steamUser.lastUpdated,
        },
      },
    });
  });

  /**
   * GET /api/steam/:steamId64/games
   * Get enriched game library for a Steam user
   */
  getUserGames = asyncHandler(async (req: Request, res: Response) => {
    const { steamId64 } = req.params;

    if (!steamId64 || !/^\d{17}$/.test(steamId64)) {
      throw new AppError(400, 'Invalid Steam ID64');
    }

    const steamUser = await gameService.getSteamUserWithGames(steamId64);
    const enrichedGames = await gameService.getEnrichedGames(steamUser);

    res.json({
      status: 'success',
      data: {
        steamUser: {
          steamID64: steamUser.steamID64,
          username: steamUser.username,
          gameCount: steamUser.gameCount,
        },
        games: enrichedGames,
        count: enrichedGames.length,
      },
    });
  });

  /**
   * GET /api/steam/:steamId64/random
   * Get a random game from user's library
   */
  getRandomUserGame = asyncHandler(async (req: Request, res: Response) => {
    const { steamId64 } = req.params;

    if (!steamId64 || !/^\d{17}$/.test(steamId64)) {
      throw new AppError(400, 'Invalid Steam ID64');
    }

    const steamUser = await gameService.getSteamUserWithGames(steamId64);

    if (steamUser.games.length === 0) {
      throw new AppError(404, 'No games found in user library');
    }

    const enrichedGames = await gameService.getEnrichedGames(steamUser);
    const randomIndex = Math.floor(Math.random() * enrichedGames.length);
    const randomGame = enrichedGames[randomIndex];

    res.json({
      status: 'success',
      data: {
        game: randomGame,
      },
    });
  });
}

export const steamController = new SteamController();
