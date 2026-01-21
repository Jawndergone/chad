import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateMacros } from '@/lib/macros';
import { OnboardingData } from '@/components/OnboardingFlow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profileData: OnboardingData = body;

    // Calculate macros
    const macros = calculateMacros(profileData);

    // Insert user profile into database
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        name: profileData.name,
        height_inches: profileData.heightInches,
        weight_lbs: profileData.weightLbs,
        current_body_fat: profileData.currentBodyFat,
        goal_type: profileData.goalType,
        target_weight: profileData.targetWeight,
        target_body_fat: profileData.targetBodyFat,
        daily_calories: macros.calories,
        daily_protein_g: macros.protein,
        daily_carbs_g: macros.carbs,
        daily_fats_g: macros.fats,
        onboarding_complete: false, // Explicitly set to false for new users
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Also create initial weight log
    await supabase.from('weight_logs').insert({
      user_id: data.id,
      weight_lbs: profileData.weightLbs,
      body_fat: profileData.currentBodyFat,
    });

    return NextResponse.json({
      userId: data.id,
      macros,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
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
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
