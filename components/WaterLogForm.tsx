'use client';

import { useState } from 'react';

interface WaterLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onWaterLogged: () => void;
}

export default function WaterLogForm({ isOpen, onClose, userId, onWaterLogged }: WaterLogFormProps) {
  const [ounces, setOunces] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuickAdd = (amount: number) => {
    setOunces(amount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ounces: parseFloat(ounces),
        }),
      });

      if (response.ok) {
        setOunces('');
        onWaterLogged();
        onClose();
      } else {
        alert('Failed to log water. Please try again.');
      }
    } catch (error) {
      console.error('Error logging water:', error);
      alert('Failed to log water. Please try again.');
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
            <h2 className="text-2xl font-bold text-white">Log Water</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Add Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Quick Add
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[8, 16, 32].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleQuickAdd(amount)}
                    className="bg-[#2C2C2E] text-white py-3 rounded-xl font-semibold hover:bg-[#3A3A3C] transition-colors"
                  >
                    {amount} oz
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount (ounces)
              </label>
              <input
                type="number"
                value={ounces}
                onChange={(e) => setOunces(e.target.value)}
                placeholder="0"
                required
                min="0"
                step="0.1"
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3478F6]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3478F6] text-white py-4 rounded-xl font-semibold hover:bg-[#2d66d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? 'Logging...' : 'Log Water'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
