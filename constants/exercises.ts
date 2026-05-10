import { ExerciseTemplate } from '../types';

export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // ─── Compound Barbell ───────────────────────────────────────────────────────
  { id: 'back_squat', name: 'Back Squat', muscle_groups: ['quads', 'glutes', 'core'], sport_tags: ['powerlifting', 'bodybuilding', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'front_squat', name: 'Front Squat', muscle_groups: ['quads', 'core'], sport_tags: ['powerlifting', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'bench_press', name: 'Bench Press', muscle_groups: ['chest', 'triceps', 'shoulders'], sport_tags: ['powerlifting', 'bodybuilding', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'incline_press', name: 'Incline Bench Press', muscle_groups: ['chest', 'shoulders'], sport_tags: ['bodybuilding', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'deadlift', name: 'Deadlift', muscle_groups: ['hamstrings', 'glutes', 'back', 'core'], sport_tags: ['powerlifting', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'rdl', name: 'Romanian Deadlift', muscle_groups: ['hamstrings', 'glutes'], sport_tags: ['powerlifting', 'bodybuilding', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'overhead_press', name: 'Overhead Press', muscle_groups: ['shoulders', 'triceps', 'core'], sport_tags: ['powerlifting', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'barbell_row', name: 'Barbell Row', muscle_groups: ['back', 'biceps'], sport_tags: ['powerlifting', 'bodybuilding', 'general'], is_compound: true, equipment: 'barbell', fallback_friendly: false },
  { id: 'power_clean', name: 'Power Clean', muscle_groups: ['full_body'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'barbell', fallback_friendly: false },

  // ─── Dumbbell ───────────────────────────────────────────────────────────────
  { id: 'db_press', name: 'Dumbbell Bench Press', muscle_groups: ['chest', 'triceps'], sport_tags: ['bodybuilding', 'general'], is_compound: true, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'db_row', name: 'Dumbbell Row', muscle_groups: ['back', 'biceps'], sport_tags: ['bodybuilding', 'general'], is_compound: true, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'db_shoulder_press', name: 'Dumbbell Shoulder Press', muscle_groups: ['shoulders', 'triceps'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'db_curl', name: 'Dumbbell Bicep Curl', muscle_groups: ['biceps'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'db_lateral_raise', name: 'Lateral Raise', muscle_groups: ['shoulders'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'db_tricep_ext', name: 'Overhead Tricep Extension', muscle_groups: ['triceps'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'goblet_squat', name: 'Goblet Squat', muscle_groups: ['quads', 'glutes', 'core'], sport_tags: ['general', 'powerlifting'], is_compound: true, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'db_lunge', name: 'Dumbbell Lunge', muscle_groups: ['quads', 'glutes'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'db_rdl', name: 'Dumbbell RDL', muscle_groups: ['hamstrings', 'glutes'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'dumbbell', fallback_friendly: true },
  { id: 'farmers_carry', name: "Farmer's Carry", muscle_groups: ['grip', 'core', 'traps'], sport_tags: ['powerlifting', 'general'], is_compound: true, equipment: 'dumbbell', fallback_friendly: false },

  // ─── Bodyweight ─────────────────────────────────────────────────────────────
  { id: 'pushup', name: 'Push-Up', muscle_groups: ['chest', 'triceps', 'shoulders'], sport_tags: ['general', 'running', 'bodybuilding'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'pike_pushup', name: 'Pike Push-Up', muscle_groups: ['shoulders', 'triceps'], sport_tags: ['general'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'pullup', name: 'Pull-Up', muscle_groups: ['back', 'biceps'], sport_tags: ['general', 'bodybuilding'], is_compound: true, equipment: 'bodyweight', fallback_friendly: false },
  { id: 'chinup', name: 'Chin-Up', muscle_groups: ['back', 'biceps'], sport_tags: ['general'], is_compound: true, equipment: 'bodyweight', fallback_friendly: false },
  { id: 'dip', name: 'Tricep Dip', muscle_groups: ['triceps', 'chest'], sport_tags: ['general', 'bodybuilding'], is_compound: true, equipment: 'bodyweight', fallback_friendly: false },
  { id: 'squat_bw', name: 'Bodyweight Squat', muscle_groups: ['quads', 'glutes'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'lunge_bw', name: 'Bodyweight Lunge', muscle_groups: ['quads', 'glutes'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'glute_bridge', name: 'Glute Bridge', muscle_groups: ['glutes', 'hamstrings'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'hip_thrust_bw', name: 'Bodyweight Hip Thrust', muscle_groups: ['glutes'], sport_tags: ['general', 'bodybuilding'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'plank', name: 'Plank', muscle_groups: ['core'], sport_tags: ['general', 'running', 'powerlifting'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'side_plank', name: 'Side Plank', muscle_groups: ['core', 'obliques'], sport_tags: ['general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'mountain_climber', name: 'Mountain Climber', muscle_groups: ['core', 'shoulders'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'burpee', name: 'Burpee', muscle_groups: ['full_body'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'jumping_jack', name: 'Jumping Jack', muscle_groups: ['full_body'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'high_knee', name: 'High Knees', muscle_groups: ['quads', 'core'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'calf_raise', name: 'Calf Raise', muscle_groups: ['calves'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'situp', name: 'Sit-Up', muscle_groups: ['core'], sport_tags: ['general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'leg_raise', name: 'Lying Leg Raise', muscle_groups: ['core', 'hip_flexors'], sport_tags: ['general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'dead_bug', name: 'Dead Bug', muscle_groups: ['core'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },

  // ─── Machine / Cable ────────────────────────────────────────────────────────
  { id: 'leg_press', name: 'Leg Press', muscle_groups: ['quads', 'glutes'], sport_tags: ['powerlifting', 'bodybuilding', 'general'], is_compound: true, equipment: 'machine', fallback_friendly: false },
  { id: 'leg_curl', name: 'Leg Curl', muscle_groups: ['hamstrings'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'machine', fallback_friendly: false },
  { id: 'leg_ext', name: 'Leg Extension', muscle_groups: ['quads'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'machine', fallback_friendly: false },
  { id: 'lat_pulldown', name: 'Lat Pulldown', muscle_groups: ['back', 'biceps'], sport_tags: ['bodybuilding', 'general'], is_compound: true, equipment: 'cable', fallback_friendly: false },
  { id: 'cable_row', name: 'Seated Cable Row', muscle_groups: ['back', 'biceps'], sport_tags: ['bodybuilding', 'general'], is_compound: true, equipment: 'cable', fallback_friendly: false },
  { id: 'cable_fly', name: 'Cable Fly', muscle_groups: ['chest'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'cable', fallback_friendly: false },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscle_groups: ['triceps'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'cable', fallback_friendly: false },
  { id: 'face_pull', name: 'Face Pull', muscle_groups: ['shoulders', 'rear_delt'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'cable', fallback_friendly: false },
  { id: 'cable_curl', name: 'Cable Curl', muscle_groups: ['biceps'], sport_tags: ['bodybuilding', 'general'], is_compound: false, equipment: 'cable', fallback_friendly: false },

  // ─── Cardio / Conditioning ──────────────────────────────────────────────────
  { id: 'brisk_walk', name: 'Brisk Walk', muscle_groups: ['full_body'], sport_tags: ['general', 'running', 'powerlifting', 'bodybuilding'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'jog', name: 'Easy Jog', muscle_groups: ['full_body'], sport_tags: ['running', 'general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'jump_rope', name: 'Jump Rope', muscle_groups: ['calves', 'core'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'step_up', name: 'Step-Up', muscle_groups: ['quads', 'glutes'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'box_jump', name: 'Box Jump', muscle_groups: ['quads', 'glutes'], sport_tags: ['general', 'running'], is_compound: true, equipment: 'bodyweight', fallback_friendly: false },

  // ─── Mobility / Recovery ────────────────────────────────────────────────────
  { id: 'hip_flexor_stretch', name: 'Hip Flexor Stretch', muscle_groups: ['hip_flexors'], sport_tags: ['general', 'running', 'powerlifting'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'pigeon_pose', name: 'Pigeon Pose', muscle_groups: ['glutes', 'hip_flexors'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'cat_cow', name: 'Cat-Cow', muscle_groups: ['spine', 'core'], sport_tags: ['general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'thoracic_rotation', name: 'Thoracic Rotation', muscle_groups: ['spine', 'core'], sport_tags: ['general', 'powerlifting'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'world_greatest_stretch', name: 'World Greatest Stretch', muscle_groups: ['full_body'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'ankle_circles', name: 'Ankle Circles', muscle_groups: ['ankles'], sport_tags: ['general', 'running'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
];

// Exercises for the 12-minute fallback session
export const FALLBACK_12MIN: ExerciseTemplate[] = [
  { id: 'pushup', name: 'Push-Up', muscle_groups: ['chest', 'triceps', 'shoulders'], sport_tags: ['general'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'squat_bw', name: 'Bodyweight Squat', muscle_groups: ['quads', 'glutes'], sport_tags: ['general'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'glute_bridge', name: 'Glute Bridge', muscle_groups: ['glutes', 'hamstrings'], sport_tags: ['general'], is_compound: true, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'plank', name: 'Plank', muscle_groups: ['core'], sport_tags: ['general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'mountain_climber', name: 'Mountain Climber', muscle_groups: ['core', 'shoulders'], sport_tags: ['general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
  { id: 'jumping_jack', name: 'Jumping Jack', muscle_groups: ['full_body'], sport_tags: ['general'], is_compound: false, equipment: 'bodyweight', fallback_friendly: true },
];
