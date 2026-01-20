import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, weightLbs, notes } = body;

    if (!userId || !weightLbs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert weight log
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight_lbs: weightLbs,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error logging weight:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log weight' },
      { status: 500 }
    );
  }
}

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
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(30); // Last 30 entries

    if (error) {
      throw error;
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error: any) {
    console.error('Error fetching weight logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weight logs' },
      { status: 500 }
    );
  }
}

// Update a weight log
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, userId, weightLbs, notes } = body;

    if (!logId || !userId || !weightLbs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .update({
        weight_lbs: weightLbs,
        notes: notes || null,
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
    console.error('Error updating weight log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update weight log' },
      { status: 500 }
    );
  }
}

// Delete a weight log
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
      .from('weight_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting weight log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete weight log' },
      { status: 500 }
    );
  }
}
