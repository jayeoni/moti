import { EXERCISE_TEMPLATES, FALLBACK_12MIN } from '../../constants/exercises';
import { Phase, SessionType, TrainingInput, TrainingOutput } from '../../types';

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

function getRpeTarget(phase: Phase, readiness: number): number {
  const base = BASE_RPE[phase];
  const mod = readiness < 5 ? -2 : readiness > 7 ? 1 : 0;
  return Math.min(10, Math.max(3, base + mod));
}

function selectExercises(
  sportType: string,
  phase: Phase,
  sessionType: SessionType
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

  const count = PHASE_SESSION_COUNTS[phase];
  const compounds = sportFiltered
    .filter((e) => e.is_compound)
    .slice(0, Math.ceil(count / 2));
  const accessories = sportFiltered
    .filter((e) => !e.is_compound)
    .slice(0, Math.floor(count / 2));

  return [...compounds, ...accessories].map((e) => e.name);
}

function estimateDuration(exerciseNames: string[], sessionType: SessionType): number {
  if (sessionType === 'fallback_12min') return 12;
  if (sessionType === 'minimum_viable') return 20;
  if (sessionType === 'active_recovery') return 30;
  return exerciseNames.length * 8; // ~8 min per exercise including rest
}

export function generateTrainingPlan(input: TrainingInput): TrainingOutput {
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

  const recommended = selectExercises(
    input.sport_type,
    input.phase,
    sessionType
  );

  const fallback = FALLBACK_12MIN.map((e) => e.name);
  const rpeTarget = getRpeTarget(input.phase, input.readiness_score);
  const duration = estimateDuration(recommended, sessionType);

  return {
    session_type: sessionType,
    recommended_exercises: recommended,
    fallback_12min: fallback,
    estimated_duration_minutes: duration,
    rpe_target: rpeTarget,
  };
}
