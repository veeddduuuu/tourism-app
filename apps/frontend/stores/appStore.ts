import { useSyncExternalStore } from "react";

export type Gender = "male" | "female";
export type AgeGroup = "young" | "adult" | "senior";

export interface Guide {
  id: string;
  name: string;
  role: string;
  totem: string; // role emoji, e.g. "🍛"
  color: string;
  gender: Gender;
  ageGroup: AgeGroup;
  avatar: string; // person emoji derived from gender + ageGroup
  greeting: string;
  tips: string[];
}

/** Prefs aligned with Aaroh POST /ai/trip/plan request. */
export interface TripPrefs {
  destination: string;
  origin: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  budget: number;
  currency: string;
  travelers: number;
  pace: "relaxed" | "moderate" | "packed";
  interests: string[];
  stayType: "hostel" | "budget" | "boutique" | "luxury" | "apartment" | null;
  transportMode: "any" | "flight" | "train" | "car" | "mixed";
}

export interface AppState {
  language: string;
  guide: Guide | null;
  destinationState: string | null;
  tripPrefs: TripPrefs | null;
  setLanguage: (lang: string) => void;
  setGuide: (guide: Guide) => void;
  setDestinationState: (state: string | null) => void;
  setTripPrefs: (prefs: TripPrefs) => void;
}

// Minimal dependency-free global store (zustand isn't installed in this app).
let state = {
  language: "en" as string,
  guide: null as Guide | null,
  destinationState: null as string | null,
  tripPrefs: null as TripPrefs | null,
};

const listeners = new Set<() => void>();

function setState(partial: Partial<typeof state>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Actions are defined once so their references stay stable across renders.
const actions = {
  setLanguage: (language: string) => setState({ language }),
  setGuide: (guide: Guide) => setState({ guide }),
  setDestinationState: (destinationState: string | null) =>
    setState({ destinationState }),
  setTripPrefs: (tripPrefs: TripPrefs) => setState({ tripPrefs }),
};

function getSnapshot(): AppState {
  return { ...state, ...actions };
}

/**
 * useAppStore(selector) — subscribe to a slice of the global app state. Mirrors
 * the zustand API the rest of the app expects. The selected value must be a
 * stable reference/primitive (state fields and actions are), which it is.
 */
export function useAppStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot())
  );
}

// Non-hook access for imperative reads/writes if ever needed.
export const appStore = {
  getState: getSnapshot,
  setLanguage: actions.setLanguage,
  setGuide: actions.setGuide,
  setDestinationState: actions.setDestinationState,
  setTripPrefs: actions.setTripPrefs,
};
