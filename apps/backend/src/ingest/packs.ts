import fs from 'fs';
import path from 'path';
import type {
  CityPackRow,
  FestivalPackRow,
  FoodPackRow,
  HistoryPackRow,
  StatePackRow,
} from './types';

function contentDir(): string {
  return path.resolve(__dirname, '../../content');
}

function loadJson<T>(filename: string): T {
  const file = path.join(contentDir(), filename);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function loadStatesPack(): StatePackRow[] {
  return loadJson<StatePackRow[]>('states.json');
}

export function loadCitiesPack(): CityPackRow[] {
  return loadJson<CityPackRow[]>('cities.json');
}

export function loadFoodsPack(): FoodPackRow[] {
  return loadJson<FoodPackRow[]>('foods.json');
}

export function loadFestivalsPack(): FestivalPackRow[] {
  return loadJson<FestivalPackRow[]>('festivals.json');
}

export function loadHistoryPack(): HistoryPackRow[] {
  return loadJson<HistoryPackRow[]>('history.json');
}
