'use client';

import { useState } from 'react';

interface WeightLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onWeightLogged: () => void;
}

export default function WeightLogForm({ isOpen, onClose, userId, onWeightLogged }: WeightLogFormProps) {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          weightLbs: parseFloat(weight),
          notes: notes || null,
        }),
      });

      if (response.ok) {
        setWeight('');
        setNotes('');
        onWeightLogged();
        onClose();
      } else {
        alert('Failed to log weight. Please try again.');
      }
    } catch (error) {
      console.error('Error logging weight:', error);
      alert('Failed to log weight. Please try again.');
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
        <div className="bg-[#1C1C1E] rounded-3xl p-6 w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Log Weight</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                required
                min="0"
                step="0.1"
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6]"
              />
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Morning weigh-in, after workout, etc."
                rows={3}
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3478F6] text-white py-4 rounded-xl font-semibold hover:bg-[#2d66d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? 'Logging...' : 'Log Weight'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
