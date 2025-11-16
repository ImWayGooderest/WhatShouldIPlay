import { create } from 'zustand';
import { SteamUser } from '../types';

interface AppState {
  currentUser: SteamUser | null;
  setCurrentUser: (user: SteamUser | null) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
