import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Post a new meal log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mealName, calories, proteinG, carbsG, fatsG, loggedAt, context } = body;

    if (!userId || !mealName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Insert meal log
    const { data: mealLog, error: mealError } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        meal_name: mealName,
        calories: calories || 0,
        protein_g: proteinG || 0,
        carbs_g: carbsG || 0,
        fats_g: fatsG || 0,
        logged_at: loggedAt || new Date().toISOString(),
        context: context || null,
      })
      .select()
      .single();

    if (mealError) {
      throw mealError;
    }

    // Update daily stats
    const { data: existingStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingStats) {
      // Update existing stats
      await supabase
        .from('daily_stats')
        .update({
          total_calories: existingStats.total_calories + (calories || 0),
          total_protein_g: existingStats.total_protein_g + (proteinG || 0),
          total_carbs_g: existingStats.total_carbs_g + (carbsG || 0),
          total_fats_g: existingStats.total_fats_g + (fatsG || 0),
          meals_logged: existingStats.meals_logged + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStats.id);
    } else {
      // Create new stats entry
      await supabase.from('daily_stats').insert({
        user_id: userId,
        date: today,
        total_calories: calories || 0,
        total_protein_g: proteinG || 0,
        total_carbs_g: carbsG || 0,
        total_fats_g: fatsG || 0,
        meals_logged: 1,
      });
    }

    return NextResponse.json({ success: true, mealLog });
  } catch (error: any) {
    console.error('Error logging meal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log meal' },
      { status: 500 }
    );
  }
}

// Get today's meals and daily stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get today's meals
    const { data: meals, error: mealsError } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lt('logged_at', `${date}T23:59:59`)
      .order('logged_at', { ascending: false });

    if (mealsError) {
      throw mealsError;
    }

    // Get daily stats
    const { data: stats, error: statsError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    return NextResponse.json({
      meals: meals || [],
      stats: stats || {
        total_calories: 0,
        total_protein_g: 0,
        total_carbs_g: 0,
        total_fats_g: 0,
        meals_logged: 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meals' },
      { status: 500 }
    );
  }
}

// Update a meal log
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { mealId, userId, mealName, calories, proteinG, carbsG, fatsG, loggedAt, context } = body;

    if (!mealId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the old meal data to adjust daily stats
    const { data: oldMeal } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('id', mealId)
      .single();

    if (!oldMeal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // Update the meal
    const { data: updatedMeal, error: updateError } = await supabase
      .from('meal_logs')
      .update({
        meal_name: mealName,
        calories: calories || 0,
        protein_g: proteinG || 0,
        carbs_g: carbsG || 0,
        fats_g: fatsG || 0,
        logged_at: loggedAt,
        context: context || null,
      })
      .eq('id', mealId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update daily stats (subtract old, add new)
    const today = new Date().toISOString().split('T')[0];
    const { data: existingStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingStats) {
      await supabase
        .from('daily_stats')
        .update({
          total_calories: existingStats.total_calories - (oldMeal.calories || 0) + (calories || 0),
          total_protein_g: existingStats.total_protein_g - (oldMeal.protein_g || 0) + (proteinG || 0),
          total_carbs_g: existingStats.total_carbs_g - (oldMeal.carbs_g || 0) + (carbsG || 0),
          total_fats_g: existingStats.total_fats_g - (oldMeal.fats_g || 0) + (fatsG || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStats.id);
    }

    return NextResponse.json({ success: true, meal: updatedMeal });
  } catch (error: any) {
    console.error('Error updating meal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update meal' },
      { status: 500 }
    );
  }
}

// Delete a meal log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get('mealId');
    const userId = searchParams.get('userId');

    if (!mealId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the meal before deleting to update daily stats
    const { data: meal } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('id', mealId)
      .single();

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      );
    }

    // Delete the meal
    const { error: deleteError } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId);

    if (deleteError) {
      throw deleteError;
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const { data: existingStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingStats) {
      await supabase
        .from('daily_stats')
        .update({
          total_calories: Math.max(0, existingStats.total_calories - (meal.calories || 0)),
          total_protein_g: Math.max(0, existingStats.total_protein_g - (meal.protein_g || 0)),
          total_carbs_g: Math.max(0, existingStats.total_carbs_g - (meal.carbs_g || 0)),
          total_fats_g: Math.max(0, existingStats.total_fats_g - (meal.fats_g || 0)),
          meals_logged: Math.max(0, existingStats.meals_logged - 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStats.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting meal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete meal' },
      { status: 500 }
    );
  }
}
