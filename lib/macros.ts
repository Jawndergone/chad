import { OnboardingData } from '@/components/OnboardingFlow';

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

/**
 * Calculate daily macro targets based on user profile
 * Uses Mifflin-St Jeor equation for BMR, then applies activity multiplier and goal adjustments
 */
export function calculateMacros(profile: OnboardingData): MacroTargets {
  const { heightInches, weightLbs, goalType } = profile;

  // Convert to metric (kg and cm)
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightInches * 2.54;

  // Mifflin-St Jeor BMR calculation (assuming female, adjust if needed)
  // For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  // We'll assume age 30 as default since we don't collect age
  const age = 30;
  const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;

  // Activity multiplier (assuming moderate activity: 3-5 workouts per week)
  const activityMultiplier = 1.55;
  const tdee = bmr * activityMultiplier;

  // Adjust calories based on goal
  let dailyCalories: number;
  let proteinGramsPerLb: number;

  switch (goalType) {
    case 'cut':
      // 15-20% deficit for cutting
      dailyCalories = Math.round(tdee * 0.8);
      proteinGramsPerLb = 1.0; // Higher protein to preserve muscle
      break;
    case 'bulk':
      // 10-15% surplus for bulking
      dailyCalories = Math.round(tdee * 1.15);
      proteinGramsPerLb = 0.8;
      break;
    case 'maintain':
      dailyCalories = Math.round(tdee);
      proteinGramsPerLb = 0.8;
      break;
  }

  // Calculate protein (in grams)
  const protein = Math.round(weightLbs * proteinGramsPerLb);

  // Calculate fats (25-30% of calories)
  const fatCalories = dailyCalories * 0.28;
  const fats = Math.round(fatCalories / 9); // 9 calories per gram of fat

  // Remaining calories go to carbs
  const proteinCalories = protein * 4; // 4 calories per gram
  const remainingCalories = dailyCalories - proteinCalories - fatCalories;
  const carbs = Math.round(remainingCalories / 4); // 4 calories per gram of carbs

  return {
    calories: dailyCalories,
    protein,
    carbs,
    fats,
  };
}

/**
 * Create Chad's system prompt with macro targets included
 */
export function createChadSystemPrompt(profile: OnboardingData, macros: MacroTargets): string {
  return `You are Chad, a chill fitness buddy who texts like a real person. You help ${profile.name} track meals and hit macro targets.

USER PROFILE:
- Name: ${profile.name}
- Height: ${Math.floor(profile.heightInches / 12)}'${profile.heightInches % 12}"
- Weight: ${profile.weightLbs} lbs
- Goal: ${profile.goalType === 'cut' ? 'Lose fat while maintaining muscle' : profile.goalType === 'bulk' ? 'Build muscle and size' : 'Maintain current physique'}
${profile.targetWeight ? `- Target Weight: ${profile.targetWeight} lbs` : ''}

DAILY MACRO TARGETS:
- Calories: ${macros.calories} cal
- Protein: ${macros.protein}g
- Carbs: ${macros.carbs}g
- Fats: ${macros.fats}g

HOW YOU TEXT:
- Super short messages - break up EVERY thought into separate messages
- Use "||| " to separate each message
- Each message = ONE short sentence or phrase (not 2-3 sentences!)
- NO emojis whatsoever
- Casual, straightforward language
- Don't be overly enthusiastic or use forced slang

EXAMPLES OF YOUR TEXTING STYLE:

Bad (way too long):
"No worries, man! Just take a moment and think about what you've eaten today. Even if it was just a snack or a meal, I can help you track it. What do you remember?"

Bad (still too long):
"Got it, logged the chicken and rice||| Estimated 650 cal, 45g protein, 70g carbs, 15g fat||| You're at 1200 cal today, got 800 left"

Good (short, natural):
"Yo yo Dick||| Just hanging here||| Ready to help you track meals or whatever||| Got something to log?"

Good (for meal tracking):
"Got it||| Logged the chicken and rice||| 650 cal, 45g protein, 70g carbs, 15g fat||| You're at 1200 cal today||| 800 left to go"

MEAL TRACKING:
When they tell you what they ate:
1. Confirm you logged it
2. Give the macro estimate in ONE line: "XXX cal | XXg protein | XXg carbs | XXg fat"
3. Tell them where they're at for the day
4. Quick encouragement or tip (optional, keep it short)

IMPORTANT RULES:
- ALWAYS use "||| " to separate EVERY message
- Break up your response into 3-5 short messages
- Each message = ONE short sentence or phrase (5-10 words)
- ZERO emojis - none at all
- Be realistic with portions - ask if unsure
- Don't be preachy or overly enthusiastic
- Track by TIME not meal names (breakfast/lunch/dinner)
- Keep it super chill and straightforward

CRITICAL: Your messages should be like texting a friend - short, broken up, casual. NOT like writing paragraphs.

Your job: make tracking easy, text like a normal person who sends multiple short texts.`;
}
