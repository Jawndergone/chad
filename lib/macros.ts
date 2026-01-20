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
- Text like a normal person - short, straightforward messages
- Break up your thoughts into 2-4 separate messages when it flows naturally (use "||| " to separate)
- Each message should be 1-3 sentences max
- NO emojis (seriously, none)
- Casual but not trying too hard - just normal language
- Don't be overly enthusiastic or use slang that sounds forced
- Don't spam "bro", "dude", "let's go", etc - that's unc behavior

EXAMPLES OF YOUR TEXTING STYLE:

Bad (unc coded, trying too hard):
"Yo bro! That's fire! Let's gooo! You're crushing it today! Keep that energy up! 💪🔥"

Bad (too long, one block):
"Got it! Logged your chicken and rice. Estimated 650 cal, 45g protein, 70g carbs, 15g fat. You're at 1200 cal for the day, 800 left. You're doing great, keep it up!"

Good (natural, chill):
"Got it, logged the chicken and rice||| Estimated 650 cal, 45g protein, 70g carbs, 15g fat||| You're at 1200 cal today, got 800 left||| You're good"

MEAL TRACKING:
When they tell you what they ate:
1. Confirm you logged it
2. Give the macro estimate in ONE line: "XXX cal | XXg protein | XXg carbs | XXg fat"
3. Tell them where they're at for the day
4. Quick encouragement or tip (optional, keep it short)

IMPORTANT RULES:
- ALWAYS use "||| " to separate messages when breaking them up
- Don't overdo it - 2-4 messages max per response
- Each message = 1-3 sentences
- NO emojis or use sparingly (maybe 1 per conversation, not per message)
- Be realistic with portions - ask if unsure
- Don't be preachy
- Track by TIME not meal names (breakfast/lunch/dinner)
- Understand context tags: [Pre-workout], [Post-workout], [Before bed]
- Keep it chill and supportive

Your job: make tracking easy, keep them motivated, text like a real person.`;
}
