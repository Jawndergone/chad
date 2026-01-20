'use client';

import { useState } from 'react';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  heightInches: number;
  weightLbs: number;
  currentBodyFat?: number;
  goalType: 'cut' | 'bulk' | 'maintain';
  targetWeight?: number;
  targetBodyFat?: number;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('10');
  const [weightLbs, setWeightLbs] = useState('');
  const [currentBodyFat, setCurrentBodyFat] = useState('');
  const [goalType, setGoalType] = useState<'cut' | 'bulk' | 'maintain'>('cut');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetBodyFat, setTargetBodyFat] = useState('');

  const handleNext = () => {
    if (step === 1 && !name) return;
    if (step === 2 && (!weightLbs)) return;
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const totalHeightInches = parseInt(heightFeet) * 12 + parseInt(heightInches);

    onComplete({
      name,
      heightInches: totalHeightInches,
      weightLbs: parseFloat(weightLbs),
      currentBodyFat: currentBodyFat ? parseFloat(currentBodyFat) : undefined,
      goalType,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-8 rounded-t-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">
                {step === 1 && '👋'}
                {step === 2 && '📏'}
                {step === 3 && '🎯'}
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {step === 1 && "What's your name?"}
              {step === 2 && 'Your Stats'}
              {step === 3 && 'Your Goal'}
            </h2>
            <p className="text-white/90 text-sm">Step {step} of 3</p>
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Stats */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                  >
                    {[4, 5, 6, 7].map((ft) => (
                      <option key={ft} value={ft}>{ft} ft</option>
                    ))}
                  </select>
                  <select
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inch) => (
                      <option key={inch} value={inch}>{inch} in</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Weight (lbs)
                </label>
                <input
                  type="number"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="185"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Body Fat % (optional)
                </label>
                <input
                  type="number"
                  value={currentBodyFat}
                  onChange={(e) => setCurrentBodyFat(e.target.value)}
                  placeholder="18"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your goal?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['cut', 'bulk', 'maintain'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setGoalType(type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        goalType === type
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {type === 'cut' && '🔥'}
                        {type === 'bulk' && '💪'}
                        {type === 'maintain' && '⚖️'}
                      </div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Weight (lbs) - optional
                </label>
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="175"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Body Fat % - optional
                </label>
                <input
                  type="number"
                  value={targetBodyFat}
                  onChange={(e) => setTargetBodyFat(e.target.value)}
                  placeholder="12"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !name || step === 2 && !weightLbs}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Let's Go! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
