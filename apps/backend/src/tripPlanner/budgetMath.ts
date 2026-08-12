import type { TripMemory } from './memory';
import type { BudgetBreakdown } from './types';

/** Tell agents how to split a hard budget (targets; final total is enforced). */
export function envelopeHint(
  cap: number,
  currency: string,
  nights: number,
  travelers: number
): string {
  const lodging = cap * 0.35;
  const travel = cap * 0.25;
  const dailyPool = cap * 0.4;
  const perNight = lodging / Math.max(nights, 1);
  const perDay = dailyPool / Math.max(nights, 1);
  return (
    `STRICT HARD CAP: total spend MUST be ≤ ${cap.toFixed(0)} ${currency} ` +
    `for ${travelers} traveler(s). Never exceed this. Suggested split: ` +
    `lodging ≤${lodging.toFixed(0)} (~${perNight.toFixed(0)}/night), ` +
    `intercity travel ≤${travel.toFixed(0)} (pick ONE mode, not flight+train both), ` +
    `food+activities ≤${dailyPool.toFixed(0)} (~${perDay.toFixed(0)}/day). ` +
    'Prefer cheaper options when the cap is tight. No luxury spas/golf unless they fit.'
  );
}

export function remainingDailyHint(memory: TripMemory): string {
  const r = memory.request;
  const cap = r.budget.amount;
  const travel = selectedTravelCost(memory);
  const lodging = selectedLodgingCost(memory);
  const remaining = Math.max(cap - travel - lodging, 0);
  const days =
    memory.itinerary?.days?.length
      ? memory.itinerary.days.length
      : Math.max(nights(memory), 1);
  const perDay = remaining / Math.max(days, 1);
  return (
    `REMAINING for food+activities after travel+lodging: ` +
    `${remaining.toFixed(0)} ${r.budget.currency} total ` +
    `(~${perDay.toFixed(0)}/day across ${days} day(s)). Do not exceed this pool.`
  );
}

function nights(memory: TripMemory): number {
  const r = memory.request;
  try {
    const start = new Date(r.start_date + 'T00:00:00Z');
    const end = new Date(r.end_date + 'T00:00:00Z');
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    return Math.max(days, 1);
  } catch {
    return 3;
  }
}

export function selectedTravelCost(memory: TripMemory): number {
  if (!memory.travel?.to_destination?.length) return 0;
  return Math.min(...memory.travel.to_destination.map((leg) => leg.estimated_cost));
}

export function selectedLodgingCost(memory: TripMemory): number {
  if (!memory.hotels?.recommendations?.length) return 0;
  return Math.min(...memory.hotels.recommendations.map((h) => h.total_estimate));
}

export function dailyCosts(memory: TripMemory): number {
  if (!memory.itinerary) return 0;
  return memory.itinerary.days.reduce((sum, d) => sum + d.estimated_cost, 0);
}

function scaleDaily(memory: TripMemory, factor: number): void {
  if (!memory.itinerary) return;
  for (const day of memory.itinerary.days) {
    day.estimated_cost = Math.round(Math.max(day.estimated_cost * factor, 0) * 100) / 100;
  }
}

function scaleLodging(memory: TripMemory, factor: number): void {
  if (!memory.hotels) return;
  for (const h of memory.hotels.recommendations) {
    h.total_estimate = Math.round(Math.max(h.total_estimate * factor, 0) * 100) / 100;
    h.price_per_night = Math.round(Math.max(h.price_per_night * factor, 0) * 100) / 100;
  }
}

function scaleTravel(memory: TripMemory, factor: number): void {
  if (!memory.travel) return;
  for (const leg of memory.travel.to_destination) {
    leg.estimated_cost =
      Math.round(Math.max(leg.estimated_cost * factor, 0) * 100) / 100;
  }
}

function cutCategory(current: number, excess: number): [number, number] {
  if (current <= 0 || excess <= 0) return [1, excess];
  const cut = Math.min(current, excess);
  const factor = (current - cut) / current;
  return [factor, excess - cut];
}

/**
 * Mutate plan costs so the deterministic rollup is ≤ the hard cap.
 * Cut order: daily → lodging → travel.
 */
