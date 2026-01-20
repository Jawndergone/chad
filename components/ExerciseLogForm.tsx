'use client';

import { useState } from 'react';

interface ExerciseLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onExerciseLogged: () => void;
}

export default function ExerciseLogForm({ isOpen, onClose, userId, onExerciseLogged }: ExerciseLogFormProps) {
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [exerciseType, setExerciseType] = useState<'cardio' | 'strength' | 'other'>('cardio');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          exerciseName,
          durationMinutes: parseInt(duration) || 0,
          caloriesBurned: parseInt(caloriesBurned) || 0,
          exerciseType,
        }),
      });

      if (response.ok) {
        setExerciseName('');
        setDuration('');
        setCaloriesBurned('');
        setExerciseType('cardio');
        onExerciseLogged();
        onClose();
      } else {
        alert('Failed to log exercise. Please try again.');
      }
    } catch (error) {
      console.error('Error logging exercise:', error);
      alert('Failed to log exercise. Please try again.');
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
            <h2 className="text-2xl font-bold text-white">Log Exercise</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Exercise Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Exercise Name
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g., Running, Bench Press, Yoga"
                required
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6]"
              />
            </div>

            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Exercise Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['cardio', 'strength', 'other'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExerciseType(type)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                      exerciseType === type
                        ? 'bg-[#3478F6] text-white'
                        : 'bg-[#2C2C2E] text-gray-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Calories Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="0"
                  required
                  min="0"
                  className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6]"
                />
              </div>

              {/* Calories Burned */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3478F6] text-white py-4 rounded-xl font-semibold hover:bg-[#2d66d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? 'Logging...' : 'Log Exercise'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
