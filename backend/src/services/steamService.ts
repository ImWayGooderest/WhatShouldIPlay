import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

interface SteamProfile {
  steamID64: string;
  steamID: string;
  onlineState: string;
  stateMessage: string;
  privacyState: string;
  visibilityState: string;
  avatarIcon: string;
  avatarMedium: string;
  avatarFull: string;
  vacBanned: string;
  tradeBanState: string;
  isLimitedAccount: string;
  customURL?: string;
  memberSince?: string;
  location?: string;
  realname?: string;
  summary?: string;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
  img_logo_url?: string;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
  has_community_visible_stats?: boolean;
}

export class SteamService {
  private static instance: SteamService;

  private constructor() {}

  public static getInstance(): SteamService {
    if (!SteamService.instance) {
      SteamService.instance = new SteamService();
    }
    return SteamService.instance;
  }

  /**
   * Lookup Steam user by username (custom URL) or Steam ID64
   */
  async lookupUser(identifier: string): Promise<SteamProfile> {
    try {
      // Check if it's already a Steam ID64 (17 digit number)
      if (/^\d{17}$/.test(identifier)) {
        return await this.getProfileById(identifier);
      }

      // Try as custom URL
      return await this.getProfileByUsername(identifier);
    } catch (error) {
      logger.error('Failed to lookup Steam user:', { identifier, error });
      throw new AppError(404, 'Steam user not found');
    }
  }

  /**
   * Get Steam profile by Steam ID64
   */
  private async getProfileById(steamId64: string): Promise<SteamProfile> {
    try {
      const url = `https://steamcommunity.com/profiles/${steamId64}/?xml=1`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'WhatShouldIPlay/2.0',
        },
      });

      const result = await parseStringPromise(response.data);

      if (result.response?.error) {
        throw new AppError(404, 'Steam profile not found or is private');
      }

      return this.parseProfile(result.profile);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AppError(404, 'Failed to fetch Steam profile');
      }
      throw error;
    }
  }

  /**
   * Get Steam profile by custom URL (username)
   */
  private async getProfileByUsername(username: string): Promise<SteamProfile> {
    try {
      const url = `https://steamcommunity.com/id/${username}/?xml=1`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'WhatShouldIPlay/2.0',
        },
      });

      const result = await parseStringPromise(response.data);

      if (result.response?.error) {
        throw new AppError(404, 'Steam profile not found or is private');
      }

      return this.parseProfile(result.profile);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AppError(404, 'Failed to fetch Steam profile');
      }
      throw error;
    }
  }

  /**
   * Parse XML profile data
   */
  private parseProfile(profile: any): SteamProfile {
    return {
      steamID64: profile.steamID64?.[0] || '',
      steamID: profile.steamID?.[0] || '',
      onlineState: profile.onlineState?.[0] || '',
      stateMessage: profile.stateMessage?.[0] || '',
      privacyState: profile.privacyState?.[0] || '',
      visibilityState: profile.visibilityState?.[0] || '',
      avatarIcon: profile.avatarIcon?.[0] || '',
      avatarMedium: profile.avatarMedium?.[0] || '',
      avatarFull: profile.avatarFull?.[0] || '',
      vacBanned: profile.vacBanned?.[0] || '',
      tradeBanState: profile.tradeBanState?.[0] || '',
      isLimitedAccount: profile.isLimitedAccount?.[0] || '',
      customURL: profile.customURL?.[0],
      memberSince: profile.memberSince?.[0],
      location: profile.location?.[0],
      realname: profile.realname?.[0],
      summary: profile.summary?.[0],
    };
  }

  /**
   * Get owned games for a Steam user
   */
  async getOwnedGames(steamId64: string): Promise<SteamGame[]> {
    try {
      const url = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/';
      const response = await axios.get(url, {
        params: {
          key: env.STEAM_API_KEY,
          steamid: steamId64,
          format: 'json',
          include_appinfo: 1,
          include_played_free_games: 1,
        },
        timeout: 15000,
      });

      const games = response.data.response?.games || [];
      logger.info(`Retrieved ${games.length} games for Steam ID ${steamId64}`);

      return games;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          throw new AppError(403, 'Invalid Steam API key or access denied');
        }
        throw new AppError(500, 'Failed to fetch games from Steam API');
      }
      throw error;
    }
  }
}

export const steamService = SteamService.getInstance();
