import { create } from 'zustand';
import { DbUser } from '@/types';

interface AuthState {
  user: DbUser | null;
  setUser: (user: DbUser | null) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  setLoading: (isLoading) => set({ isLoading }),
}));
