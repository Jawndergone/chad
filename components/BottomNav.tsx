'use client';

import { useState } from 'react';
import AddFoodModal from './AddFoodModal';
import LogFoodForm from './LogFoodForm';
import WaterLogForm from './WaterLogForm';
import WeightLogForm from './WeightLogForm';
import ExerciseLogForm from './ExerciseLogForm';

interface BottomNavProps {
  activeTab: 'home' | 'goals' | 'progress' | 'log';
  onTabChange: (tab: 'home' | 'goals' | 'progress' | 'log') => void;
  userId: string;
  onDataUpdate?: () => void;
}

export default function BottomNav({ activeTab, onTabChange, userId, onDataUpdate }: BottomNavProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogFoodFormOpen, setIsLogFoodFormOpen] = useState(false);
  const [isWaterFormOpen, setIsWaterFormOpen] = useState(false);
  const [isWeightFormOpen, setIsWeightFormOpen] = useState(false);
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);

  const leftTabs = [
    { id: 'home' as const, label: 'Home', icon: '💬' },
    { id: 'log' as const, label: 'Log', icon: '📝' },
  ];

  const rightTabs = [
    { id: 'progress' as const, label: 'Progress', icon: '📈' },
    { id: 'goals' as const, label: 'Goals', icon: '🎯' },
  ];

  const handleAddFood = () => {
    setIsModalOpen(true);
  };

  const handleSelectOption = (option: string) => {
    if (option === 'log-food') {
      setIsLogFoodFormOpen(true);
    } else if (option === 'water') {
      setIsWaterFormOpen(true);
    } else if (option === 'weight') {
      setIsWeightFormOpen(true);
    } else if (option === 'exercise') {
      setIsExerciseFormOpen(true);
    }
  };

  const handleDataLogged = () => {
    // Refresh data in parent components
    if (onDataUpdate) {
      onDataUpdate();
    }
  };

  return (
    <div className="relative bg-[#1C1C1E] border-t border-[#2C2C2E] px-2 py-1.5 flex-shrink-0">
      <div className="flex items-center justify-around">
        {/* Left tabs */}
        <div className="flex-1 flex justify-around">
          {leftTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className={`text-xs font-medium ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Center plus button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleAddFood}
            className="w-16 h-16 bg-[#3478F6] rounded-full flex items-center justify-center transition-colors hover:bg-[#2d66d4]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Right tabs */}
        <div className="flex-1 flex justify-around">
          {rightTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className={`text-xs font-medium ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectOption={handleSelectOption}
      />

      {/* Log Food Form */}
      <LogFoodForm
        isOpen={isLogFoodFormOpen}
        onClose={() => setIsLogFoodFormOpen(false)}
        userId={userId}
        onFoodLogged={handleDataLogged}
      />

      {/* Water Log Form */}
      <WaterLogForm
        isOpen={isWaterFormOpen}
        onClose={() => setIsWaterFormOpen(false)}
        userId={userId}
        onWaterLogged={handleDataLogged}
      />

      {/* Weight Log Form */}
      <WeightLogForm
        isOpen={isWeightFormOpen}
        onClose={() => setIsWeightFormOpen(false)}
        userId={userId}
        onWeightLogged={handleDataLogged}
      />

      {/* Exercise Log Form */}
      <ExerciseLogForm
        isOpen={isExerciseFormOpen}
        onClose={() => setIsExerciseFormOpen(false)}
        userId={userId}
        onExerciseLogged={handleDataLogged}
      />
    </div>
  );
}
