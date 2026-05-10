import { useEffect, useState } from 'react';
import { calculateAdherence } from '../lib/ai/adherence';
import { suggestMeals } from '../lib/ai/nutrition';
import { generatePlan } from '../lib/ai/planner';
import { runSafetyChecks } from '../lib/ai/safety';
import { generateTrainingPlan } from '../lib/ai/training';
import { supabase } from '../lib/supabase';
import { todayString } from '../lib/utils/dateUtils';
import {
  AdherenceOutput,
  AdherenceScore,
  AllergyRule,
  DailyCheckin,
  DailyPlan,
  Goal,
  IngredientItem,
  MealLog,
  Profile,
  SafetyOutput,
  WorkoutSession,
} from '../types';
import { useAuth } from './useAuth';

interface TodayState {
  dailyPlan: DailyPlan | null;
  adherence: AdherenceOutput | null;
  safety: SafetyOutput | null;
  checkin: DailyCheckin | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useToday(): TodayState {
  const { user } = useAuth();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [adherence, setAdherence] = useState<AdherenceOutput | null>(null);
  const [safety, setSafety] = useState<SafetyOutput | null>(null);
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
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
    const today = todayString();

    try {
      const [
        profileRes,
        goalRes,
        checkinRes,
        mealLogsRes,
        workoutRes,
        weightLogsRes,
        inventoryRes,
        allergyRes,
        existingPlanRes,
        adherenceRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
        supabase.from('goals').select('*').eq('user_id', user!.id).eq('is_active', true).limit(1).maybeSingle(),
        supabase.from('daily_checkins').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
        supabase.from('meal_logs').select('*').eq('user_id', user!.id).eq('date', today),
        supabase.from('workout_sessions').select('*').eq('user_id', user!.id).eq('date', today),
        supabase.from('body_weight_logs').select('*').eq('user_id', user!.id).order('date', { ascending: true }).limit(30),
        supabase.from('ingredient_inventory').select('*').eq('user_id', user!.id).eq('is_available', true),
        supabase.from('allergy_rules').select('*').eq('user_id', user!.id),
        supabase.from('daily_plans').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
        supabase.from('adherence_scores').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
      ]);

      const profile = profileRes.data as Profile | null;
      const goal = goalRes.data as Goal | null;
      const todayCheckin = checkinRes.data as DailyCheckin | null;
      const mealLogs = (mealLogsRes.data ?? []) as MealLog[];
      const workoutLogs = (workoutRes.data ?? []) as WorkoutSession[];
      const weightLogs = weightLogsRes.data ?? [];
      const inventory = (inventoryRes.data ?? []) as IngredientItem[];
      const allergyRules = (allergyRes.data ?? []) as AllergyRule[];
      const existingPlan = existingPlanRes.data as DailyPlan | null;
      const todayAdherence = adherenceRes.data as AdherenceScore | null;

      setCheckin(todayCheckin);

      // ── Run AI modules ────────────────────────────────────────────────────
      let plan = existingPlan;

      if (!existingPlan && profile && goal) {
        const plannerOut = generatePlan({
          goal_deadline: goal.deadline_date,
          current_weight_kg: profile.current_weight_kg,
          target_weight_kg: goal.target_weight_kg,
          motivation_state: profile.motivation_state,
        });

        const nutritionOut = suggestMeals({
          ingredient_inventory: inventory,
          allergy_rules: allergyRules,
          phase: plannerOut.phase,
          training_type_today: 'moderate',
        });

        const trainingOut = generateTrainingPlan({
          sport_type: profile.sport_type ?? 'general',
          phase: plannerOut.phase,
          readiness_score: todayCheckin?.readiness ?? 6,
          available_time_minutes: 60,
        });

        const adherenceCheck = calculateAdherence({
          logs_today: {
            meal_logged: mealLogs.length > 0,
            workout_logged: workoutLogs.length > 0,
            weight_logged: weightLogs.some((w: any) => w.date === today),
            checkin_completed: !!todayCheckin,
            flour_free: !allergyRules
              .filter((r) => r.severity === 'hard_block')
              .some((r) =>
                mealLogs.some((m) =>
                  m.allergen_flags.includes(r.allergen_name.toLowerCase())
                )
              ),
          },
          logs_last_7_days: [],
          mood_checkin: todayCheckin,
        });

        const newPlan: Omit<DailyPlan, 'id'> = {
          user_id: user!.id,
          date: today,
          phase: plannerOut.phase,
          focus_statement: plannerOut.focus_statement,
          must_do_workouts: trainingOut.recommended_exercises,
          meal_suggestions: nutritionOut.meal_suggestions,
          non_negotiables: plannerOut.non_negotiables,
          is_low_willpower_day: adherenceCheck.low_willpower_mode,
          flour_free_reminder: nutritionOut.flour_free_status,
          generated_at: new Date().toISOString(),
        };

        const { data: inserted } = await supabase
          .from('daily_plans')
          .upsert(newPlan)
          .select()
          .single();

        plan = inserted as DailyPlan | null;
      }

      setDailyPlan(plan);

      // ── Adherence ─────────────────────────────────────────────────────────
      const allergenFlagsToday = mealLogs.flatMap((m) => m.allergen_flags);
      const totalCalories = mealLogs.reduce(
        (sum, m) => sum + (m.estimated_calories ?? 0),
        0
      );

      const safetyOut = runSafetyChecks({
        daily_calories: totalCalories || null,
        weight_trend: weightLogs.map((w: any) => w.weight_kg),
        allergen_flags_today: allergenFlagsToday,
        allergy_rules: allergyRules,
      });
      setSafety(safetyOut);

      const adherenceOut = calculateAdherence({
        logs_today: {
          meal_logged: mealLogs.length > 0,
          workout_logged: workoutLogs.length > 0,
          weight_logged: weightLogs.some((w: any) => w.date === today),
          checkin_completed: !!todayCheckin,
          flour_free: allergenFlagsToday.length === 0,
        },
        logs_last_7_days: [],
        mood_checkin: todayCheckin,
      });
      setAdherence(adherenceOut);

      // ── Upsert adherence score ─────────────────────────────────────────────
      await supabase.from('adherence_scores').upsert({
        user_id: user!.id,
        date: today,
        score: adherenceOut.score,
        meal_logged: mealLogs.length > 0,
        workout_logged: workoutLogs.length > 0,
        weight_logged: weightLogs.some((w: any) => w.date === today),
        checkin_completed: !!todayCheckin,
        flour_free: allergenFlagsToday.length === 0,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      setError(e.message ?? 'Failed to load today data');
    } finally {
      setLoading(false);
    }
  }

  return {
    dailyPlan,
    adherence,
    safety,
    checkin,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}
