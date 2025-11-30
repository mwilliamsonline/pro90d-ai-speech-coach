
import React from 'react';

interface Props {
  mode: 'neuroplasticity' | 'myelination' | 'habit_formation';
}

const ScienceVisualizer: React.FC<Props> = ({ mode }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-6 shadow-2xl animate-fade-in relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <span className="text-2xl">
            {mode === 'neuroplasticity' ? '🧠' : mode === 'myelination' ? '⚡' : '🛣️'}
        </span>
        {mode === 'neuroplasticity' && 'Neuroplasticity'}
        {mode === 'myelination' && 'Myelination'}
        {mode === 'habit_formation' && 'Habit Formation'}
      </h3>
      
      <div className="h-40 bg-slate-950/50 rounded-xl relative flex items-center justify-center overflow-hidden mb-4 border border-slate-800">
        
        {mode === 'neuroplasticity' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Neurons */}
            <div className="absolute left-1/4 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-pulse z-10"></div>
            <div className="absolute right-1/4 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-pulse z-10"></div>
            
            {/* Connection forming */}
            <div className="absolute left-1/4 top-1/2 h-0.5 bg-gradient-to-r from-indigo-400 to-transparent w-[50%] animate-[grow_2s_ease-in-out_infinite]"></div>
            
            {/* Firing signal */}
            <div className="absolute left-1/4 w-2 h-2 bg-white rounded-full shadow-sm animate-[travel_2s_linear_infinite]"></div>

            <p className="absolute bottom-2 text-xs text-indigo-300 font-medium">"Neurons that fire together, wire together."</p>
          </div>
        )}

        {mode === 'myelination' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
            {/* Neural Pathway getting thicker */}
            <div className="relative w-3/4 h-2 bg-slate-700 rounded-full overflow-hidden">
               <div className="absolute inset-0 bg-emerald-500/50 w-full animate-[shimmer_1.5s_infinite]"></div>
               {/* Myelin Sheath layers */}
               <div className="absolute inset-0 border-y-2 border-emerald-400 rounded-full opacity-50 animate-pulse"></div>
            </div>

            <div className="flex items-center gap-8 text-xs text-slate-400">
                <span>Practice</span>
                <span className="text-emerald-400 text-lg">→</span>
                <span>Speed & Automation</span>
            </div>

            <p className="absolute bottom-2 text-xs text-emerald-300 font-medium">Insulating the pathway for automatic speech.</p>
          </div>
        )}

        {mode === 'habit_formation' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Old Path (Fading) */}
                <div className="w-full h-8 border-b-2 border-dashed border-red-900/50 absolute top-8 flex items-center justify-center">
                    <span className="text-[10px] text-red-800/50 uppercase tracking-wider">Old Neural Pathway (Fading)</span>
                </div>

                {/* New Path (Building) */}
                <div className="w-3/4 h-12 bg-gradient-to-r from-slate-800 via-emerald-900/50 to-slate-800 mt-8 relative overflow-hidden rounded-lg border border-emerald-500/20">
                     {/* Paving animation */}
                     <div className="absolute inset-0 bg-emerald-500/20 w-full animate-[pave_3s_ease-out_infinite]"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-xs text-emerald-200 font-bold tracking-widest">NEW HABIT SUPERHIGHWAY</span>
                     </div>
                </div>
                <p className="absolute bottom-2 text-xs text-slate-400 font-medium">Repetition builds the new road.</p>
            </div>
        )}

      </div>

      <div className="text-sm text-slate-300 leading-relaxed">
        {mode === 'neuroplasticity' && "Every time you use a new speaking style, you physically create new connections in your brain. Old habits fade as new ones strengthen."}
        {mode === 'myelination' && "Consistent practice wraps these new neural pathways in myelin (insulation), making the signal faster, stronger, and automatic."}
        {mode === 'habit_formation' && "Think of your brain like a forest. The old speech is a well-worn path. We are building a new, paved superhighway through consistent repetition."}
      </div>

      <style>{`
        @keyframes grow {
          0% { width: 0; opacity: 0; }
          50% { width: 50%; opacity: 1; }
          100% { width: 50%; opacity: 0; }
        }
        @keyframes travel {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(180px); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pave {
            0% { width: 0%; }
            100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ScienceVisualizer;
