
import { create } from 'zustand';

export type OSMode = 'windows' | 'android';
export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  os: OSMode;
  mode: ThemeMode;
  setOs: (os: OSMode) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const getInitialOS = (): OSMode => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|mobile/.test(userAgent) ? 'android' : 'windows';
};

export const useThemeStore = create<ThemeState>((set) => ({
  os: getInitialOS(),
  mode: 'light', // Default
  setOs: (os) => set({ os }),
  setMode: (mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ mode });
  },
  toggleMode: () => set((state) => {
    const newMode = state.mode === 'light' ? 'dark' : 'light';
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { mode: newMode };
  }),
}));
