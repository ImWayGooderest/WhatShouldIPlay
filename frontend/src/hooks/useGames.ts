import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { gameApi } from '../services/api';
import { Game, FilterType } from '../types';

export function useRandomGame() {
  return useQuery({
    queryKey: ['randomGame'],
    queryFn: gameApi.getRandomGame,
    staleTime: 0, // Always fetch fresh random game
  });
}

export function useGame(id: number): UseQueryResult<Game> {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => gameApi.getGameById(id),
    enabled: !!id,
  });
}

export function useSearchGames(
  type: FilterType,
  value: string,
  limit = 50
): UseQueryResult<Game[]> {
  return useQuery({
    queryKey: ['searchGames', type, value, limit],
    queryFn: () => gameApi.searchGames(type, value, limit),
    enabled: !!value,
  });
}

export function useFilterValues(
  type: 'genres' | 'themes' | 'concepts' | 'developers'
): UseQueryResult<string[]> {
  return useQuery({
    queryKey: ['filterValues', type],
    queryFn: () => gameApi.getFilterValues(type),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}
