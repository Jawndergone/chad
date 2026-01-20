'use client';

import { OnboardingData } from './OnboardingFlow';

interface ProgressViewProps {
  userProfile: OnboardingData;
  userId: string;
}

export default function ProgressView({ userProfile, userId }: ProgressViewProps) {
  // TODO: Get actual data from database
  const currentWeight = userProfile.weightLbs;
  const targetWeight = userProfile.targetWeight || currentWeight;
  const weightChange: number = 0; // TODO: Calculate from historical data
  const daysTracking = 1;

  return (
    <div className="h-full overflow-y-auto bg-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Progress
        </h1>
        <p className="text-gray-400">Track your journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1C1C1E] rounded-2xl p-6 shadow-lg text-center border border-[#2C2C2E]">
          <p className="text-sm text-gray-400 mb-2">Current Weight</p>
          <p className="text-3xl font-bold text-white">
            {currentWeight}
          </p>
          <p className="text-xs text-gray-500 mt-1">lbs</p>
        </div>

        <div className="bg-[#1C1C1E] rounded-2xl p-6 shadow-lg text-center border border-[#2C2C2E]">
          <p className="text-sm text-gray-400 mb-2">Days Tracking</p>
          <p className="text-3xl font-bold text-white">
            {daysTracking}
          </p>
          <p className="text-xs text-gray-500 mt-1">days</p>
        </div>
      </div>

      {/* Weight Progress */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 shadow-lg mb-6 border border-[#2C2C2E]">
        <h2 className="text-lg font-semibold text-white mb-4">Weight Progress</h2>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Start</p>
            <p className="text-xl font-bold text-white">{currentWeight} lbs</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${weightChange > 0 ? 'text-green-500' : weightChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {weightChange === 0 ? '—' : `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Target</p>
            <p className="text-xl font-bold text-[#3478F6]">{targetWeight} lbs</p>
          </div>
        </div>
        <div className="h-2 bg-[#2C2C2E] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600" style={{ width: '0%' }} />
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 shadow-lg border border-[#2C2C2E]">
        <h2 className="text-lg font-semibold text-white mb-4">Weight Trend</h2>
        <div className="h-48 flex items-center justify-center bg-[#2C2C2E] rounded-xl border-2 border-dashed border-[#3A3A3C]">
          <div className="text-center">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gray-300 text-sm">Chart coming soon</p>
            <p className="text-gray-500 text-xs mt-1">Keep logging to see your progress</p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-6 bg-[#3478F6] rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-3">Next Milestone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">7 Day Streak</p>
            <p className="text-white/80 text-sm">Log meals for 7 days in a row</p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>
      </div>
    </div>
  );
}
