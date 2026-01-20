'use client';

import { useState, useEffect } from 'react';

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  log: any;
  onUpdated: () => void;
}

export default function EditExerciseModal({ isOpen, onClose, userId, log, onUpdated }: EditExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseType, setExerciseType] = useState<'cardio' | 'strength' | 'other'>('cardio');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setExerciseName(log.exercise_name || '');
      setExerciseType(log.exercise_type || 'cardio');
      setDurationMinutes(log.duration_minutes?.toString() || '');
      setCaloriesBurned(log.calories_burned?.toString() || '');
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/exercise', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: log.id,
          userId,
          exerciseName,
          exerciseType,
          durationMinutes: parseInt(durationMinutes),
          caloriesBurned: parseInt(caloriesBurned),
        }),
      });

      if (response.ok) {
        onUpdated();
        onClose();
      } else {
        alert('Failed to update exercise log');
      }
    } catch (error) {
      console.error('Error updating exercise log:', error);
      alert('Failed to update exercise log');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Workout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Exercise Name</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
              placeholder="e.g., Running, Bench Press"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value as 'cardio' | 'strength' | 'other')}
              className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
            >
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Duration (min)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
                placeholder="30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Calories</label>
              <input
                type="number"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
                placeholder="200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#3478F6] text-white rounded-xl py-3 font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Workout'}
          </button>
        </form>
      </div>
    </div>
  );
}
