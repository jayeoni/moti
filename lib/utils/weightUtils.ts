import { BodyWeightLog } from '../../types';

export interface SmoothedWeight {
  date: string;
  weight_kg: number;
  smoothed: number;
}

export function computeRollingAverage(
  weights: BodyWeightLog[],
  window = 7
): SmoothedWeight[] {
  return weights.map((entry, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = weights.slice(start, i + 1);
    const avg = slice.reduce((sum, w) => sum + w.weight_kg, 0) / slice.length;
    return {
      date: entry.date,
      weight_kg: entry.weight_kg,
      smoothed: Math.round(avg * 10) / 10,
    };
  });
}

export function weeklyLossRate(weights: BodyWeightLog[]): number {
  if (weights.length < 7) return 0;
  const recent = weights[weights.length - 1].weight_kg;
  const weekAgo = weights[weights.length - 7].weight_kg;
  return weekAgo - recent;
}

export function weightTrend(weights: SmoothedWeight[]): 'down' | 'up' | 'stable' {
  if (weights.length < 3) return 'stable';
  const last = weights[weights.length - 1].smoothed;
  const prev = weights[weights.length - 3].smoothed;
  const diff = prev - last;
  if (diff > 0.2) return 'down';
  if (diff < -0.2) return 'up';
  return 'stable';
}
