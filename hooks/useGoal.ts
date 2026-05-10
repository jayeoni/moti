import { useEffect, useState } from 'react';
import { generatePlan } from '../lib/ai/planner';
import { supabase } from '../lib/supabase';
import { Goal, Phase, PlannerOutput, Profile } from '../types';
import { useAuth } from './useAuth';

interface GoalState {
  goal: Goal | null;
  profile: Profile | null;
  plan: PlannerOutput | null;
  phase: Phase | null;
  deadlineDays: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useGoal(): GoalState {
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<PlannerOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, tick]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, goalRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user!.id)
          .single(),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user!.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (profileRes.error) throw profileRes.error;
      const p = profileRes.data as Profile;
      setProfile(p);

      const g = goalRes.data as Goal | null;
      setGoal(g);

      if (p && g) {
        const computed = generatePlan({
          goal_deadline: g.deadline_date,
          current_weight_kg: p.current_weight_kg,
          target_weight_kg: g.target_weight_kg,
          motivation_state: p.motivation_state,
        });
        setPlan(computed);

        // Sync phase back to DB if changed
        if (g.current_phase !== computed.phase) {
          supabase
            .from('goals')
            .update({ current_phase: computed.phase })
            .eq('id', g.id)
            .then(() => {});
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load goal');
    } finally {
      setLoading(false);
    }
  }

  return {
    goal,
    profile,
    plan,
    phase: plan?.phase ?? null,
    deadlineDays: plan?.deadline_days ?? 0,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}
