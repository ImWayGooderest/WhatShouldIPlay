import axios from 'axios';
import { Game, SteamUser, EnrichedGame, FilterType } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('An error occurred while making the request');
    }
  }
);

export const gameApi = {
  getRandomGame: async (): Promise<Game> => {
    const response = await api.get('/games/random');
    return response.data.data.game;
  },

  getGameById: async (id: number): Promise<Game> => {
    const response = await api.get(`/games/${id}`);
    return response.data.data.game;
  },

  searchGames: async (type: FilterType, value: string, limit = 50): Promise<Game[]> => {
    const response = await api.get('/games/search', {
      params: { type, value, limit },
    });
    return response.data.data.games;
  },

  getFilterValues: async (type: 'genres' | 'themes' | 'concepts' | 'developers'): Promise<string[]> => {
    const response = await api.get(`/games/filters/${type}`);
    return response.data.data.values;
  },
};

export const steamApi = {
  lookupUser: async (identifier: string): Promise<SteamUser> => {
    const response = await api.post('/steam/lookup', { identifier });
    return response.data.data.steamUser;
  },

  getUserGames: async (steamId64: string): Promise<{ steamUser: SteamUser; games: EnrichedGame[] }> => {
    const response = await api.get(`/steam/${steamId64}/games`);
    return response.data.data;
  },

  getRandomUserGame: async (steamId64: string): Promise<EnrichedGame> => {
    const response = await api.get(`/steam/${steamId64}/random`);
    return response.data.data.game;
  },
};
