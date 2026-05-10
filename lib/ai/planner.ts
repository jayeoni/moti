import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import { MotivationState, Phase, PlannerInput, PlannerOutput } from '../../types';

const PHASE_FOCUS: Record<Phase, string> = {
  competition_ready: 'Final countdown — stay the course, trust your prep.',
  sharpen: 'Dial in every detail. Precision is your superpower.',
  build: 'Build consistency. Each rep and meal compounds.',
  restart: 'Start fresh, start kind. Small wins rebuild momentum.',
};

const PHASE_NON_NEGOTIABLES: Record<Phase, string[]> = {
  competition_ready: ['Morning weigh-in', 'No flour today', 'Sleep 8 hours'],
  sharpen: ['Morning weigh-in', 'Hit your training session', 'Track every meal'],
  build: ['Log your weight', 'Complete your workout', 'Eat mostly home food'],
  restart: ['One healthy meal logged', '10 minutes of movement', 'No flour today'],
};

const PHASE_CALORIES: Record<
  Phase,
  { training_day: number; rest_day: number }
> = {
  competition_ready: { training_day: 1800, rest_day: 1600 },
  sharpen: { training_day: 1900, rest_day: 1650 },
  build: { training_day: 2000, rest_day: 1750 },
  restart: { training_day: 2100, rest_day: 1850 },
};

function determinePhase(deadlineDays: number): Phase {
  if (deadlineDays < 7) return 'competition_ready';
  if (deadlineDays < 14) return 'sharpen';
  if (deadlineDays < 21) return 'build';
  return 'restart';
}

function adjustFocusForMotivation(
  focus: string,
  motivation: MotivationState
): string {
  if (motivation === 'struggling' || motivation === 'burnt_out') {
    return 'Low energy is okay. Just show up — even a little counts today.';
  }
  if (motivation === 'fired_up') {
    return focus + ' Channel that energy wisely.';
  }
  return focus;
}

export function generatePlan(input: PlannerInput): PlannerOutput {
  const deadlineDays = differenceInCalendarDays(
    parseISO(input.goal_deadline),
    startOfDay(new Date())
  );

  const phase = determinePhase(Math.max(0, deadlineDays));
  const weightGap = Math.max(0, input.current_weight_kg - input.target_weight_kg);
  const weeksRemaining = Math.max(1, deadlineDays / 7);
  const weeklyTargetKg = Math.min(weightGap / weeksRemaining, 1.0);

  const focusStatement = adjustFocusForMotivation(
    PHASE_FOCUS[phase],
    input.motivation_state
  );

  return {
    phase,
    deadline_days: deadlineDays,
    focus_statement: focusStatement,
    weekly_target_kg_loss: Math.round(weeklyTargetKg * 100) / 100,
    daily_calorie_guidance: PHASE_CALORIES[phase],
    non_negotiables: PHASE_NON_NEGOTIABLES[phase],
  };
}
