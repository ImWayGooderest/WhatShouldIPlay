import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

interface GiantBombGame {
  id: number;
  name: string;
  deck?: string;
  image?: {
    icon_url?: string;
    medium_url?: string;
    screen_url?: string;
    small_url?: string;
    super_url?: string;
    thumb_url?: string;
    tiny_url?: string;
  };
  developers?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  genres?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  themes?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  concepts?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  platforms?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
    abbreviation?: string;
  }>;
  site_detail_url?: string;
  api_detail_url?: string;
  original_release_date?: string;
}

export class GiantBombService {
  private static instance: GiantBombService;
  private lastRequestTime = 0;
  private readonly MIN_DELAY = env.GIANTBOMB_DELAY_MS;

  private constructor() {}

  public static getInstance(): GiantBombService {
    if (!GiantBombService.instance) {
      GiantBombService.instance = new GiantBombService();
    }
    return GiantBombService.instance;
  }

  /**
   * Rate limiting: Ensure minimum delay between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_DELAY) {
      const delay = this.MIN_DELAY - timeSinceLastRequest;
      logger.debug(`Rate limiting: waiting ${delay}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Search for a game by name
   */
  async searchGame(gameName: string): Promise<GiantBombGame[]> {
    await this.enforceRateLimit();

    try {
      const url = 'https://www.giantbomb.com/api/search/';
      const response = await axios.get(url, {
        params: {
          api_key: env.GIANTBOMB_API_KEY,
          format: 'json',
          query: gameName,
          resources: 'game',
          field_list: 'id,name,deck,image,developers,genres,themes,concepts,platforms,site_detail_url,api_detail_url,original_release_date',
        },
        timeout: 15000,
        headers: {
          'User-Agent': 'WhatShouldIPlay/2.0',
        },
      });

      if (response.data.status_code !== 1) {
        logger.warn('GiantBomb API error:', response.data);
        throw new AppError(500, 'GiantBomb API returned an error');
      }

      return response.data.results || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new AppError(401, 'Invalid GiantBomb API key');
        }
        throw new AppError(500, 'Failed to search GiantBomb API');
      }
      throw error;
    }
  }

  /**
   * Get game details by ID
   */
  async getGameById(gameId: number): Promise<GiantBombGame | null> {
    await this.enforceRateLimit();

    try {
      const url = `https://www.giantbomb.com/api/game/${gameId}/`;
      const response = await axios.get(url, {
        params: {
          api_key: env.GIANTBOMB_API_KEY,
          format: 'json',
          field_list: 'id,name,deck,image,developers,genres,themes,concepts,platforms,site_detail_url,api_detail_url,original_release_date',
        },
        timeout: 15000,
        headers: {
          'User-Agent': 'WhatShouldIPlay/2.0',
        },
      });

      if (response.data.status_code !== 1) {
        logger.warn('GiantBomb API error:', response.data);
        return null;
      }

      return response.data.results;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        throw new AppError(500, 'Failed to fetch game from GiantBomb API');
      }
      throw error;
    }
  }

  /**
   * Find best match between Steam game name and GiantBomb results
   */
  findBestMatch(steamGameName: string, gbGames: GiantBombGame[]): GiantBombGame | null {
    if (!gbGames || gbGames.length === 0) {
      return null;
    }

    const normalizedSteamName = this.normalizeName(steamGameName);

    // First try exact match
    for (const game of gbGames) {
      if (this.normalizeName(game.name) === normalizedSteamName) {
        logger.debug(`Exact match found: ${game.name}`);
        return game;
      }
    }

    // Then try contains match
    for (const game of gbGames) {
      const normalizedGbName = this.normalizeName(game.name);
      if (normalizedGbName.includes(normalizedSteamName) || normalizedSteamName.includes(normalizedGbName)) {
        logger.debug(`Partial match found: ${game.name}`);
        return game;
      }
    }

    // Return first result as fallback
    logger.debug(`No exact match, using first result: ${gbGames[0].name}`);
    return gbGames[0];
  }

  /**
   * Normalize game name for comparison
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[™®©]/g, '')
      .replace(/[:\-–—]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/the\s+/gi, '')
      .replace(/edition/gi, '')
      .replace(/remastered/gi, '')
      .trim();
  }
}

export const giantBombService = GiantBombService.getInstance();
