import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query';
import { steamApi } from '../services/api';
import { SteamUser, EnrichedGame } from '../types';
import { useStore } from '../store/useStore';

export function useSteamLookup() {
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  return useMutation({
    mutationFn: (identifier: string) => steamApi.lookupUser(identifier),
    onSuccess: (user) => {
      setCurrentUser(user);
    },
  });
}

export function useUserGames(
  steamId64: string | null
): UseQueryResult<{ steamUser: SteamUser; games: EnrichedGame[] }> {
  return useQuery({
    queryKey: ['userGames', steamId64],
    queryFn: () => steamApi.getUserGames(steamId64!),
    enabled: !!steamId64,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useRandomUserGame(steamId64: string | null) {
  return useQuery({
    queryKey: ['randomUserGame', steamId64],
    queryFn: () => steamApi.getRandomUserGame(steamId64!),
    enabled: false, // Only run when manually triggered
  });
}
