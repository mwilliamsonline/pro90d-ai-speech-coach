
import React from 'react';

interface Props {
  mode: 'proactive_overview' | 'proactive_extending' | 'proactive_blending' | 'proactive_inflecting' | 'proactive_articulating';
}

const ProactiveVisualizer: React.FC<Props> = ({ mode }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl animate-fade-in flex flex-col items-center justify-center min-h-[300px]">
      
      <h3 className="text-2xl font-bold text-indigo-400 mb-8 tracking-wide uppercase">
        {mode === 'proactive_overview' && "Proactive Speaking Skills"}
        {mode === 'proactive_extending' && "Skill: Extending"}
        {mode === 'proactive_blending' && "Skill: Blending"}
        {mode === 'proactive_inflecting' && "Skill: Inflecting"}
        {mode === 'proactive_articulating' && "Skill: Articulating"}
      </h3>

      <div className="flex-1 w-full flex items-center justify-center">
        
        {mode === 'proactive_overview' && (
          <div className="grid grid-cols-2 gap-4 w-full">
             {['Extending', 'Blending', 'Inflecting', 'Articulating'].map((skill) => (
                 <div key={skill} className="p-4 bg-slate-700/50 rounded-xl text-center border border-slate-600 text-slate-200">
                     {skill}
                 </div>
             ))}
          </div>
        )}

        {mode === 'proactive_extending' && (
          <div className="text-4xl font-bold text-white tracking-[0.5em] transition-all duration-1000 animate-pulse">
            S-T-R-E-T-C-H
          </div>
        )}

        {mode === 'proactive_blending' && (
          <div className="flex items-center justify-center gap-0 text-3xl font-bold text-white">
             <span className="bg-indigo-600/20 px-4 py-2 rounded-l-xl border-r-0 border border-indigo-500">No</span>
             <span className="bg-indigo-600/20 px-4 py-2 border-x-0 border border-indigo-500 relative -mx-1 z-10">Gaps</span>
             <span className="bg-indigo-600/20 px-4 py-2 rounded-r-xl border-l-0 border border-indigo-500">Here</span>
          </div>
        )}

        {mode === 'proactive_inflecting' && (
          <div className="relative h-32 w-full flex items-center justify-center">
             <svg viewBox="0 0 300 100" className="w-full h-full">
                <path 
                    d="M 10 50 Q 75 10, 150 50 T 290 50" 
                    fill="none" 
                    stroke="#818cf8" 
                    strokeWidth="4"
                    className="animate-[dash_2s_linear_infinite]"
                    strokeDasharray="300"
                    strokeDashoffset="300"
                />
                <circle cx="10" cy="50" r="4" fill="#fff" className="animate-[movePath_2s_linear_infinite]">
                   <animateMotion path="M 10 50 Q 75 10, 150 50 T 290 50" dur="2s" repeatCount="indefinite" />
                </circle>
             </svg>
             <style>{`
                @keyframes dash {
                  to { stroke-dashoffset: 0; }
                }
             `}</style>
          </div>
        )}

        {mode === 'proactive_articulating' && (
          <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-2">
                  {['C', 'R', 'I', 'S', 'P'].map((char, i) => (
                      <div key={i} className="w-12 h-12 bg-white text-slate-900 font-bold text-xl flex items-center justify-center rounded-lg shadow-[0_4px_0_#cbd5e1] active:shadow-none active:translate-y-[4px] transition-all animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s`}}>
                          {char}
                      </div>
                  ))}
              </div>
              <p className="text-slate-400 text-sm mt-4">Use mouth, lips, and jaw fully.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProactiveVisualizer;
