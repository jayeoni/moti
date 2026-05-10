import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  computeRollingAverage,
  SmoothedWeight,
  weightTrend,
} from '../lib/utils/weightUtils';
import { BodyWeightLog } from '../types';
import { useAuth } from './useAuth';

interface WeightTrendState {
  raw: BodyWeightLog[];
  smoothed: SmoothedWeight[];
  trend: 'down' | 'up' | 'stable';
  latestWeight: number | null;
  loading: boolean;
  refresh: () => void;
}

export function useWeightTrend(days = 30): WeightTrendState {
  const { user } = useAuth();
  const [raw, setRaw] = useState<BodyWeightLog[]>([]);
  const [smoothed, setSmoothed] = useState<SmoothedWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, tick]);

  async function load() {
    setLoading(true);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const { data, error } = await supabase
      .from('body_weight_logs')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', cutoff.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!error && data) {
      const logs = data as BodyWeightLog[];
      setRaw(logs);
      const s = computeRollingAverage(logs);
      setSmoothed(s);
    }
    setLoading(false);
  }

  const trend = weightTrend(smoothed);
  const latestWeight =
    raw.length > 0 ? raw[raw.length - 1].weight_kg : null;

  return { raw, smoothed, trend, latestWeight, loading, refresh: () => setTick((t) => t + 1) };
}
