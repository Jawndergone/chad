'use client';

import { useState } from 'react';

interface LogFoodFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onFoodLogged: () => void;
}

export default function LogFoodForm({ isOpen, onClose, userId, onFoodLogged }: LogFoodFormProps) {
  const [mealName, setMealName] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'oz' | 'g' | 'lbs'>('oz');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [context, setContext] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);

  // Set current time when modal opens
  if (isOpen && !mealTime) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setMealTime(`${hours}:${minutes}`);
  }

  // Reset mealTime when modal closes
  if (!isOpen && mealTime) {
    setMealTime('');
  }

  if (!isOpen) return null;

  const handleEstimateMacros = async () => {
    if (!mealName || !weight) {
      alert('Please enter both food name and weight');
      return;
    }

    setIsEstimating(true);

    try {
      const response = await fetch('/api/estimate-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: mealName,
          weight: parseFloat(weight),
          weightUnit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCalories(data.calories.toString());
        setProtein(data.protein.toString());
        setCarbs(data.carbs.toString());
        setFats(data.fats.toString());
      } else {
        alert('Failed to estimate macros. Please try again.');
      }
    } catch (error) {
      console.error('Error estimating macros:', error);
      alert('Failed to estimate macros. Please try again.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!calories) {
      alert('Please estimate macros first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Include weight info in meal name
      const fullMealName = `${mealName} (${weight}${weightUnit})`;

      // Create timestamp from today's date + selected time
      const [hours, minutes] = mealTime.split(':');
      const loggedAt = new Date();
      loggedAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mealName: fullMealName,
          calories: parseInt(calories) || 0,
          proteinG: parseFloat(protein) || 0,
          carbsG: parseFloat(carbs) || 0,
          fatsG: parseFloat(fats) || 0,
          loggedAt: loggedAt.toISOString(),
          context: context || null,
        }),
      });

      if (response.ok) {
        // Reset form
        setMealName('');
        setWeight('');
        setWeightUnit('oz');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFats('');
        setContext('');
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        setMealTime(`${h}:${m}`);

        // Notify parent to refresh data
        onFoodLogged();
        onClose();
      } else {
        alert('Failed to log food. Please try again.');
      }
    } catch (error) {
      console.error('Error logging food:', error);
      alert('Failed to log food. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />

      {/* Form Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1C1C1E] rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Log Food</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Meal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Food Name
              </label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., Chicken breast, Rice, Eggs"
                required
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6]"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="8"
                  required
                  min="0"
                  step="0.1"
                  className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6]"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'oz' | 'g' | 'lbs')}
                  className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3478F6]"
                >
                  <option value="oz">oz</option>
                  <option value="g">g</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            {/* Estimate Button */}
            <button
              type="button"
              onClick={handleEstimateMacros}
              disabled={isEstimating || !mealName || !weight}
              className="w-full bg-[#2C2C2E] text-white py-3 rounded-xl font-semibold hover:bg-[#3A3A3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#3A3A3C]"
            >
              {isEstimating ? 'Estimating...' : '✨ Estimate Macros with AI'}
            </button>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Time
              </label>
              <input
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                required
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3478F6]"
              />
            </div>

            {/* Context (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Context (optional)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {['Pre-workout', 'Post-workout', 'Before bed'].map((ctx) => (
                  <button
                    key={ctx}
                    type="button"
                    onClick={() => setContext(context === ctx ? '' : ctx)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                      context === ctx
                        ? 'bg-[#3478F6] text-white'
                        : 'bg-[#2C2C2E] text-gray-400 hover:text-white'
                    }`}
                  >
                    {ctx}
                  </button>
                ))}
              </div>
              {context && (
                <div className="flex items-center justify-between bg-[#2C2C2E] rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-300">✓ {context}</span>
                  <button
                    type="button"
                    onClick={() => setContext('')}
                    className="text-gray-500 hover:text-white text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Estimated Macros (Read-only display) */}
            {calories && (
              <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-4">
                <p className="text-sm font-medium text-gray-400 mb-3">Estimated Nutritional Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Calories</p>
                    <p className="text-lg font-bold text-white">{calories}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Protein</p>
                    <p className="text-lg font-bold text-white">{protein}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Carbs</p>
                    <p className="text-lg font-bold text-white">{carbs}g</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fats</p>
                    <p className="text-lg font-bold text-white">{fats}g</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !calories}
              className="w-full bg-[#3478F6] text-white py-4 rounded-xl font-semibold hover:bg-[#2d66d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? 'Logging...' : calories ? 'Log Food' : 'Estimate macros first'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
