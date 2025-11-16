import { Game, IGame } from '../models/Game';
import { SteamUser, ISteamUser } from '../models/SteamUser';
import { SteamToGiantBomb } from '../models/SteamToGiantBomb';
import { GameNotFound } from '../models/GameNotFound';
import { steamService } from './steamService';
import { giantBombService } from './giantBombService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class GameService {
  private static instance: GameService;

  private constructor() {}

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  /**
   * Get or create Steam user with their game library
   */
  async getSteamUserWithGames(identifier: string): Promise<ISteamUser> {
    // Lookup Steam profile
    const profile = await steamService.lookupUser(identifier);
    const steamId64 = profile.steamID64;

    // Check if we have cached data
    let steamUser = await SteamUser.findOne({ steamID64: steamId64 });

    // If cached and recent (< 24 hours), return it
    if (steamUser && steamUser.lastUpdated > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      logger.info(`Using cached data for Steam user ${steamId64}`);
      return steamUser;
    }

    // Fetch fresh game data
    const games = await steamService.getOwnedGames(steamId64);

    // Update or create user
    if (steamUser) {
      steamUser.username = profile.customURL || profile.steamID;
      steamUser.realname = profile.realname;
      steamUser.avatarIcon = profile.avatarIcon;
      steamUser.avatarMedium = profile.avatarMedium;
      steamUser.avatarFull = profile.avatarFull;
      steamUser.profileUrl = `https://steamcommunity.com/profiles/${steamId64}`;
      steamUser.games = games;
      steamUser.gameCount = games.length;
      steamUser.lastUpdated = new Date();
      await steamUser.save();
    } else {
      steamUser = await SteamUser.create({
        steamID64: steamId64,
        username: profile.customURL || profile.steamID,
        realname: profile.realname,
        avatarIcon: profile.avatarIcon,
        avatarMedium: profile.avatarMedium,
        avatarFull: profile.avatarFull,
        profileUrl: `https://steamcommunity.com/profiles/${steamId64}`,
        games,
        gameCount: games.length,
        lastUpdated: new Date(),
      });
    }

    logger.info(`Updated Steam user ${steamId64} with ${games.length} games`);
    return steamUser;
  }

  /**
   * Get enriched game list with GiantBomb data
   */
  async getEnrichedGames(steamUser: ISteamUser): Promise<any[]> {
    const enrichedGames = [];

    for (const steamGame of steamUser.games) {
      // Check if we have a mapping
      const mapping = await SteamToGiantBomb.findOne({ steamAppId: steamGame.appid });

      if (mapping) {
        // Get full game data from our database
        const gbGame = await Game.findOne({ gbId: mapping.gbId });
        if (gbGame) {
          enrichedGames.push({
            ...steamGame,
            gbData: gbGame,
          });
          continue;
        }
      }

      // Check if this game is known to not exist in GiantBomb
      const notFound = await GameNotFound.findOne({ steamAppId: steamGame.appid });
      if (notFound) {
        enrichedGames.push({
          ...steamGame,
          gbData: null,
        });
        continue;
      }

      // No mapping exists, add without GB data for now
      enrichedGames.push({
        ...steamGame,
        gbData: null,
      });
    }

    return enrichedGames;
  }

  /**
   * Match a Steam game to GiantBomb game
   */
  async matchSteamToGiantBomb(steamAppId: number, steamGameName: string): Promise<IGame | null> {
    // Check if already mapped
    const existingMapping = await SteamToGiantBomb.findOne({ steamAppId });
    if (existingMapping) {
      return await Game.findOne({ gbId: existingMapping.gbId });
    }

    // Check if previously failed to find
    const notFound = await GameNotFound.findOne({ steamAppId });
    if (notFound && notFound.attemptCount >= 3) {
      logger.info(`Game ${steamGameName} (${steamAppId}) has failed ${notFound.attemptCount} times, skipping`);
      return null;
    }

    // Search GiantBomb
    try {
      const results = await giantBombService.searchGame(steamGameName);
      const bestMatch = giantBombService.findBestMatch(steamGameName, results);

      if (!bestMatch) {
        // Record as not found
        if (notFound) {
          notFound.attemptCount += 1;
          notFound.lastAttempt = new Date();
          await notFound.save();
        } else {
          await GameNotFound.create({
            steamAppId,
            steamName: steamGameName,
            attemptCount: 1,
            lastAttempt: new Date(),
          });
        }
        return null;
      }

      // Save or update game in our database
      let game = await Game.findOne({ gbId: bestMatch.id });
      if (!game) {
        game = await Game.create({
          gbId: bestMatch.id,
          name: bestMatch.name,
          deck: bestMatch.deck,
          image: bestMatch.image,
          developers: bestMatch.developers,
          genres: bestMatch.genres,
          themes: bestMatch.themes,
          concepts: bestMatch.concepts,
          platforms: bestMatch.platforms,
          site_detail_url: bestMatch.site_detail_url,
          api_detail_url: bestMatch.api_detail_url,
          original_release_date: bestMatch.original_release_date ? new Date(bestMatch.original_release_date) : undefined,
        });
      }

      // Create mapping
      await SteamToGiantBomb.create({
        steamAppId,
        steamName: steamGameName,
        gbId: bestMatch.id,
        gbName: bestMatch.name,
        confidence: 0.8, // You could implement a better scoring algorithm
        verified: false,
      });

      logger.info(`Mapped Steam game ${steamGameName} (${steamAppId}) to GB game ${bestMatch.name} (${bestMatch.id})`);
      return game;
    } catch (error) {
      logger.error(`Failed to match game ${steamGameName}:`, error);
      return null;
    }
  }

  /**
   * Get games by filter (genre, theme, concept, developer)
   */
  async getGamesByFilter(
    filterType: 'genre' | 'theme' | 'concept' | 'developer',
    filterValue: string,
    limit = 50
  ): Promise<IGame[]> {
    const filterMap = {
      genre: 'genres.name',
      theme: 'themes.name',
      concept: 'concepts.name',
      developer: 'developers.name',
    };

    const games = await Game.find({
      [filterMap[filterType]]: new RegExp(filterValue, 'i'),
    })
      .limit(limit)
      .lean();

    return games;
  }

  /**
   * Get all unique values for a filter type
   */
  async getFilterValues(filterType: 'genre' | 'theme' | 'concept' | 'developer'): Promise<string[]> {
    const fieldMap = {
      genre: 'genres',
      theme: 'themes',
      concept: 'concepts',
      developer: 'developers',
    };

    const results = await Game.aggregate([
      { $unwind: `$${fieldMap[filterType]}` },
      { $group: { _id: `$${fieldMap[filterType]}.name` } },
      { $sort: { _id: 1 } },
      { $limit: 1000 },
    ]);

    return results.map((r) => r._id).filter(Boolean);
  }

  /**
   * Get random game from entire database
   */
  async getRandomGame(): Promise<IGame | null> {
    const count = await Game.countDocuments();
    if (count === 0) return null;

    const random = Math.floor(Math.random() * count);
    const games = await Game.find().skip(random).limit(1);
    return games[0] || null;
  }

  /**
   * Get game by ID
   */
  async getGameById(gbId: number): Promise<IGame | null> {
    return await Game.findOne({ gbId });
  }
}

export const gameService = GameService.getInstance();
