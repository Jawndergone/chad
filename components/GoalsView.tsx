'use client';

import { useState, useEffect } from 'react';
import { OnboardingData } from './OnboardingFlow';
import { calculateMacros } from '@/lib/macros';

interface GoalsViewProps {
  userProfile: OnboardingData;
  userId: string;
}

export default function GoalsView({ userProfile, userId }: GoalsViewProps) {
  // Calculate macros based on user profile
  const macros = calculateMacros(userProfile);
  const dailyCalories = macros.calories;
  const dailyProtein = macros.protein;
  const dailyCarbs = macros.carbs;
  const dailyFats = macros.fats;

  const [todayStats, setTodayStats] = useState({
    total_calories: 0,
    total_protein_g: 0,
    total_carbs_g: 0,
    total_fats_g: 0,
  });

  useEffect(() => {
    const loadTodayStats = async () => {
      try {
        const response = await fetch(`/api/meals?userId=${userId}`);
        const data = await response.json();

        if (data.stats) {
          setTodayStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadTodayStats();
  }, [userId]);

  const goals = [
    {
      label: 'Calories',
      target: dailyCalories,
      consumed: todayStats.total_calories || 0,
      unit: 'cal',
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Protein',
      target: dailyProtein,
      consumed: Math.round(todayStats.total_protein_g || 0),
      unit: 'g',
      color: 'from-violet-500 to-purple-500',
    },
    {
      label: 'Carbs',
      target: dailyCarbs,
      consumed: Math.round(todayStats.total_carbs_g || 0),
      unit: 'g',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Fats',
      target: dailyFats,
      consumed: Math.round(todayStats.total_fats_g || 0),
      unit: 'g',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Your Goals
        </h1>
        <p className="text-gray-400">Daily targets for {userProfile.goalType === 'cut' ? 'cutting' : userProfile.goalType === 'bulk' ? 'bulking' : 'maintaining'}</p>
      </div>

      {/* Current Stats */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 shadow-lg mb-6 border border-[#2C2C2E]">
        <h2 className="text-lg font-semibold text-white mb-4">Current Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Height</p>
            <p className="text-2xl font-bold text-white">
              {Math.floor(userProfile.heightInches / 12)}'{userProfile.heightInches % 12}"
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Weight</p>
            <p className="text-2xl font-bold text-white">{userProfile.weightLbs} lbs</p>
          </div>
          {userProfile.currentBodyFat && (
            <div>
              <p className="text-sm text-gray-400">Body Fat</p>
              <p className="text-2xl font-bold text-white">{userProfile.currentBodyFat}%</p>
            </div>
          )}
          {userProfile.targetWeight && (
            <div>
              <p className="text-sm text-gray-400">Target Weight</p>
              <p className="text-2xl font-bold text-[#3478F6]">
                {userProfile.targetWeight} lbs
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Targets */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 shadow-lg border border-[#2C2C2E]">
        <h2 className="text-lg font-semibold text-white mb-4">Daily Progress</h2>
        <div className="space-y-4">
          {goals.map((goal) => {
            const percentage = Math.min((goal.consumed / goal.target) * 100, 100);

            return (
              <div key={goal.label} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-300">{goal.label}</p>
                    <p className="text-xs text-gray-400">
                      {goal.consumed} / {goal.target} {goal.unit}
                    </p>
                  </div>
                  <div className="h-2 bg-[#2C2C2E] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Badge */}
      <div className="mt-6 bg-[#3478F6] rounded-2xl p-6 text-white text-center">
        <div className="text-4xl mb-2">
          {userProfile.goalType === 'cut' && '🔥'}
          {userProfile.goalType === 'bulk' && '💪'}
          {userProfile.goalType === 'maintain' && '⚖️'}
        </div>
        <h3 className="text-xl font-bold mb-1 capitalize">{userProfile.goalType}</h3>
        <p className="text-white/80 text-sm">
          {userProfile.goalType === 'cut' && 'Burning fat, keeping muscle'}
          {userProfile.goalType === 'bulk' && 'Building strength and size'}
          {userProfile.goalType === 'maintain' && 'Staying consistent and strong'}
        </p>
      </div>
    </div>
  );
}
