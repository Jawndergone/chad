-- Migration: Add onboarding_complete flag to user_profiles
-- Run this in your Supabase SQL Editor

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Set existing users to true so they don't get onboarding questions
UPDATE user_profiles SET onboarding_complete = true WHERE onboarding_complete IS NULL;
