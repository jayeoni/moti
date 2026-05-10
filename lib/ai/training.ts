import { EXERCISE_TEMPLATES, FALLBACK_12MIN } from '../../constants/exercises';
import { Phase, SessionType, TrainingInput, TrainingOutput, WorkoutSession } from '../../types';

const BASE_RPE: Record<Phase, number> = {
  competition_ready: 7,
  sharpen: 8,
  build: 7,
  restart: 5,
};

const PHASE_SESSION_COUNTS: Record<Phase, number> = {
  competition_ready: 4,
  sharpen: 5,
  build: 5,
  restart: 3,
};

function getRpeTarget(phase: Phase, readiness: number, recentAvgRpe: number | null): number {
  const base = BASE_RPE[phase];
  const readinessMod = readiness < 5 ? -2 : readiness > 7 ? 1 : 0;
  // If user has been consistently high RPE (≥9), nudge down slightly to avoid overtraining
  const rpeMod = recentAvgRpe !== null && recentAvgRpe >= 9 ? -1 : 0;
  return Math.min(10, Math.max(3, base + readinessMod + rpeMod));
}

function getRecentlyTrainedMuscles(sessions: WorkoutSession[], withinHours = 48): string[] {
  const cutoff = Date.now() - withinHours * 60 * 60 * 1000;
  const recentNames = new Set<string>();
  for (const s of sessions) {
    const sessionTime = new Date(s.logged_at ?? s.date).getTime();
    if (sessionTime >= cutoff) {
      for (const ex of s.exercises) {
        recentNames.add(ex.exercise_name.toLowerCase());
      }
    }
  }
  // Map exercise names back to muscle groups
  const trained = new Set<string>();
  for (const tmpl of EXERCISE_TEMPLATES) {
    if (recentNames.has(tmpl.name.toLowerCase())) {
      tmpl.muscle_groups.forEach((m) => trained.add(m));
    }
  }
  return Array.from(trained);
}

function getRecentAvgRpe(sessions: WorkoutSession[], limit = 3): number | null {
  const withRpe = sessions.filter((s) => s.rpe !== null).slice(0, limit);
  if (withRpe.length === 0) return null;
  return withRpe.reduce((sum, s) => sum + (s.rpe ?? 0), 0) / withRpe.length;
}

function buildDiaryContext(sessions: WorkoutSession[]): string | undefined {
  if (sessions.length === 0) return undefined;
  const last = sessions[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[new Date(last.date).getDay()];
  const typeLabel: Record<SessionType, string> = {
    full: 'Full Session',
    minimum_viable: 'Minimum Viable',
    fallback_12min: '12-Min Fallback',
    active_recovery: 'Active Recovery',
  };
  const parts = [`Last: ${typeLabel[last.session_type]} on ${dayName}`];
  if (last.rpe) parts.push(`RPE ${last.rpe}`);
  if (last.exercises.length > 0) {
    parts.push(`(${last.exercises.slice(0, 2).map((e) => e.exercise_name).join(', ')}${last.exercises.length > 2 ? ` +${last.exercises.length - 2}` : ''})`);
  }
  return parts.join(' · ');
}

function selectExercises(
  sportType: string,
  phase: Phase,
  sessionType: SessionType,
  avoidMuscles: string[]
): string[] {
  const sportFiltered = EXERCISE_TEMPLATES.filter(
    (e) =>
      e.sport_tags.includes(sportType.toLowerCase()) ||
      e.sport_tags.includes('general')
  );

  if (sessionType === 'fallback_12min') {
    return FALLBACK_12MIN.map((e) => e.name);
  }

  if (sessionType === 'minimum_viable') {
    const bodyweight = sportFiltered
      .filter((e) => e.fallback_friendly)
      .slice(0, 3);
    return bodyweight.map((e) => e.name);
  }

  // Prefer exercises whose muscle groups are NOT in the avoid list (recently trained)
  const rested = sportFiltered.filter(
    (e) => !e.muscle_groups.some((m) => avoidMuscles.includes(m))
  );
  const pool = rested.length >= 2 ? rested : sportFiltered;

  const count = PHASE_SESSION_COUNTS[phase];
  const compounds = pool.filter((e) => e.is_compound).slice(0, Math.ceil(count / 2));
  const accessories = pool.filter((e) => !e.is_compound).slice(0, Math.floor(count / 2));

  return [...compounds, ...accessories].map((e) => e.name);
}

function estimateDuration(exerciseNames: string[], sessionType: SessionType): number {
  if (sessionType === 'fallback_12min') return 12;
  if (sessionType === 'minimum_viable') return 20;
  if (sessionType === 'active_recovery') return 30;
  return exerciseNames.length * 8;
}

export function generateTrainingPlan(input: TrainingInput): TrainingOutput {
  const recent = input.recent_sessions ?? [];
  const recentAvgRpe = getRecentAvgRpe(recent);
  const avoidMuscles = getRecentlyTrainedMuscles(recent, 48);
  const diaryContext = buildDiaryContext(recent);

  let sessionType: SessionType;
  if (input.available_time_minutes < 20) {
    sessionType = 'fallback_12min';
  } else if (input.readiness_score < 4) {
    sessionType = 'active_recovery';
  } else if (input.readiness_score < 6 || input.available_time_minutes < 40) {
    sessionType = 'minimum_viable';
  } else {
    sessionType = 'full';
  }

  const recommended = selectExercises(input.sport_type, input.phase, sessionType, avoidMuscles);
  const fallback = FALLBACK_12MIN.map((e) => e.name);
  const rpeTarget = getRpeTarget(input.phase, input.readiness_score, recentAvgRpe);
  const duration = estimateDuration(recommended, sessionType);

  return {
    session_type: sessionType,
    recommended_exercises: recommended,
    fallback_12min: fallback,
    estimated_duration_minutes: duration,
    rpe_target: rpeTarget,
    diary_context: diaryContext,
    avoided_muscle_groups: avoidMuscles.length > 0 ? avoidMuscles : undefined,
  };
}
