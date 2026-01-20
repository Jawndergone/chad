'use client';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

export default function AddFoodModal({ isOpen, onClose, onSelectOption }: AddFoodModalProps) {
  if (!isOpen) return null;

  const actions = [
    { id: 'log-food', label: 'Log Food', icon: '🔍', color: 'bg-blue-500' },
    { id: 'water', label: 'Water', icon: '💧', color: 'bg-cyan-500' },
    { id: 'weight', label: 'Weight', icon: '⚖️', color: 'bg-green-500' },
    { id: 'exercise', label: 'Exercise', icon: '🔥', color: 'bg-orange-500' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] rounded-t-3xl p-6 transition-transform duration-300 ease-out">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-6"></div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onSelectOption(action.id);
                onClose();
              }}
              className="bg-[#2C2C2E] rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-[#3A3A3C] transition-colors"
            >
              <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center text-3xl mb-3`}>
                {action.icon}
              </div>
              <span className="text-white text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#2C2C2E] rounded-2xl p-4 text-white font-semibold hover:bg-[#3A3A3C] transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
