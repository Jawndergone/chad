'use client';

import { useState, useEffect } from 'react';

interface EditWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  log: any;
  onUpdated: () => void;
}

export default function EditWeightModal({ isOpen, onClose, userId, log, onUpdated }: EditWeightModalProps) {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setWeight(log.weight_lbs?.toString() || '');
      setNotes(log.notes || '');
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/weight', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: log.id,
          userId,
          weightLbs: parseFloat(weight),
          notes: notes || null,
        }),
      });

      if (response.ok) {
        onUpdated();
        onClose();
      } else {
        alert('Failed to update weight log');
      }
    } catch (error) {
      console.error('Error updating weight log:', error);
      alert('Failed to update weight log');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-3xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Weight</h2>
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
            <label className="block text-sm font-medium text-gray-400 mb-2">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6]"
              placeholder="150.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#2C2C2E] text-white rounded-xl p-3 border border-[#3A3A3C] focus:outline-none focus:border-[#3478F6] resize-none"
              placeholder="Feeling good today..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#3478F6] text-white rounded-xl py-3 font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Weight'}
          </button>
        </form>
      </div>
    </div>
  );
}
