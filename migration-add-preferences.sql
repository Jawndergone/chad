-- Migration: Add user_preferences table for AI learning
-- Run this in your Supabase SQL Editor

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(user_id, preference_type);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow all operations on user_preferences" ON user_preferences FOR ALL USING (true);
