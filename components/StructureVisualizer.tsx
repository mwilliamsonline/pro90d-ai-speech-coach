
import React from 'react';

interface Props {
    mode: 'structure_vic' | 'structure_ric';
}

const StructureVisualizer: React.FC<Props> = ({ mode }) => {
    const items = mode === 'structure_vic' 
        ? [
            { l: 'V', t: 'Value', d: 'Is this valuable to them?' },
            { l: 'I', t: 'Impact', d: 'Does it engage them?' },
            { l: 'C', t: 'Clarity', d: 'Is it easy to understand?' }
          ]
        : [
            { l: 'R', t: 'Relevant', d: 'Does it matter now?' },
            { l: 'I', t: 'Impactful', d: 'Will they remember it?' },
            { l: 'C', t: 'Clear', d: 'Is the message precise?' }
          ];

    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold text-center text-white mb-8">
                {mode === 'structure_vic' ? 'V.I.C. Model' : 'R.I.C. Model'}
            </h3>
            
            <div className="grid grid-cols-3 gap-4 md:gap-8">
                {items.map((item, idx) => (
                    <div key={item.l} className="flex flex-col items-center group">
                        <div className={`
                            w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mb-4
                            bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300
                        `}>
                            <span className="text-4xl md:text-5xl font-black text-white">{item.l}</span>
                        </div>
                        <h4 className="text-xl font-bold text-indigo-300 mb-2">{item.t}</h4>
                        <p className="text-xs text-slate-400 text-center">{item.d}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-300">
                    Use this checklist <strong>before</strong> you speak to ensure confidence.
                </p>
            </div>
        </div>
    );
};

export default StructureVisualizer;
