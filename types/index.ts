// ─── Core Enums ──────────────────────────────────────────────────────────────

export type GoalType =
  | 'weight_loss'
  | 'muscle_gain'
  | 'competition_prep'
  | 'maintenance';

export type Phase =
  | 'restart'
  | 'build'
  | 'sharpen'
  | 'competition_ready';

export type MotivationState =
  | 'fired_up'
  | 'steady'
  | 'struggling'
  | 'burnt_out';

export type AllergenSeverity = 'hard_block' | 'warning';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type SessionType =
  | 'full'
  | 'minimum_viable'
  | 'fallback_12min'
  | 'active_recovery';

export type TrainingType = 'heavy' | 'moderate' | 'light' | 'rest';

export type IngredientCategory =
  | 'protein'
  | 'carb'
  | 'fat'
  | 'vegetable'
  | 'condiment'
  | 'other';

export type CarbLevel = 'high' | 'moderate' | 'low';

// ─── Database Entities ────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  goal_type: GoalType;
  sport_type: string;
  current_weight_kg: number;
  target_weight_kg: number;
  height_cm: number;
  goal_deadline: string; // ISO date
  motivation_state: MotivationState;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  target_weight_kg: number;
  deadline_date: string; // ISO date
  current_phase: Phase;
  weekly_milestone_kg: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CompetitionEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_date: string; // ISO date
  event_type: string;
  weight_class_kg: number | null;
  notes: string | null;
  created_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  mood: 1 | 2 | 3 | 4 | 5;
  readiness: number; // 1–10
  soreness: 1 | 2 | 3 | 4 | 5;
  sleep_quality: 1 | 2 | 3 | 4 | 5;
  hunger_level: 1 | 2 | 3 | 4 | 5;
  motivation_state: MotivationState;
  created_at: string;
}

export interface BodyWeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  date: string; // YYYY-MM-DD
  logged_at: string;
  note: string | null;
}

export interface MealLog {
  id: string;
  user_id: string;
  meal_name: string;
  meal_type: MealType;
  ingredients: string[];
  estimated_calories: number | null;
  is_eating_out: boolean;
  allergen_flags: string[];
  date: string; // YYYY-MM-DD
  logged_at: string;
}

export interface SetEntry {
  set_number: number;
  reps: number;
  weight_kg: number | null;
  duration_seconds: number | null;
}

export interface ExerciseEntry {
  exercise_id: string;
  exercise_name: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  session_type: SessionType;
  date: string; // YYYY-MM-DD
  duration_minutes: number | null;
  rpe: number | null; // 1–10
  quality_score: number | null; // 1–10
  exercises: ExerciseEntry[];
  notes: string | null;
  logged_at: string;
}

export interface IngredientItem {
  id: string;
  user_id: string;
  ingredient_name: string;
  category: IngredientCategory;
  is_available: boolean;
  created_at: string;
}

export interface AllergyRule {
  id: string;
  user_id: string;
  allergen_name: string;
  severity: AllergenSeverity;
  is_trigger_food: boolean;
  notes: string | null;
  created_at: string;
}

export interface MealSuggestion {
  meal_type: MealType;
  suggestion_name: string;
  ingredients_needed: string[];
  estimated_calories: number;
  is_feasible_from_inventory: boolean;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  phase: Phase;
  focus_statement: string;
  must_do_workouts: string[];
  meal_suggestions: MealSuggestion[];
  non_negotiables: string[];
  is_low_willpower_day: boolean;
  flour_free_reminder: boolean;
  generated_at: string;
}

export interface AdherenceScore {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  score: number; // 0–100
  meal_logged: boolean;
  workout_logged: boolean;
  weight_logged: boolean;
  checkin_completed: boolean;
  flour_free: boolean;
  updated_at: string;
}

// ─── AI Module Input / Output Types ──────────────────────────────────────────

export interface PlannerInput {
  goal_deadline: string;
  current_weight_kg: number;
  target_weight_kg: number;
  motivation_state: MotivationState;
}