export function enforceHardCap(memory: TripMemory): string[] {
  const cap = memory.request.budget.amount;
  const currency = memory.request.budget.currency;
  const notes: string[] = [];

  let total =
    selectedTravelCost(memory) + selectedLodgingCost(memory) + dailyCosts(memory);
  if (total <= cap) return notes;

  let excess = total - cap;

  let daily = dailyCosts(memory);
  let [factor, nextExcess] = cutCategory(daily, excess);
  excess = nextExcess;
  if (factor < 1) {
    scaleDaily(memory, factor);
    notes.push(
      `Scaled daily food/activities to ${(factor * 100).toFixed(0)}% ` +
        `so the plan stays ≤ ${cap.toFixed(0)} ${currency}.`
    );
  }

  if (excess > 1e-9) {
    const lodging = selectedLodgingCost(memory);
    [factor, nextExcess] = cutCategory(lodging, excess);
    excess = nextExcess;
    if (factor < 1) {
      scaleLodging(memory, factor);
      notes.push(
        `Scaled lodging estimates to ${(factor * 100).toFixed(0)}% ` +
          `to fit the hard cap of ${cap.toFixed(0)} ${currency}.`
      );
    }
  }

  if (excess > 1e-9) {
    const travel = selectedTravelCost(memory);
    [factor, nextExcess] = cutCategory(travel, excess);
    excess = nextExcess;
    if (factor < 1) {
      scaleTravel(memory, factor);
      notes.push(
        `Scaled travel estimates to ${(factor * 100).toFixed(0)}% ` +
          `to fit the hard cap of ${cap.toFixed(0)} ${currency}.`
      );
    }
  }

  for (let i = 0; i < 3; i++) {
    total =
      selectedTravelCost(memory) + selectedLodgingCost(memory) + dailyCosts(memory);
    if (Math.round(total * 100) / 100 <= Math.round(cap * 100) / 100) break;
    const shave = total - cap;
    const days = memory.itinerary?.days ?? [];
    if (days.length && dailyCosts(memory) > 0) {
      const per = shave / days.length;
      for (const day of days) {
        day.estimated_cost = Math.round(Math.max(day.estimated_cost - per, 0) * 100) / 100;
      }
      notes.push(
        `Trimmed daily costs by ${shave.toFixed(2)} ${currency} to clear rounding overage.`
      );
      continue;
    }
    if (memory.hotels?.recommendations?.length) {
      const target = memory.hotels.recommendations.reduce((a, b) =>
        a.total_estimate <= b.total_estimate ? a : b
      );
      target.total_estimate =
        Math.round(Math.max(target.total_estimate - shave, 0) * 100) / 100;
      if (target.nights > 0) {
        target.price_per_night =
          Math.round((target.total_estimate / target.nights) * 100) / 100;
      }
      notes.push(
        `Trimmed lodging by ${shave.toFixed(2)} ${currency} to clear rounding overage.`
      );
      continue;
    }
    if (memory.travel?.to_destination?.length) {
      const target = memory.travel.to_destination.reduce((a, b) =>
        a.estimated_cost <= b.estimated_cost ? a : b
      );
      target.estimated_cost =
        Math.round(Math.max(target.estimated_cost - shave, 0) * 100) / 100;
      notes.push(
        `Trimmed travel by ${shave.toFixed(2)} ${currency} to clear rounding overage.`
      );
    }
  }

  return notes;
}

/** Sum real plan numbers; split daily pool 50/50 food vs activities. */
export function reconcileBudget(
  memory: TripMemory,
  suggestions: string[] = []
): BudgetBreakdown {
  const r = memory.request;
  const travel = selectedTravelCost(memory);
  const lodging = selectedLodgingCost(memory);
  const daily = dailyCosts(memory);
  const food = daily * 0.5;
  const activities = daily * 0.5;
  const misc = 0;
  const total = travel + lodging + food + activities + misc;
  const cap = r.budget.amount;
  const variance = total - cap;
  return {
    travel: Math.round(travel * 100) / 100,
    lodging: Math.round(lodging * 100) / 100,
    food: Math.round(food * 100) / 100,
    activities: Math.round(activities * 100) / 100,
    misc: Math.round(misc * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency: r.budget.currency,
    within_budget: Math.round(total * 100) / 100 <= Math.round(cap * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    suggestions,
  };
}

export function tripNights(memory: TripMemory): number {
  return nights(memory);
}
