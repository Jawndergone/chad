'use client';

import { useState, useEffect } from 'react';
import EditMealModal from './EditMealModal';
import EditWaterModal from './EditWaterModal';
import EditWeightModal from './EditWeightModal';
import EditExerciseModal from './EditExerciseModal';

interface LogViewProps {
  userId: string;
}

export default function LogView({ userId }: LogViewProps) {
  const [todaysMeals, setTodaysMeals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_calories: 0,
    total_protein_g: 0,
    total_carbs_g: 0,
    total_fats_g: 0,
  });
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2500,
    protein: 150,
    carbs: 250,
    fats: 70,
  });
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [totalWater, setTotalWater] = useState(0);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [exerciseTotals, setExerciseTotals] = useState({ totalMinutes: 0, totalCalories: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal states
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [editingWater, setEditingWater] = useState<any>(null);
  const [editingWeight, setEditingWeight] = useState<any>(null);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load meals and stats
        const mealsResponse = await fetch(`/api/meals?userId=${userId}`);
        const mealsData = await mealsResponse.json();

        if (mealsData.meals) {
          setTodaysMeals(mealsData.meals);
        }
        if (mealsData.stats) {
          setStats(mealsData.stats);
        }

        // Load user goals
        const userResponse = await fetch(`/api/user?userId=${userId}`);
        const userData = await userResponse.json();
        if (userData && userData.daily_calories) {
          setDailyGoals({
            calories: userData.daily_calories,
            protein: userData.daily_protein_g,
            carbs: userData.daily_carbs_g,
            fats: userData.daily_fats_g,
          });
        }

        // Load water logs
        const waterResponse = await fetch(`/api/water?userId=${userId}`);
        const waterData = await waterResponse.json();
        if (waterData.logs) {
          setWaterLogs(waterData.logs);
          setTotalWater(waterData.total || 0);
        }

        // Load weight logs
        const weightResponse = await fetch(`/api/weight?userId=${userId}`);
        const weightData = await weightResponse.json();
        if (weightData.logs) {
          setWeightLogs(weightData.logs);
        }

        // Load exercise logs
        const exerciseResponse = await fetch(`/api/exercise?userId=${userId}`);
        const exerciseData = await exerciseResponse.json();
        if (exerciseData.logs) {
          setExerciseLogs(exerciseData.logs);
          setExerciseTotals({
            totalMinutes: exerciseData.totalMinutes || 0,
            totalCalories: exerciseData.totalCalories || 0,
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const totalCalories = stats.total_calories || 0;
  const totalProtein = Math.round(stats.total_protein_g || 0);
  const totalCarbs = Math.round(stats.total_carbs_g || 0);
  const totalFats = Math.round(stats.total_fats_g || 0);

  const remainingCalories = dailyGoals.calories - totalCalories;
  const remainingProtein = dailyGoals.protein - totalProtein;
  const remainingCarbs = dailyGoals.carbs - totalCarbs;
  const remainingFats = dailyGoals.fats - totalFats;

  const caloriesPercentage = Math.min((totalCalories / dailyGoals.calories) * 100, 100);
  const proteinPercentage = Math.min((totalProtein / dailyGoals.protein) * 100, 100);
  const carbsPercentage = Math.min((totalCarbs / dailyGoals.carbs) * 100, 100);
  const fatsPercentage = Math.min((totalFats / dailyGoals.fats) * 100, 100);

  // SVG circle calculations
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const getStrokeDashoffset = (percentage: number) => {
    return circumference - (percentage / 100) * circumference;
  };

  // Smaller circles for macros
  const macroSize = 100;
  const macroStrokeWidth = 8;
  const macroRadius = (macroSize - macroStrokeWidth) / 2;
  const macroCircumference = 2 * Math.PI * macroRadius;

  const getMacroStrokeDashoffset = (percentage: number) => {
    return macroCircumference - (percentage / 100) * macroCircumference;
  };

  // Refresh data function
  const refreshData = async () => {
    try {
      // Reload all data
      const [mealsRes, userRes, waterRes, weightRes, exerciseRes] = await Promise.all([
        fetch(`/api/meals?userId=${userId}`),
        fetch(`/api/user?userId=${userId}`),
        fetch(`/api/water?userId=${userId}`),
        fetch(`/api/weight?userId=${userId}`),
        fetch(`/api/exercise?userId=${userId}`),
      ]);

      const [mealsData, userData, waterData, weightData, exerciseData] = await Promise.all([
        mealsRes.json(),
        userRes.json(),
        waterRes.json(),
        weightRes.json(),
        exerciseRes.json(),
      ]);

      if (mealsData.meals) setTodaysMeals(mealsData.meals);
      if (mealsData.stats) setStats(mealsData.stats);
      if (userData && userData.daily_calories) {
        setDailyGoals({
          calories: userData.daily_calories,
          protein: userData.daily_protein_g,
          carbs: userData.daily_carbs_g,
          fats: userData.daily_fats_g,
        });
      }
      if (waterData.logs) {
        setWaterLogs(waterData.logs);
        setTotalWater(waterData.total || 0);
      }
      if (weightData.logs) setWeightLogs(weightData.logs);
      if (exerciseData.logs) {
        setExerciseLogs(exerciseData.logs);
        setExerciseTotals({
          totalMinutes: exerciseData.totalMinutes || 0,
          totalCalories: exerciseData.totalCalories || 0,
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Delete handlers
  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      const response = await fetch(`/api/meals?mealId=${mealId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshData();
      } else {
        alert('Failed to delete meal');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal');
    }
  };

  const handleDeleteWater = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this water log?')) return;

    try {
      const response = await fetch(`/api/water?logId=${logId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshData();
      } else {
        alert('Failed to delete water log');
      }
    } catch (error) {
      console.error('Error deleting water log:', error);
      alert('Failed to delete water log');
    }
  };

  const handleDeleteWeight = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this weight log?')) return;

    try {
      const response = await fetch(`/api/weight?logId=${logId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshData();
      } else {
        alert('Failed to delete weight log');
      }
    } catch (error) {
      console.error('Error deleting weight log:', error);
      alert('Failed to delete weight log');
    }
  };

  const handleDeleteExercise = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      const response = await fetch(`/api/exercise?logId=${logId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        refreshData();
      } else {
        alert('Failed to delete workout');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-black p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Today</h1>
        <button className="text-[#3478F6] text-lg font-medium">Edit</button>
      </div>

      {/* Logging Progress Banner */}
      <div className="bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#2C2C2E] relative overflow-hidden">
        {/* Progress bar background decoration */}
        <div className="absolute top-0 left-0 right-0 h-32 opacity-20">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            <path
              d="M 0 80 Q 100 20, 200 60 T 400 50"
              stroke="#3478F6"
              strokeWidth="40"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-1">Logging Progress</p>
          <h2 className="text-white text-2xl font-bold mb-4">Powering up</h2>
          <p className="text-gray-300">
            You've logged <span className="text-[#3478F6] font-semibold">{todaysMeals.length} meals</span> and{' '}
            <span className="text-[#3478F6] font-semibold">{totalProtein}g of protein</span> today.{' '}
            <span className="text-gray-400">See how to boost your progress!</span>
          </p>
        </div>
      </div>

      {/* Calories Section */}
      <div className="bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#2C2C2E]">
        <h2 className="text-white text-2xl font-bold mb-6">Calories</h2>

        <div className="flex items-center justify-between">
          {/* Circular Progress */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#2C2C2E"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#caloriesGradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={getStrokeDashoffset(caloriesPercentage)}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-white text-3xl font-bold">{remainingCalories}</p>
              <p className="text-gray-400 text-sm">Remaining</p>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="flex-1 ml-8 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Base Goal</span>
              <span className="text-white font-semibold">{dailyGoals.calories}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Food</span>
              <span className="text-white font-semibold">{totalCalories}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Exercise</span>
              <span className="text-white font-semibold">0</span>
            </div>
            <div className="h-px bg-[#2C2C2E] my-2"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Remaining = Goal - Food + Exercise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Macros Section */}
      <div className="bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#2C2C2E]">
        <h2 className="text-white text-2xl font-bold mb-6">Macros</h2>

        <div className="grid grid-cols-3 gap-4">
          {/* Protein */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3" style={{ width: macroSize, height: macroSize }}>
              <svg width={macroSize} height={macroSize} className="transform -rotate-90">
                <circle
                  cx={macroSize / 2}
                  cy={macroSize / 2}
                  r={macroRadius}
                  stroke="#2C2C2E"
                  strokeWidth={macroStrokeWidth}
                  fill="none"
                />
                <circle
                  cx={macroSize / 2}
                  cy={macroSize / 2}
                  r={macroRadius}
                  stroke="url(#proteinGradient)"
                  strokeWidth={macroStrokeWidth}
                  fill="none"
                  strokeDasharray={macroCircumference}
                  strokeDashoffset={getMacroStrokeDashoffset(proteinPercentage)}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-white text-lg font-bold">{remainingProtein}</p>
                <p className="text-gray-500 text-xs">left</p>
              </div>
            </div>
            <p className="text-white text-sm font-semibold mb-1">Protein</p>
            <p className="text-gray-400 text-xs">{totalProtein} / {dailyGoals.protein}g</p>
          </div>

          {/* Carbs */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3" style={{ width: macroSize, height: macroSize }}>
              <svg width={macroSize} height={macroSize} className="transform -rotate-90">
                <circle
                  cx={macroSize / 2}
                  cy={macroSize / 2}
                  r={macroRadius}
                  stroke="#2C2C2E"
                  strokeWidth={macroStrokeWidth}
                  fill="none"
                />
                <circle
                  cx={macroSize / 2}
                  cy={macroSize / 2}
                  r={macroRadius}
                  stroke="url(#carbsGradient)"
                  strokeWidth={macroStrokeWidth}
                  fill="none"
                  strokeDasharray={macroCircumference}
                  strokeDashoffset={getMacroStrokeDashoffset(carbsPercentage)}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="carbsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-white text-lg font-bold">{remainingCarbs}</p>
                <p className="text-gray-500 text-xs">left</p>
              </div>
            </div>
            <p className="text-white text-sm font-semibold mb-1">Carbs</p>
            <p className="text-gray-400 text-xs">{totalCarbs} / {dailyGoals.carbs}g</p>
          </div>

          {/* Fats */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3" style={{ width: macroSize, height: macroSize }}>
              <svg width={macroSize} height={macroSize} className="transform -rotate-90">
                <circle
                  cx={macroSize / 2}
                  cy={macroSize / 2}
                  r={macroRadius}
                  stroke="#2C2C2E"
                  strokeWidth={macroStrokeWidth}
                  fill="none"
                />
                <circle
                  cx={macroSize / 2}
                  cy={macroSize / 2}
                  r={macroRadius}
                  stroke="url(#fatsGradient)"
                  strokeWidth={macroStrokeWidth}
                  fill="none"
                  strokeDasharray={macroCircumference}
                  strokeDashoffset={getMacroStrokeDashoffset(fatsPercentage)}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="fatsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-white text-lg font-bold">{remainingFats}</p>
                <p className="text-gray-500 text-xs">left</p>
              </div>
            </div>
            <p className="text-white text-sm font-semibold mb-1">Fats</p>
            <p className="text-gray-400 text-xs">{totalFats} / {dailyGoals.fats}g</p>
          </div>
        </div>
      </div>

      {/* Meals History */}
      <div className="bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#2C2C2E]">
        <h2 className="text-white text-2xl font-bold mb-4">Today's Meals</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading meals...</p>
          </div>
        ) : todaysMeals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-300 mb-2">No meals logged yet</p>
            <p className="text-sm text-gray-500">Use the + button to log your meals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysMeals.map((meal) => {
              const mealTime = new Date(meal.logged_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div key={meal.id} className="bg-[#2C2C2E] rounded-xl p-4 border border-[#3A3A3C] relative">
                  {/* Edit & Delete buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => setEditingMeal(meal)}
                      className="text-gray-500 hover:text-[#3478F6] transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Header with time and context */}
                  <div className="flex items-center justify-between mb-2 pr-16">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{mealTime}</span>
                      {meal.context && (
                        <span className="text-xs bg-[#3478F6] text-white px-2 py-1 rounded-full">
                          {meal.context}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meal name */}
                  <p className="text-white font-medium mb-3">{meal.meal_name}</p>

                  {/* Macros grid */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Cal</p>
                      <p className="text-sm font-bold text-white">{meal.calories || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Protein</p>
                      <p className="text-sm font-bold text-white">{meal.protein_g ? Math.round(meal.protein_g) : 0}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Carbs</p>
                      <p className="text-sm font-bold text-white">{meal.carbs_g ? Math.round(meal.carbs_g) : 0}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fats</p>
                      <p className="text-sm font-bold text-white">{meal.fats_g ? Math.round(meal.fats_g) : 0}g</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Water Intake Section */}
      <div className="bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#2C2C2E]">
        <h2 className="text-white text-2xl font-bold mb-4">Water</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading water logs...</p>
          </div>
        ) : (
          <>
            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Daily Goal: 64 oz</span>
                <span className="text-white text-lg font-bold">{totalWater} oz</span>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-4 bg-[#2C2C2E] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#06B6D4] to-[#0891B2] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalWater / 64) * 100, 100)}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                {totalWater >= 64 ? '🎉 Goal reached!' : `${64 - totalWater} oz remaining`}
              </p>
            </div>

            {/* Water Logs */}
            {waterLogs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">💧</p>
                <p className="text-gray-300 mb-2">No water logged yet</p>
                <p className="text-sm text-gray-500">Stay hydrated!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase mb-3">Today's Entries</p>
                {waterLogs.map((log) => {
                  const logTime = new Date(log.logged_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-[#2C2C2E] group">
                      <span className="text-gray-400 text-sm">{logTime}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold">{log.ounces} oz</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingWater(log)}
                            className="text-gray-500 hover:text-[#3478F6] transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteWater(log.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Weight Tracking Section */}
      <div className="bg-[#1C1C1E] rounded-3xl p-6 mb-6 border border-[#2C2C2E]">
        <h2 className="text-white text-2xl font-bold mb-4">Weight</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading weight logs...</p>
          </div>
        ) : weightLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">⚖️</p>
            <p className="text-gray-300 mb-2">No weight logged yet</p>
            <p className="text-sm text-gray-500">Track your progress!</p>
          </div>
        ) : (
          <>
            {/* Latest Weight */}
            <div className="bg-[#2C2C2E] rounded-xl p-6 mb-4 text-center border border-[#3A3A3C] relative">
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setEditingWeight(weightLogs[0])}
                  className="text-gray-500 hover:text-[#3478F6] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteWeight(weightLogs[0].id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-2">Current Weight</p>
              <p className="text-white text-4xl font-bold mb-1">{weightLogs[0].weight_lbs} lbs</p>
              <p className="text-xs text-gray-500">
                Logged {new Date(weightLogs[0].logged_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Weight Trend */}
            {weightLogs.length > 1 && (
              <div className="bg-[#2C2C2E] rounded-xl p-4 border border-[#3A3A3C]">
                <p className="text-gray-400 text-sm mb-2">Recent Trend</p>
                <div className="flex items-center gap-2">
                  {weightLogs[0].weight_lbs < weightLogs[1].weight_lbs ? (
                    <>
                      <span className="text-green-400 text-2xl">↓</span>
                      <span className="text-green-400 font-semibold">
                        -{(weightLogs[1].weight_lbs - weightLogs[0].weight_lbs).toFixed(1)} lbs
                      </span>
                    </>
                  ) : weightLogs[0].weight_lbs > weightLogs[1].weight_lbs ? (
                    <>
                      <span className="text-red-400 text-2xl">↑</span>
                      <span className="text-red-400 font-semibold">
                        +{(weightLogs[0].weight_lbs - weightLogs[1].weight_lbs).toFixed(1)} lbs
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 text-2xl">→</span>
                      <span className="text-gray-400 font-semibold">No change</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Exercise Section */}
      <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]">
        <h2 className="text-white text-2xl font-bold mb-4">Exercise</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading exercise logs...</p>
          </div>
        ) : exerciseLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">💪</p>
            <p className="text-gray-300 mb-2">No workouts logged yet</p>
            <p className="text-sm text-gray-500">Get moving!</p>
          </div>
        ) : (
          <>
            {/* Exercise Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#2C2C2E] rounded-xl p-4 text-center border border-[#3A3A3C]">
                <p className="text-gray-400 text-xs mb-1">Total Time</p>
                <p className="text-white text-2xl font-bold">{exerciseTotals.totalMinutes}</p>
                <p className="text-gray-500 text-xs">minutes</p>
              </div>
              <div className="bg-[#2C2C2E] rounded-xl p-4 text-center border border-[#3A3A3C]">
                <p className="text-gray-400 text-xs mb-1">Calories Burned</p>
                <p className="text-white text-2xl font-bold">{exerciseTotals.totalCalories}</p>
                <p className="text-gray-500 text-xs">cal</p>
              </div>
            </div>

            {/* Exercise Logs */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase mb-3">Today's Workouts</p>
              {exerciseLogs.map((log) => {
                const logTime = new Date(log.logged_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <div key={log.id} className="bg-[#2C2C2E] rounded-xl p-4 border border-[#3A3A3C] relative">
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => setEditingExercise(log)}
                        className="text-gray-500 hover:text-[#3478F6] transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(log.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-2 pr-16">
                      <span className="text-sm font-semibold text-white">{logTime}</span>
                      <span className="text-xs bg-[#3478F6] text-white px-2 py-1 rounded-full capitalize">
                        {log.exercise_type}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-3">{log.exercise_name}</p>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-bold text-white">{log.duration_minutes} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Calories</p>
                        <p className="text-sm font-bold text-white">{log.calories_burned} cal</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Edit Modals */}
      <EditMealModal
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        userId={userId}
        meal={editingMeal}
        onMealUpdated={refreshData}
      />

      <EditWaterModal
        isOpen={!!editingWater}
        onClose={() => setEditingWater(null)}
        userId={userId}
        log={editingWater}
        onUpdated={refreshData}
      />

      <EditWeightModal
        isOpen={!!editingWeight}
        onClose={() => setEditingWeight(null)}
        userId={userId}
        log={editingWeight}
        onUpdated={refreshData}
      />

      <EditExerciseModal
        isOpen={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        userId={userId}
        log={editingExercise}
        onUpdated={refreshData}
      />
    </div>
  );
}