export interface PlannerOutput {
  phase: Phase;
  deadline_days: number;
  focus_statement: string;
  weekly_target_kg_loss: number;
  daily_calorie_guidance: { training_day: number; rest_day: number };
  non_negotiables: string[];
}

export interface NutritionInput {
  ingredient_inventory: IngredientItem[];
  allergy_rules: AllergyRule[];
  phase: Phase;
  training_type_today: TrainingType;
}

export interface NutritionOutput {
  meal_suggestions: MealSuggestion[];
  blocked_ingredients: string[];
  warned_ingredients: string[];
  flour_free_status: boolean;
  carb_level: CarbLevel;
}

export interface TrainingInput {
  sport_type: string;
  phase: Phase;
  readiness_score: number; // 1–10
  available_time_minutes: number;
  recent_sessions?: WorkoutSession[]; // last 14 days for diary-aware planning
}

export interface TrainingOutput {
  session_type: SessionType;
  recommended_exercises: string[];
  fallback_12min: string[];
  estimated_duration_minutes: number;
  rpe_target: number;
  diary_context?: string; // e.g. "Last session was Full (RPE 8) on Mon"
  avoided_muscle_groups?: string[]; // muscle groups rested from recent training
}

export interface DayLogs {
  meal_logged: boolean;
  workout_logged: boolean;
  weight_logged: boolean;
  checkin_completed: boolean;
  flour_free: boolean;
}

export interface AdherenceInput {
  logs_today: DayLogs;
  logs_last_7_days: DayLogs[];
  mood_checkin: DailyCheckin | null;
}

export interface AdherenceOutput {
  score: number; // 0–100
  low_willpower_mode: boolean;
  recovery_message: string;
  current_streak: number;
  flour_free_streak: number;
}

export interface SafetyInput {
  daily_calories: number | null;
  weight_trend: number[]; // kg values, oldest first
  allergen_flags_today: string[];
  allergy_rules: AllergyRule[];
}

export type SafetyWarningType =
  | 'low_calories'
  | 'rapid_weight_loss'
  | 'allergen_detected';

export interface SafetyWarning {
  type: SafetyWarningType;
  message: string;
  severity: 'warning' | 'critical';
}

export interface SafetyOutput {
  warnings: SafetyWarning[];
  is_safe: boolean;
}

// ─── Weekly Report ────────────────────────────────────────────────────────────

export interface WeeklyReport {
  adherence_avg: number;
  weight_change_kg: number;
  flour_free_streak: number;
  training_sessions_count: number;
  suggestions: string[];
}

// ─── Exercise Template ────────────────────────────────────────────────────────

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'bodyweight'
  | 'machine'
  | 'cable'
  | 'kettlebell'
  | 'resistance_band';

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscle_groups: string[];
  sport_tags: string[];
  is_compound: boolean;
  equipment: EquipmentType;
  fallback_friendly: boolean; // can be done in 12-min session
}

// ─── Meal Template ────────────────────────────────────────────────────────────

export interface MealTemplate {
  id: string;
  name: string;
  meal_type: MealType;
  required_ingredients: string[];
  optional_ingredients: string[];
  estimated_calories: number;
  carb_level: CarbLevel;
  allergens: string[];
  phase_suitable: Phase[];
}

// ─── Mascot ───────────────────────────────────────────────────────────────────

export type MascotExpression =
  | 'happy'
  | 'encouraging'
  | 'celebrating'
  | 'concerned'
  | 'tired';

// ─── Onboarding State ─────────────────────────────────────────────────────────

export interface OnboardingData {
  display_name: string;
  goal_type: GoalType;
  deadline_date: string;
  target_weight_kg: number;
  current_weight_kg: number;
  height_cm: number;
  sport_type: string;
  training_days_per_week: number;
  allergens: Array<{ name: string; severity: AllergenSeverity; is_trigger: boolean }>;
  motivation_state: MotivationState;
  ingredients: Array<{ name: string; category: IngredientCategory }>;
  has_competition: boolean;
  competition_name: string;
  competition_date: string;
}
