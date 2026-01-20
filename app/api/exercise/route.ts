import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, exerciseName, durationMinutes, caloriesBurned, exerciseType } = body;

    if (!userId || !exerciseName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert exercise log
    const { data, error } = await supabase
      .from('exercise_logs')
      .insert({
        user_id: userId,
        exercise_name: exerciseName,
        duration_minutes: durationMinutes || 0,
        calories_burned: caloriesBurned || 0,
        exercise_type: exerciseType || 'other',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error logging exercise:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log exercise' },
      { status: 500 }
    );
  }
}

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

    const { data, error } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lt('logged_at', `${date}T23:59:59`)
      .order('logged_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate totals
    const totalMinutes = data?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0;
    const totalCalories = data?.reduce((sum, log) => sum + log.calories_burned, 0) || 0;

    return NextResponse.json({ logs: data || [], totalMinutes, totalCalories });
  } catch (error: any) {
    console.error('Error fetching exercise logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch exercise logs' },
      { status: 500 }
    );
  }
}

// Update an exercise log
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, userId, exerciseName, durationMinutes, caloriesBurned, exerciseType } = body;

    if (!logId || !userId || !exerciseName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('exercise_logs')
      .update({
        exercise_name: exerciseName,
        duration_minutes: durationMinutes || 0,
        calories_burned: caloriesBurned || 0,
        exercise_type: exerciseType || 'other',
      })
      .eq('id', logId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating exercise log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update exercise log' },
      { status: 500 }
    );
  }
}

// Delete an exercise log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('logId');
    const userId = searchParams.get('userId');

    if (!logId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('exercise_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting exercise log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete exercise log' },
      { status: 500 }
    );
  }
}
