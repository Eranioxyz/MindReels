
import React, { useState } from 'react';
import { ReelContent, ReelType } from '../types';

interface Props {
  reel: ReelContent;
}

const InteractionOverlay: React.FC<Props> = ({ reel }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (reel.type === ReelType.CHALLENGE && reel.interaction) {
    return (
      <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 mb-4 mx-4">
        <p className="text-indigo-300 font-semibold mb-3 text-sm tracking-wider uppercase">Challenge</p>
        <h3 className="text-lg font-bold mb-4">{reel.interaction.question}</h3>
        <div className="grid grid-cols-1 gap-2">
          {reel.interaction.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelected(opt);
                setShowResult(true);
              }}
              className={`p-3 rounded-xl border transition-all text-left ${
                showResult 
                  ? opt === reel.interaction?.correctAnswer 
                    ? 'bg-green-500/40 border-green-500' 
                    : opt === selected ? 'bg-red-500/40 border-red-500' : 'bg-white/5 border-white/10'
                  : 'bg-white/10 border-white/10 hover:bg-white/20 active:scale-95'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {showResult && (
          <p className="mt-4 text-sm font-medium animate-pulse text-indigo-200">
            {selected === reel.interaction.correctAnswer ? 'Correct! 🧠' : `Wait, it was: ${reel.interaction.correctAnswer}`}
          </p>
        )}
      </div>
    );
  }

  if (reel.type === ReelType.MNEMONIC && reel.interaction) {
    return (
      <div className="p-6 bg-indigo-900/40 backdrop-blur-md rounded-2xl border border-indigo-500/30 mb-4 mx-4">
        <p className="text-indigo-300 font-semibold mb-2 text-sm uppercase tracking-widest">Mnemonic Technique</p>
        <h3 className="text-xl font-bold mb-2 text-white">{reel.interaction.technique}</h3>
        <p className="text-white/90 leading-relaxed italic border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-500/10">
          "{reel.content}"
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 mb-4 mx-4">
       <p className="text-indigo-300 font-semibold mb-2 text-sm uppercase tracking-widest">
         {reel.type === ReelType.TIDBIT ? 'Did You Know?' : 'Mind Exercise'}
       </p>
       <h3 className="text-xl font-bold mb-2">{reel.title}</h3>
       <p className="text-white/80 leading-relaxed">{reel.content}</p>
    </div>
  );
};

export default InteractionOverlay;
