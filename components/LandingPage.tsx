'use client';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-white">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="w-28 h-28 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-3xl mb-8 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform mx-auto">
          <span className="text-6xl">💪</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Meet Chad
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-600 mb-8">
          Your AI fitness & nutrition buddy. Track meals, hit your macros, crush your goals.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <div className="px-4 py-2 bg-violet-50 rounded-full text-violet-700 text-sm font-medium">
            💬 Text your meals
          </div>
          <div className="px-4 py-2 bg-pink-50 rounded-full text-pink-700 text-sm font-medium">
            📊 Auto-track macros
          </div>
          <div className="px-4 py-2 bg-violet-50 rounded-full text-violet-700 text-sm font-medium">
            🎯 Personalized plans
          </div>
          <div className="px-4 py-2 bg-pink-50 rounded-full text-pink-700 text-sm font-medium">
            🧠 AI recommendations
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="w-full px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Let's Go 🚀
        </button>

        {/* Social Proof */}
        <p className="text-sm text-gray-500 mt-6">
          Text Chad about what you're eating, get instant feedback
        </p>
      </div>
    </div>
  );
}
