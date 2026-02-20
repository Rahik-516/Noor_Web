-- ==============================
-- EXTENSIONS
-- ==============================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ==============================
-- TABLES
-- ==============================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  city text default 'Dhaka',
  created_at timestamptz default now()
);


create table if not exists public.quran_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  juz_number int not null check (juz_number between 1 and 30),
  completed boolean not null default false,
  date_completed timestamptz,
  unique(user_id, juz_number)
);


create table if not exists public.zakat_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  cash numeric not null default 0,
  gold_grams numeric not null default 0,
  silver_grams numeric not null default 0,
  business_assets numeric not null default 0,
  liabilities numeric not null default 0,
  zakat_amount numeric not null,
  created_at timestamptz default now()
);


create table if not exists public.masjids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude numeric not null,
  longitude numeric not null,
  distance_km numeric default 0,
  created_at timestamptz default now()
);


create table if not exists public.iftar_locations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  latitude numeric not null,
  longitude numeric not null,
  submitted_by uuid references public.users(id) on delete set null,
  approved boolean not null default false,
  created_at timestamptz default now()
);


create table if not exists public.hadiths (
  id uuid primary key default gen_random_uuid(),
  day_index int unique not null,
  arabic_text text not null,
  bengali_text text not null,
  source text not null
);


create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  streak_count int not null default 0,
  last_active_date date
);


create table if not exists public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  goal_text text not null,
  completed boolean not null default false,
  created_at timestamptz default now()
);


create table if not exists public.daily_goal_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  goal_type text not null,
  target_value int not null default 1,
  unit text not null default 'count',
  enabled boolean not null default true,
  is_custom boolean not null default false,
  created_at timestamptz default now(),
  unique(user_id, title)
);


create table if not exists public.daily_goal_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  goal_id uuid not null references public.daily_goal_settings(id) on delete cascade,
  progress_date date not null,
  completed_value int not null default 0,
  completed boolean not null default false,
  created_at timestamptz default now(),
  unique(user_id, goal_id, progress_date)
);


create table if not exists public.quran_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  mode text not null default 'juz',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);


-- ==============================
-- USER PROFILE ENHANCEMENTS
-- ==============================

alter table public.users add column if not exists username text unique;
alter table public.users add column if not exists bio text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists is_profile_public boolean default true;
alter table public.users add column if not exists updated_at timestamptz default now();


-- ==============================
-- ACHIEVEMENTS SYSTEM
-- ==============================

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  achievement_key text unique not null,
  title text not null,
  description text not null,
  emoji text not null,
  category text not null check (category in ('daily_goals', 'prayer', 'quran', 'consistency', 'milestones')),
  created_at timestamptz default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, achievement_id)
);


-- ==============================
-- ENABLE ROW LEVEL SECURITY
-- ==============================

alter table public.users enable row level security;
alter table public.quran_progress enable row level security;
alter table public.zakat_records enable row level security;
alter table public.masjids enable row level security;
alter table public.iftar_locations enable row level security;
alter table public.hadiths enable row level security;
alter table public.user_streaks enable row level security;
alter table public.daily_goals enable row level security;
alter table public.daily_goal_settings enable row level security;
alter table public.daily_goal_progress enable row level security;
alter table public.quran_tracking enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;


-- ==============================
-- POLICIES
-- ==============================

-- USERS
drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users for insert
with check (auth.uid() = id);


-- QURAN PROGRESS
drop policy if exists "Users own quran progress" on public.quran_progress;
create policy "Users own quran progress"
on public.quran_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ZAKAT
drop policy if exists "Users own zakat" on public.zakat_records;
create policy "Users own zakat"
on public.zakat_records for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- MASJIDS (public readable)
drop policy if exists "Public read masjids" on public.masjids;
create policy "Public read masjids"
on public.masjids for select
using (true);


-- IFTAR LOCATIONS
drop policy if exists "Users can submit iftar" on public.iftar_locations;
create policy "Users can submit iftar"
on public.iftar_locations for insert
with check (auth.uid() = submitted_by);

drop policy if exists "Public read approved iftar" on public.iftar_locations;
create policy "Public read approved iftar"
on public.iftar_locations for select
using (approved = true);


-- HADITH (public readable)
drop policy if exists "Public read hadith" on public.hadiths;
create policy "Public read hadith"
on public.hadiths for select
using (true);


-- STREAK
drop policy if exists "Users own streak" on public.user_streaks;
create policy "Users own streak"
on public.user_streaks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- DAILY GOALS
drop policy if exists "Users own goals" on public.daily_goals;
create policy "Users own goals"
on public.daily_goals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- DAILY GOAL SETTINGS
drop policy if exists "Users own goal settings" on public.daily_goal_settings;
create policy "Users own goal settings"
on public.daily_goal_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- DAILY GOAL PROGRESS
drop policy if exists "Users own goal progress" on public.daily_goal_progress;
create policy "Users own goal progress"
on public.daily_goal_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- QURAN TRACKING
drop policy if exists "Users own quran tracking" on public.quran_tracking;
create policy "Users own quran tracking"
on public.quran_tracking for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ==============================
-- UPDATED USERS POLICIES
-- ==============================

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users for select
using (auth.uid() = id OR is_profile_public = true);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users for insert
with check (auth.uid() = id);


-- ==============================
-- ACHIEVEMENTS POLICIES
-- ==============================

drop policy if exists "Public read achievements" on public.achievements;
create policy "Public read achievements"
on public.achievements for select
using (true);

drop policy if exists "Users own achievements" on public.user_achievements;
create policy "Users own achievements"
on public.user_achievements for select
using (auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_achievements.user_id AND is_profile_public = true
  ));

drop policy if exists "Users can insert their achievements" on public.user_achievements;
create policy "Users can insert their achievements"
on public.user_achievements for insert
with check (auth.uid() = user_id);


-- ==============================
-- AUTO CREATE PROFILE ON SIGNUP
-- ==============================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();


-- ==============================
-- ACHIEVEMENT SEED DATA
-- ==============================

delete from public.achievements;

insert into public.achievements (achievement_key, title, description, emoji, category) values
('first_goal', 'First Step', 'Complete your first daily goal', '🎯', 'daily_goals'),
('seven_day_streak', '7 Day Streak', 'Maintain a 7-day streak of daily goals', '🔥', 'consistency'),
('thirty_day_streak', '30 Day Streak', 'Maintain a 30-day streak of daily goals', '⭐', 'consistency'),
('quran_buddy', 'Quran Buddy', 'Complete 5 pages of Quran', '📖', 'quran'),
('quran_companion', 'Quran Companion', 'Complete 50 pages of Quran', '📚', 'quran'),
('quran_master', 'Quran Master', 'Complete all 30 Juz of Quran', '👑', 'quran'),
('prayer_seeker', 'Prayer Seeker', 'Mark all 5 prayers as complete for 7 days', '🕌', 'prayer'),
('prayer_regular', 'Prayer Regular', 'Mark all 5 prayers as complete for 30 days', '✨', 'prayer'),
('milestone_ten_goals', 'Milestone Master', 'Complete 10 daily goals total', '💫', 'milestones'),
('milestone_fifty_goals', 'Goal Achiever', 'Complete 50 daily goals total', '🏅', 'milestones'),
('early_bird', 'Early Bird', 'Complete daily goals before 9 AM for 7 consecutive days', '🌅', 'consistency');
