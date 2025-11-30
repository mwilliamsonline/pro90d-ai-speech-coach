
import React from 'react';

const ComparisonVisualizer: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
      <h3 className="text-2xl font-bold text-center text-white mb-8 tracking-tight">Mindset Shift</h3>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 relative">
        
        {/* Old Style */}
        <div className="flex-1 bg-red-900/10 border border-red-900/30 rounded-xl p-6 flex flex-col items-center gap-4 opacity-60">
            <div className="text-3xl">🛑</div>
            <h4 className="text-red-400 font-bold uppercase tracking-wider text-sm">Old Identity</h4>
            <ul className="text-sm text-red-200/70 space-y-2 text-center">
                <li>Reactive</li>
                <li>Rushed / Fast</li>
                <li>Anxious</li>
                <li>Avoiding Words</li>
            </ul>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
        </div>

        {/* New Style */}
        <div className="flex-1 bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 flex flex-col items-center gap-4 transform scale-105 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="text-3xl">🚀</div>
            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">New Identity</h4>
            <ul className="text-sm text-emerald-100 space-y-2 text-center font-medium">
                <li>Proactive (Initiator)</li>
                <li>Smooth & Calm</li>
                <li>Confident</li>
                <li>Expressive</li>
            </ul>
            <div className="mt-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-[10px] text-emerald-300 uppercase tracking-widest animate-pulse">
                Current Goal
            </div>
        </div>

      </div>
      
      <div className="mt-8 text-center text-slate-400 text-sm italic">
          "You are replacing an old habit with a new, dominant speaking identity."
      </div>
    </div>
  );
};

export default ComparisonVisualizer;
