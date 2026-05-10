-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text not null,
  goal_type text not null check (goal_type in ('weight_loss','muscle_gain','competition_prep','maintenance')),
  sport_type text,
  current_weight_kg numeric(5,2) not null,
  target_weight_kg numeric(5,2) not null,
  height_cm integer not null,
  goal_deadline date not null,
  motivation_state text not null check (motivation_state in ('fired_up','steady','struggling','burnt_out')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Goals ────────────────────────────────────────────────────────────────────
create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_type text not null,
  target_weight_kg numeric(5,2) not null,
  deadline_date date not null,
  current_phase text not null check (current_phase in ('restart','build','sharpen','competition_ready')),
  weekly_milestone_kg numeric(4,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Competition Events ────────────────────────────────────────────────────────
create table competition_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_name text not null,
  event_date date not null,
  event_type text not null,
  weight_class_kg numeric(5,2),
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Daily Checkins ───────────────────────────────────────────────────────────
create table daily_checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  mood integer not null check (mood between 1 and 5),
  readiness integer not null check (readiness between 1 and 10),
  soreness integer not null check (soreness between 1 and 5),
  sleep_quality integer not null check (sleep_quality between 1 and 5),
  hunger_level integer not null check (hunger_level between 1 and 5),
  motivation_state text not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ─── Body Weight Logs ─────────────────────────────────────────────────────────
create table body_weight_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  weight_kg numeric(5,2) not null,
  date date not null,
  logged_at timestamptz not null default now(),
  note text,
  unique (user_id, date)
);

-- ─── Meal Logs ────────────────────────────────────────────────────────────────
create table meal_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  meal_name text not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  ingredients text[] not null default '{}',
  estimated_calories integer,
  is_eating_out boolean not null default false,
  allergen_flags text[] not null default '{}',
  date date not null,
  logged_at timestamptz not null default now()
);

-- ─── Workout Sessions ─────────────────────────────────────────────────────────
create table workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_type text not null check (session_type in ('full','minimum_viable','fallback_12min','active_recovery')),
  date date not null,
  duration_minutes integer,
  rpe integer check (rpe between 1 and 10),
  quality_score integer check (quality_score between 1 and 10),
  exercises jsonb not null default '[]',
  notes text,
  logged_at timestamptz not null default now()
);

-- ─── Ingredient Inventory ─────────────────────────────────────────────────────
create table ingredient_inventory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ingredient_name text not null,
  category text not null check (category in ('protein','carb','fat','vegetable','condiment','other')),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, ingredient_name)
);

-- ─── Allergy Rules ────────────────────────────────────────────────────────────
create table allergy_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  allergen_name text not null,
  severity text not null check (severity in ('hard_block','warning')),
  is_trigger_food boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, allergen_name)
);

-- ─── Daily Plans ──────────────────────────────────────────────────────────────
create table daily_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  phase text not null,
  focus_statement text not null,
  must_do_workouts text[] not null default '{}',
  meal_suggestions jsonb not null default '[]',
  non_negotiables text[] not null default '{}',
  is_low_willpower_day boolean not null default false,
  flour_free_reminder boolean not null default true,
  generated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ─── Adherence Scores ─────────────────────────────────────────────────────────
create table adherence_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  score integer not null check (score between 0 and 100),
  meal_logged boolean not null default false,
  workout_logged boolean not null default false,
  weight_logged boolean not null default false,
  checkin_completed boolean not null default false,
  flour_free boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table goals enable row level security;
alter table competition_events enable row level security;
alter table daily_checkins enable row level security;
alter table body_weight_logs enable row level security;
alter table meal_logs enable row level security;
alter table workout_sessions enable row level security;
alter table ingredient_inventory enable row level security;
alter table allergy_rules enable row level security;
alter table daily_plans enable row level security;
alter table adherence_scores enable row level security;

create policy "own_profiles" on profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_goals" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_events" on competition_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_checkins" on daily_checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_weight_logs" on body_weight_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_meal_logs" on meal_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_workouts" on workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_ingredients" on ingredient_inventory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_allergy_rules" on allergy_rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_daily_plans" on daily_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_adherence_scores" on adherence_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index idx_body_weight_logs_user_date on body_weight_logs(user_id, date desc);
create index idx_meal_logs_user_date on meal_logs(user_id, date desc);
create index idx_workout_sessions_user_date on workout_sessions(user_id, date desc);
create index idx_adherence_scores_user_date on adherence_scores(user_id, date desc);
create index idx_daily_plans_user_date on daily_plans(user_id, date);
create index idx_daily_checkins_user_date on daily_checkins(user_id, date desc);
