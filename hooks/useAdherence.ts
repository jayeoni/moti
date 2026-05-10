import { useEffect, useState } from 'react';
import { calculateAdherence } from '../lib/ai/adherence';
import { supabase } from '../lib/supabase';
import { AdherenceOutput, AdherenceScore, DailyCheckin, DayLogs } from '../types';
import { getWeekDates, todayString } from '../lib/utils/dateUtils';
import { useAuth } from './useAuth';

interface AdherenceState {
  output: AdherenceOutput | null;
  todayScore: AdherenceScore | null;
  weekHistory: AdherenceScore[];
  loading: boolean;
  refresh: () => void;
}

function scoreToDayLogs(score: AdherenceScore | null): DayLogs {
  if (!score) {
    return {
      meal_logged: false,
      workout_logged: false,
      weight_logged: false,
      checkin_completed: false,
      flour_free: true,
    };
  }
  return {
    meal_logged: score.meal_logged,
    workout_logged: score.workout_logged,
    weight_logged: score.weight_logged,
    checkin_completed: score.checkin_completed,
    flour_free: score.flour_free,
  };
}

export function useAdherence(): AdherenceState {
  const { user } = useAuth();
  const [weekHistory, setWeekHistory] = useState<AdherenceScore[]>([]);
  const [todayScore, setTodayScore] = useState<AdherenceScore | null>(null);
  const [output, setOutput] = useState<AdherenceOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, tick]);

  async function load() {
    setLoading(true);
    const today = todayString();
    const weekDates = getWeekDates();

    const [scoresRes, checkinRes] = await Promise.all([
      supabase
        .from('adherence_scores')
        .select('*')
        .eq('user_id', user!.id)
        .in('date', weekDates)
        .order('date', { ascending: true }),
      supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', today)
        .maybeSingle(),
    ]);

    const scores = (scoresRes.data ?? []) as AdherenceScore[];
    const checkin = checkinRes.data as DailyCheckin | null;

    setWeekHistory(scores);
    const todayAdherence = scores.find((s) => s.date === today) ?? null;
    setTodayScore(todayAdherence);

    const last7 = weekDates.slice(0, 6).map((d) => {
      const found = scores.find((s) => s.date === d);
      return scoreToDayLogs(found ?? null);
    });

    const computed = calculateAdherence({
      logs_today: scoreToDayLogs(todayAdherence),
      logs_last_7_days: last7,
      mood_checkin: checkin,
    });
    setOutput(computed);
    setLoading(false);
  }

  return {
    output,
    todayScore,
    weekHistory,
    loading,
    refresh: () => setTick((t) => t + 1),
  };
}
