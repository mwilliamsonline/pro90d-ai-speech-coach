
import React from 'react';

interface Props {
    activePhase: number; // 0 = Overview, 1-4 = Specific Phase
}

const FreeFlowVisualizer: React.FC<Props> = ({ activePhase }) => {
    const phases = [
        { 
            id: 1, 
            title: "Phase 1: Continuous Flow", 
            desc: "Take a super deep breath. Speak continuously (babble) without thinking until you run out of air. Do not stop.",
            science: "Retrains the brain to maintain airflow and overcome blocking."
        },
        { 
            id: 2, 
            title: "Phase 2: Slow Down", 
            desc: "Super deep breath. Continuous flow, but speak slower to gain more control.",
            science: "Builds control and reduces the rush sensation."
        },
        { 
            id: 3, 
            title: "Phase 3: Topic Focus", 
            desc: "Deep breath. Pick a specific topic. Maintain smooth rhythm and constant airflow.",
            science: "Integrates cognitive processing with the new physical breathing habit."
        },
        { 
            id: 4, 
            title: "Phase 4: Natural Speech", 
            desc: "Normal deep breath. Speak in phrases. Pause and breathe naturally between phrases.",
            science: "Bridges the practice technique into real-world conversational rhythm."
        },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-indigo-400 mb-4 text-center">Free-Flow Speaking Exercise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phases.map((p) => (
                        <div 
                            key={p.id} 
                            className={`p-5 rounded-xl border transition-all duration-500 flex flex-col gap-2 ${
                                activePhase === p.id 
                                ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-[1.02] z-10' 
                                : activePhase === 0 
                                    ? 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                                    : 'bg-slate-800/50 border-slate-800 opacity-50 grayscale'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <h4 className={`font-bold text-lg ${activePhase === p.id ? 'text-white' : 'text-slate-300'}`}>
                                    {p.title}
                                </h4>
                                {activePhase === p.id && <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"/>}
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed">
                                {p.desc}
                            </p>
                            {(activePhase === p.id || activePhase === 0) && (
                                <div className="mt-2 pt-3 border-t border-indigo-500/30">
                                    <p className="text-xs text-indigo-300 italic">
                                        <span className="font-semibold">Science:</span> {p.science}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <p className="text-xs text-slate-500">
                        Use specific Pro90D techniques: Extending, Blending, and Inflecting during these phases.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FreeFlowVisualizer;
