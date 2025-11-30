
import React from 'react';

const ModelingVisualizer: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
      <h3 className="text-xl font-bold text-center text-indigo-400 mb-8 tracking-widest uppercase">The Science of Modeling</h3>

      <div className="relative h-48 w-full flex items-center justify-between px-4 md:px-12">
        
        {/* Current Self */}
        <div className="flex flex-col items-center z-10">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-500 mb-2 opacity-50">
                <span className="text-2xl">😐</span>
            </div>
            <p className="text-xs text-slate-400">Current Style</p>
        </div>

        {/* The Bridge / Leapfrog */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-20 flex flex-col items-center">
            {/* Arc */}
            <div className="w-full h-24 border-t-4 border-emerald-500 rounded-[50%] absolute top-0 opacity-50"></div>
            
            {/* Moving Signal */}
            <div className="w-4 h-4 bg-emerald-400 rounded-full absolute top-[-2px] animate-[arcMove_2s_infinite_linear] shadow-[0_0_15px_#34d399]"></div>

            <p className="mt-12 text-sm text-emerald-300 font-semibold bg-slate-900/80 px-3 py-1 rounded-full border border-emerald-500/30">
                Mirror Neurons
            </p>
        </div>

        {/* Model Persona */}
        <div className="flex flex-col items-center z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-indigo-300 mb-2 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <span className="text-4xl">😎</span>
            </div>
            <p className="text-xs text-indigo-300 font-bold">Model Persona</p>
        </div>

      </div>

      <div className="mt-6 text-center bg-slate-800/50 p-4 rounded-xl">
          <p className="text-sm text-slate-200">
              "Leapfrog over the valley of struggle by stepping into a new identity."
          </p>
      </div>

      <style>{`
        @keyframes arcMove {
            0% { left: 20%; top: 10px; }
            50% { top: -20px; }
            100% { left: 80%; top: 10px; }
        }
      `}</style>
    </div>
  );
};

export default ModelingVisualizer;
