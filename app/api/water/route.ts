import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ounces } = body;

    if (!userId || !ounces) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert water log
    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: userId,
        ounces: ounces,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error logging water:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log water' },
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
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lt('logged_at', `${date}T23:59:59`)
      .order('logged_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate total
    const total = data?.reduce((sum, log) => sum + log.ounces, 0) || 0;

    return NextResponse.json({ logs: data || [], total });
  } catch (error: any) {
    console.error('Error fetching water logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch water logs' },
      { status: 500 }
    );
  }
}

// Update a water log
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, userId, ounces } = body;

    if (!logId || !userId || !ounces) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('water_logs')
      .update({ ounces })
      .eq('id', logId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating water log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update water log' },
      { status: 500 }
    );
  }
}

// Delete a water log
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
      .from('water_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting water log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete water log' },
      { status: 500 }
    );
  }
}
