import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface UserPreference {
  type: 'explicit' | 'implicit' | 'lifestyle' | 'communication';
  key: string;
  value: string;
  confidence: number;
  source: string;
}

/**
 * Analyzes a user message to detect preferences and learning opportunities
 * Returns array of preferences to save
 */
export async function detectPreferences(
  userId: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<UserPreference[]> {
  try {
    const analysisPrompt = `Analyze this user message and detect any preferences, instructions, or personal details that should be remembered for future conversations.

User message: "${userMessage}"

Recent conversation context:
${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Detect and extract:
1. **Explicit instructions** - User directly telling you what to do/remember
   Examples: "I want you to be more direct", "Remember I workout 5x/week", "Don't use emojis"

2. **Implicit preferences** - Preferences shown through behavior or context
   Examples: User always mentions grams → prefer metric, User mentions time constraints → busy lifestyle

3. **Lifestyle details** - Personal info about routine, activity, goals
   Examples: "I play basketball", "I work night shifts", "I'm vegetarian"

4. **Communication style** - How they want to be talked to
   Examples: "Keep it short", "Be more casual", "Don't sugarcoat"

Return a JSON array of preferences found. Each preference should have:
- type: "explicit" | "implicit" | "lifestyle" | "communication"
- key: Short identifier (e.g., "workout_frequency", "preferred_units", "communication_style")
- value: The actual preference (e.g., "5x per week with weights and basketball", "grams", "direct and honest")
- confidence: 0.0-1.0 (how confident you are this is a real preference)
- source: Brief explanation of where this came from

If no preferences detected, return an empty array.

Return ONLY valid JSON in this exact format:
{
  "preferences": [
    {
      "type": "explicit",
      "key": "workout_frequency",
      "value": "Works out 5x per week with weights and basketball",
      "confidence": 1.0,
      "source": "User explicitly stated workout routine"
    }
  ]
}

If no preferences detected, return: {"preferences": []}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: analysisPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) return [];

    const parsed = JSON.parse(response);
    const preferences = parsed.preferences || [];

    // Save detected preferences to database
    for (const pref of preferences) {
      if (pref.confidence >= 0.5) { // Only save if confidence >= 50%
        await savePreference(userId, pref);
      }
    }

    return preferences;
  } catch (error) {
    console.error('Error detecting preferences:', error);
    return [];
  }
}

/**
 * Saves a preference to the database
 */
async function savePreference(userId: string, pref: UserPreference) {
  try {
    // Check if preference already exists
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('preference_key', pref.key)
      .single();

    if (existing) {
      // Update existing preference
      await supabase
        .from('user_preferences')
        .update({
          preference_value: pref.value,
          confidence: pref.confidence,
          source: pref.source,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Insert new preference
      await supabase.from('user_preferences').insert({
        user_id: userId,
        preference_type: pref.type,
        preference_key: pref.key,
        preference_value: pref.value,
        confidence: pref.confidence,
        source: pref.source,
      });
    }
  } catch (error) {
    console.error('Error saving preference:', error);
  }
}

/**
 * Loads all user preferences to include in system prompt
 */
export async function loadUserPreferences(userId: string): Promise<string> {
  try {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .gte('confidence', 0.6) // Only include preferences we're confident about
      .order('learned_at', { ascending: false });

    if (!preferences || preferences.length === 0) {
      return '';
    }

    // Group preferences by type
    const explicit = preferences.filter(p => p.preference_type === 'explicit');
    const lifestyle = preferences.filter(p => p.preference_type === 'lifestyle');
    const communication = preferences.filter(p => p.preference_type === 'communication');
    const implicit = preferences.filter(p => p.preference_type === 'implicit');

    let preferencesText = '\n\n**LEARNED USER PREFERENCES:**\n';

    if (explicit.length > 0) {
      preferencesText += '\nUser Instructions:\n';
      explicit.forEach(p => {
        preferencesText += `- ${p.preference_value}\n`;
      });
    }

    if (lifestyle.length > 0) {
      preferencesText += '\nLifestyle Details:\n';
      lifestyle.forEach(p => {
        preferencesText += `- ${p.preference_value}\n`;
      });
    }

    if (communication.length > 0) {
      preferencesText += '\nCommunication Preferences:\n';
      communication.forEach(p => {
        preferencesText += `- ${p.preference_value}\n`;
      });
    }

    if (implicit.length > 0) {
      preferencesText += '\nObserved Patterns:\n';
      implicit.forEach(p => {
        preferencesText += `- ${p.preference_value}\n`;
      });
    }

    preferencesText += '\n**IMPORTANT: Adapt your responses based on these learned preferences. The user taught you this through conversation.**\n';

    return preferencesText;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return '';
  }
}
