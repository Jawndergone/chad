'use client';

import { useState, useEffect } from 'react';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  meal: any;
  onMealUpdated: () => void;
}

export default function EditMealModal({ isOpen, onClose, userId, meal, onMealUpdated }: EditMealModalProps) {
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [context, setContext] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (meal) {
      setMealName(meal.meal_name || '');
      setCalories(meal.calories?.toString() || '');
      setProtein(meal.protein_g?.toString() || '');
      setCarbs(meal.carbs_g?.toString() || '');
      setFats(meal.fats_g?.toString() || '');
      setContext(meal.context || '');

      // Format time for input
      if (meal.logged_at) {
        const date = new Date(meal.logged_at);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setMealTime(`${hours}:${minutes}`);
      }
    }
  }, [meal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create timestamp from time
      const now = new Date();
      const [hours, minutes] = mealTime.split(':');
      const loggedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));

      const response = await fetch('/api/meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealId: meal.id,
          userId,
          mealName,
          calories: parseInt(calories),
          proteinG: parseFloat(protein),
          carbsG: parseFloat(carbs),
          fatsG: parseFloat(fats),
          loggedAt: loggedAt.toISOString(),
          context: context || null,
        }),
      });

      if (response.ok) {
        onMealUpdated();
        onClose();
      } else {
        alert('Failed to update meal');
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      alert('Failed to update meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Meal</h2>
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
            <label className="block text-sm font-medium text-gray-400 mb-2">Meal Description</label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
              placeholder="e.g., 8oz chicken breast"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
            <input
              type="time"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Context (Optional)</label>
            <div className="flex gap-2">
              {['Pre-workout', 'Post-workout', 'Before bed'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setContext(context === tag ? '' : tag)}
                  className={`px-3 py-2 rounded-full text-sm transition-colors ${
                    context === tag
                      ? 'bg-[#3478F6] text-white'
                      : 'bg-[#2C2C2E] text-gray-400 border border-[#3A3A3C]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Fats (g)</label>
              <input
                type="number"
                step="0.1"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
                placeholder="0"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#3478F6] text-white rounded-xl py-3 font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Meal'}
          </button>
        </form>
      </div>
    </div>
  );
}
