import { create } from "zustand";

interface AppState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: "en",
  setLanguage: (lang) => set({ language: lang }),
}));
