export interface UserProfile {
  id: string;
  name: string;
  height_inches: number;
  weight_lbs: number;
  current_body_fat?: number;
  goal_type: 'cut' | 'bulk' | 'maintain';
  target_weight?: number;
  target_body_fat?: number;
  daily_calories?: number;
  daily_protein_g?: number;
  daily_carbs_g?: number;
  daily_fats_g?: number;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  meal_logged?: MealLog;
}

export interface MealLog {
  id: string;
  user_id: string;
  message_id: string;
  meal_name: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  timestamp: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyStats {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fats_g: number;
  meals_logged: number;
}
