import React, { useEffect, useState } from 'react';

const BreathingVisualizer: React.FC = () => {
  // Phases: inhale (7s), hold (7s), exhale (7s)
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [seconds, setSeconds] = useState(1);

  useEffect(() => {
    // Timer for the seconds counter (1-7)
    const countInterval = setInterval(() => {
      setSeconds(s => (s >= 7 ? 1 : s + 1));
    }, 1000);

    // Timer for switching phases every 7 seconds
    const phaseInterval = setInterval(() => {
      setPhase(p => {
        if (p === 'inhale') return 'hold';
        if (p === 'hold') return 'exhale';
        return 'inhale';
      });
      setSeconds(1); // Reset counter on phase switch
    }, 7000);

    return () => {
      clearInterval(countInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl animate-fade-in">
      <h3 className="text-xl font-bold text-emerald-400 mb-6 tracking-wide">7x7x7 Breathing</h3>
      
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-slate-700/50 rounded-full"></div>
        
        {/* Animated Circle */}
        <div 
            className={`absolute rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 transition-all duration-[7000ms] ease-linear flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]
            ${phase === 'inhale' ? 'w-64 h-64 opacity-100' : ''}
            ${phase === 'hold' ? 'w-64 h-64 opacity-90 animate-pulse' : ''}
            ${phase === 'exhale' ? 'w-16 h-16 opacity-60' : ''}
            ${phase === 'inhale' && 'w-16 h-16'} 
            `}
        >
            <span className="text-5xl font-bold text-white drop-shadow-md">{seconds}</span>
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
          <div className="text-2xl font-semibold text-white uppercase tracking-widest">
            {phase === 'inhale' && "Inhale (Nose)"}
            {phase === 'hold' && "Hold Breath"}
            {phase === 'exhale' && "Exhale (Mouth)"}
          </div>
          <p className="text-sm text-slate-400">
              Activates the parasympathetic nervous system to reduce anxiety.
          </p>
      </div>
    </div>
  );
};

export default BreathingVisualizer;