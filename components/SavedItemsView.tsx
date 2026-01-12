
import React from 'react';
import { ReelContent, ReelType } from '../types';

interface Props {
  savedReels: ReelContent[];
  onRemove: (reel: ReelContent) => void;
  onBack: () => void;
}

const SavedItemsView: React.FC<Props> = ({ savedReels, onRemove, onBack }) => {
  const categories = [ReelType.MNEMONIC, ReelType.CHALLENGE, ReelType.TIDBIT, ReelType.EXERCISE];

  return (
    <div className="h-screen w-screen bg-neutral-950 overflow-y-auto pb-32 animate-slide-up">
      <div className="pt-24 px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Your Vault</h2>
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <i className="fas fa-times text-white"></i>
          </button>
        </div>

        {savedReels.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center px-10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <i className="fas fa-bookmark text-white/20 text-4xl"></i>
            </div>
            <p className="text-white/40 font-medium text-lg">Your knowledge vault is empty.</p>
            <p className="text-white/20 text-sm mt-2">Bookmark interesting challenges or mnemonics from your feed to see them here.</p>
            <button 
              onClick={onBack}
              className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500 transition-colors"
            >
              Explore Feed
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map(category => {
              const items = savedReels.filter(r => r.type === category);
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs border-b border-indigo-500/20 pb-2 flex justify-between items-center">
                    {category}S
                    <span className="bg-indigo-500/20 px-2 py-0.5 rounded-md text-[10px]">{items.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        className="p-5 bg-white/5 rounded-2xl border border-white/10 relative group overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onRemove(item)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                        <h4 className="text-white font-bold text-lg pr-8">{item.title}</h4>
                        <p className="text-white/60 text-sm mt-2 leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                          {item.content}
                        </p>
                        {item.interaction?.technique && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <span className="text-[10px] text-indigo-300 font-black uppercase block mb-1">Method</span>
                            <p className="text-indigo-100 text-sm font-semibold">{item.interaction.technique}</p>
                          </div>
                        )}
                        {item.interaction?.question && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                             <span className="text-[10px] text-green-300 font-black uppercase block mb-1">Challenge</span>
                             <p className="text-green-100 text-sm font-semibold">{item.interaction.question}</p>
                             <p className="text-green-500 text-[10px] mt-1">Answer: {item.interaction.correctAnswer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedItemsView;
