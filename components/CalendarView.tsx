'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CalendarViewProps {
  userId: string;
}

interface DayData {
  date: string;
  totalCalories: number;
  mealsCount: number;
  meals: Array<{
    meal_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    logged_at: string;
  }>;
}

export default function CalendarView({ userId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Map<string, DayData>>(new Map());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load calendar data for current month
  useEffect(() => {
    loadMonthData();
  }, [currentDate, userId]);

  const loadMonthData = async () => {
    setIsLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];

    // Fetch all meals for this month
    const { data: meals } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${startDate}T00:00:00`)
      .lte('logged_at', `${endDate}T23:59:59`)
      .order('logged_at', { ascending: true });

    // Group meals by date
    const dataByDate = new Map<string, DayData>();

    if (meals) {
      for (const meal of meals) {
        const date = meal.logged_at.split('T')[0];

        if (!dataByDate.has(date)) {
          dataByDate.set(date, {
            date,
            totalCalories: 0,
            mealsCount: 0,
            meals: [],
          });
        }

        const dayData = dataByDate.get(date)!;
        dayData.totalCalories += meal.calories || 0;
        dayData.mealsCount += 1;
        dayData.meals.push({
          meal_name: meal.meal_name,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fats_g: meal.fats_g,
          logged_at: meal.logged_at,
        });
      }
    }

    setCalendarData(dataByDate);
    setIsLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayData = calendarData.get(dateStr);
    setSelectedDay(dayData || { date: dateStr, totalCalories: 0, mealsCount: 0, meals: [] });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#1C1C1E] px-4 py-3 flex-shrink-0">
        <h1 className="text-xl font-semibold text-center">Food Calendar</h1>
      </div>

      {/* Month Navigation */}
      <div className="bg-[#1C1C1E] px-4 py-2 flex items-center justify-between border-t border-[#2C2C2E] flex-shrink-0">
        <button
          onClick={previousMonth}
          className="text-[#3478F6] text-lg px-2 py-1"
        >
          ‹
        </button>
        <span className="text-base font-medium">{monthName}</span>
        <button
          onClick={nextMonth}
          className="text-[#3478F6] text-lg px-2 py-1"
        >
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = calendarData.get(dateStr);
            const isToday = dateStr === today;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                  isToday ? 'bg-[#3478F6] text-white' : 'bg-[#2C2C2E]'
                } ${dayData ? 'border border-green-500' : ''}`}
              >
                <div className="font-medium">{day}</div>
                {dayData && (
                  <div className="text-[9px] text-gray-400 mt-0.5">
                    {dayData.totalCalories}cal
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <div className="mt-4 bg-[#1C1C1E] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                {new Date(selectedDay.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h2>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>

            {selectedDay.meals.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No meals logged</p>
            ) : (
              <>
                <div className="mb-3 pb-3 border-b border-[#2C2C2E]">
                  <div className="text-sm text-gray-400">Total</div>
                  <div className="text-xl font-semibold text-white">
                    {selectedDay.totalCalories} cal
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {selectedDay.mealsCount} {selectedDay.mealsCount === 1 ? 'meal' : 'meals'}
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedDay.meals.map((meal, index) => (
                    <div key={index} className="bg-[#2C2C2E] rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-sm font-medium text-white flex-1">
                          {meal.meal_name}
                        </div>
                        <div className="text-xs text-gray-400 ml-2">
                          {new Date(meal.logged_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {meal.calories}cal | {Math.round(meal.protein_g)}g protein | {Math.round(meal.carbs_g)}g carbs | {Math.round(meal.fats_g)}g fat
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
