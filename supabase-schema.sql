-- Chad App Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  height_inches INTEGER NOT NULL,
  weight_lbs DECIMAL(5,1) NOT NULL,
  current_body_fat DECIMAL(4,1),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('cut', 'bulk', 'maintain')),
  target_weight DECIMAL(5,1),
  target_body_fat DECIMAL(4,1),
  daily_calories INTEGER,
  daily_protein_g INTEGER,
  daily_carbs_g INTEGER,
  daily_fats_g INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (chat history)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  meal_name TEXT NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  fats_g DECIMAL(5,1),
  context TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily stats table (aggregated daily totals)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_protein_g DECIMAL(6,1) DEFAULT 0,
  total_carbs_g DECIMAL(6,1) DEFAULT 0,
  total_fats_g DECIMAL(6,1) DEFAULT 0,
  meals_logged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Weight tracking table
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  weight_lbs DECIMAL(5,1) NOT NULL,
  body_fat DECIMAL(4,1),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water tracking table
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  ounces DECIMAL(5,1) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise tracking table
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT CHECK (exercise_type IN ('cardio', 'strength', 'other')),
  duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table (AI learning)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL CHECK (preference_type IN ('explicit', 'implicit', 'lifestyle', 'communication')),
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 1.0, -- How confident we are (0.0-1.0)
  source TEXT, -- Where this came from (e.g., "user said X", "detected from conversation")
  learned_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at ON meal_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(user_id, preference_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on meal_logs" ON meal_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_stats" ON daily_stats FOR ALL USING (true);
CREATE POLICY "Allow all operations on weight_logs" ON weight_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on water_logs" ON water_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on exercise_logs" ON exercise_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_preferences" ON user_preferences FOR ALL USING (true);
