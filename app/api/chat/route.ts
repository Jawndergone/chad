import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createChadSystemPrompt, calculateMacros } from '@/lib/macros';
import { OnboardingData } from '@/components/OnboardingFlow';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userProfile, userId } = body;

    if (!messages || !userProfile || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate user's macro targets
    const macros = calculateMacros(userProfile as OnboardingData);

    // Get today's meals (both from chat and manual logs)
    const today = new Date().toISOString().split('T')[0];
    const { data: todaysMeals } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00`)
      .lt('logged_at', `${today}T23:59:59`)
      .order('logged_at', { ascending: false });

    // Get today's stats
    const { data: todaysStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get today's water intake
    const { data: todaysWater } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00`)
      .lt('logged_at', `${today}T23:59:59`);

    // Get today's exercise
    const { data: todaysExercise } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00`)
      .lt('logged_at', `${today}T23:59:59`);

    // Get recent weight logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentWeights } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo.toISOString())
      .order('logged_at', { ascending: false })
      .limit(7);

    // Create Chad's system prompt
    let systemPrompt = createChadSystemPrompt(userProfile, macros);

    // Build context sections
    let contextSections = [];

    // Add meal history
    if (todaysMeals && todaysMeals.length > 0) {
      const mealsList = todaysMeals
        .map(meal => {
          const mealTime = new Date(meal.logged_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          const contextStr = meal.context ? ` [${meal.context}]` : '';
          return `- ${mealTime}${contextStr}: ${meal.meal_name} - ${meal.calories}cal, ${meal.protein_g}g protein, ${meal.carbs_g}g carbs, ${meal.fats_g}g fat`;
        })
        .join('\n');

      const currentTotals = todaysStats
        ? `Current totals: ${todaysStats.total_calories}cal, ${Math.round(todaysStats.total_protein_g)}g protein, ${Math.round(todaysStats.total_carbs_g)}g carbs, ${Math.round(todaysStats.total_fats_g)}g fat`
        : 'No meals logged yet today';

      const remaining = `Remaining: ${macros.calories - (todaysStats?.total_calories || 0)}cal, ${macros.protein - Math.round(todaysStats?.total_protein_g || 0)}g protein, ${macros.carbs - Math.round(todaysStats?.total_carbs_g || 0)}g carbs, ${macros.fats - Math.round(todaysStats?.total_fats_g || 0)}g fat`;

      contextSections.push(`**MEALS TODAY:**\n${mealsList}\n\n${currentTotals}\n${remaining}`);
    }

    // Add water intake
    if (todaysWater && todaysWater.length > 0) {
      const totalWater = todaysWater.reduce((sum, log) => sum + log.ounces, 0);
      const waterGoal = 64; // 64oz daily goal
      contextSections.push(`**WATER INTAKE TODAY:**\nTotal: ${totalWater}oz / ${waterGoal}oz goal (${Math.round((totalWater / waterGoal) * 100)}%)\nLogs: ${todaysWater.length} entries`);
    }

    // Add exercise
    if (todaysExercise && todaysExercise.length > 0) {
      const exerciseList = todaysExercise
        .map(ex => `- ${ex.exercise_name} (${ex.exercise_type}): ${ex.duration_minutes}min, ${ex.calories_burned}cal burned`)
        .join('\n');
      const totalMinutes = todaysExercise.reduce((sum, ex) => sum + ex.duration_minutes, 0);
      const totalCaloriesBurned = todaysExercise.reduce((sum, ex) => sum + ex.calories_burned, 0);

      contextSections.push(`**EXERCISE TODAY:**\n${exerciseList}\n\nTotal: ${totalMinutes} minutes, ${totalCaloriesBurned} calories burned`);
    }

    // Add weight tracking
    if (recentWeights && recentWeights.length > 0) {
      const latestWeight = recentWeights[0];
      const oldestWeight = recentWeights[recentWeights.length - 1];
      const weightChange = latestWeight.weight_lbs - oldestWeight.weight_lbs;
      const weightChangeStr = weightChange > 0 ? `+${weightChange.toFixed(1)}` : weightChange.toFixed(1);

      contextSections.push(`**WEIGHT TRACKING:**\nCurrent: ${latestWeight.weight_lbs}lbs (logged ${new Date(latestWeight.logged_at).toLocaleDateString()})\n7-day change: ${weightChangeStr}lbs\nGoal: ${userProfile.targetWeight || userProfile.weightLbs}lbs`);
    }

    // Add all context to system prompt
    if (contextSections.length > 0) {
      systemPrompt += `\n\n**IMPORTANT - USER'S ACTIVITY TODAY:**\n\n${contextSections.join('\n\n')}\n\nWhen the user asks about their progress, meals, water, exercise, or weight, reference this data. Provide encouragement and coaching based on their actual logged data. If they're doing well, praise them. If they're behind on goals, motivate them gently.`;
    }

    // Get the last user message to save to database
    const lastUserMessage = messages[messages.length - 1];

    // Save user message to database
    const { data: savedUserMessage } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        role: 'user',
        content: lastUserMessage.content,
      })
      .select()
      .single();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiMessage = completion.choices[0].message.content;

    // Save AI response to database
    const { data: savedAiMessage } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        role: 'assistant',
        content: aiMessage,
      })
      .select()
      .single();

    // Try to extract meal data from AI response
    // Look for patterns like "Estimated: XXX cal | XXg protein | XXg carbs | XXg fat"
    const mealPattern = /Estimated:\s*(\d+)\s*cal\s*\|\s*(\d+)g\s*protein\s*\|\s*(\d+)g\s*carbs\s*\|\s*(\d+)g\s*fat/i;
    const match = aiMessage?.match(mealPattern);

    if (match && savedAiMessage) {
      const [, calories, protein, carbs, fats] = match;

      // Extract meal name from user's message (simplified)
      const mealName = lastUserMessage.content.substring(0, 100);

      // Save meal log
      await supabase.from('meal_logs').insert({
        user_id: userId,
        message_id: savedAiMessage.id,
        meal_name: mealName,
        calories: parseInt(calories),
        protein_g: parseFloat(protein),
        carbs_g: parseFloat(carbs),
        fats_g: parseFloat(fats),
      });

      // Update or create daily stats
      const today = new Date().toISOString().split('T')[0];

      // Get existing daily stats
      const { data: existingStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existingStats) {
        // Update existing
        await supabase
          .from('daily_stats')
          .update({
            total_calories: existingStats.total_calories + parseInt(calories),
            total_protein_g: existingStats.total_protein_g + parseFloat(protein),
            total_carbs_g: existingStats.total_carbs_g + parseFloat(carbs),
            total_fats_g: existingStats.total_fats_g + parseFloat(fats),
            meals_logged: existingStats.meals_logged + 1,
          })
          .eq('id', existingStats.id);
      } else {
        // Create new
        await supabase.from('daily_stats').insert({
          user_id: userId,
          date: today,
          total_calories: parseInt(calories),
          total_protein_g: parseFloat(protein),
          total_carbs_g: parseFloat(carbs),
          total_fats_g: parseFloat(fats),
          meals_logged: 1,
        });
      }
    }

    return NextResponse.json({
      message: aiMessage,
      macros,
    });
  } catch (error: any) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Get message history for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages: data });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
