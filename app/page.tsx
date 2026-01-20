'use client';

import { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import OnboardingFlow, { OnboardingData } from '@/components/OnboardingFlow';
import ChatInterface from '@/components/ChatInterface';
import BottomNav from '@/components/BottomNav';
import GoalsView from '@/components/GoalsView';
import ProgressView from '@/components/ProgressView';
import LogView from '@/components/LogView';

export default function Home() {
  const [stage, setStage] = useState<'landing' | 'onboarding' | 'chat'>('landing');
  const [userProfile, setUserProfile] = useState<OnboardingData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'goals' | 'progress' | 'log'>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Set mobile viewport height CSS variable
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // Check for existing user on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('chadUserId');
    if (storedUserId) {
      // Load user profile from database
      fetch(`/api/user?userId=${storedUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setUserId(storedUserId);
            setUserProfile({
              name: data.name,
              heightInches: data.height_inches,
              weightLbs: data.weight_lbs,
              currentBodyFat: data.current_body_fat,
              goalType: data.goal_type,
              targetWeight: data.target_weight,
              targetBodyFat: data.target_body_fat,
            });
            setStage('chat');
          }
        })
        .catch(err => console.error('Error loading user:', err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleGetStarted = () => {
    setStage('onboarding');
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      // Save user profile to database
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.userId) {
        // Store userId in localStorage
        localStorage.setItem('chadUserId', result.userId);
        setUserId(result.userId);
        setUserProfile(data);
        setStage('chat');
      } else {
        console.error('Failed to create user:', result.error);
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <main className="h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💪</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      {stage === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
      {stage === 'onboarding' && <OnboardingFlow onComplete={handleOnboardingComplete} />}
      {stage === 'chat' && userProfile && (
        <>
          {/* Mobile: Full Screen (no iPhone frame) */}
          <div className="md:hidden fixed inset-0 w-full bg-black flex flex-col">
            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {activeTab === 'home' && <ChatInterface userName={userProfile.name} userProfile={userProfile} userId={userId!} />}
              {activeTab === 'goals' && <GoalsView userProfile={userProfile} userId={userId!} />}
              {activeTab === 'progress' && <ProgressView userProfile={userProfile} userId={userId!} />}
              {activeTab === 'log' && <LogView userId={userId!} />}
            </div>

            <BottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              userId={userId!}
              onDataUpdate={() => {
                // Force re-render of views by changing active tab momentarily
                const currentTab = activeTab;
                setActiveTab('home');
                setTimeout(() => setActiveTab(currentTab), 10);
              }}
            />
          </div>

          {/* Desktop/Tablet: iPhone Frame Mockup */}
          <div className="hidden md:flex h-screen items-center justify-center bg-gradient-to-br from-violet-100 via-pink-50 to-blue-100 p-8">
            {/* iPhone Frame */}
            <div className="relative w-full max-w-[700px] h-[calc(100vh-4rem)] bg-black rounded-[60px] shadow-2xl p-3">
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[32px] bg-black rounded-b-3xl z-10"></div>

              {/* iPhone Screen */}
              <div className="relative w-full h-full bg-black rounded-[48px] overflow-hidden flex flex-col">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-11 bg-[#1C1C1E] z-10 flex items-center justify-between px-8 pt-2">
                  <span className="text-[15px] font-semibold text-white">9:41</span>
                  <div className="flex items-center space-x-1">
                    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                      <rect x="0.5" y="3" width="15" height="8" rx="1.5" stroke="white" strokeOpacity="0.9" strokeWidth="1"/>
                      <path opacity="0.9" d="M16 5.5V8.5C16.8284 8.5 17.5 7.82843 17.5 7C17.5 6.17157 16.8284 5.5 16 5.5Z" fill="white"/>
                      <rect x="2" y="4.5" width="11" height="5" rx="1" fill="white"/>
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col mt-11">
                  {activeTab === 'home' && <ChatInterface userName={userProfile.name} userProfile={userProfile} userId={userId!} />}
                  {activeTab === 'goals' && <GoalsView userProfile={userProfile} userId={userId!} />}
                  {activeTab === 'progress' && <ProgressView userProfile={userProfile} userId={userId!} />}
                  {activeTab === 'log' && <LogView userId={userId!} />}
                </div>

                <BottomNav
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  userId={userId!}
                  onDataUpdate={() => {
                    // Force re-render of views by changing active tab momentarily
                    const currentTab = activeTab;
                    setActiveTab('home');
                    setTimeout(() => setActiveTab(currentTab), 10);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
