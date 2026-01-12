
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReelContent } from './types';
import { fetchReels, generateReelImage, generateSpeech } from './services/geminiService';
import Header from './components/Header';
import Reel from './components/Reel';
import SavedItemsView from './components/SavedItemsView';

type ViewMode = 'feed' | 'saved';

const App: React.FC = () => {
  const [reels, setReels] = useState<ReelContent[]>([]);
  const [savedReels, setSavedReels] = useState<ReelContent[]>(() => {
    const saved = localStorage.getItem('mindreels_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  
  // Track which reels are currently being processed to avoid duplicate calls
  const processingIdsRef = useRef<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('mindreels_saved', JSON.stringify(savedReels));
  }, [savedReels]);

  const loadMoreReels = useCallback(async () => {
    setError(null);
    try {
      const newReels = await fetchReels();
      if (newReels && newReels.length > 0) {
        setReels(prev => [...prev, ...newReels]);
      } else if (reels.length === 0) {
        setError("Failed to generate content. Please check your connection or API key.");
      }
    } catch (err) {
      console.error("Failed to fetch reels", err);
      if (reels.length === 0) {
        setError("Something went wrong while connecting to the AI.");
      }
    } finally {
      setLoading(false);
    }
  }, [reels.length]);

  // The Preloading Queue Logic
  useEffect(() => {
    if (viewMode !== 'feed' || reels.length === 0) return;

    const preloadNext = async () => {
      // Look ahead: Process current and next 2 reels
      const lookAheadCount = 3;
      const range = reels.slice(activeIdx, activeIdx + lookAheadCount);

      for (const reel of range) {
        // Only process if not already processed and not currently processing
        if (!reel.imageUrl && !processingIdsRef.current.has(reel.id)) {
          processingIdsRef.current.add(reel.id);
          
          try {
            // Generate Image and Speech in parallel for maximum speed
            const textToSpeak = `${reel.title}. ${reel.content}`;
            const [img, audio] = await Promise.all([
              generateReelImage(reel.imagePrompt),
              generateSpeech(textToSpeak)
            ]);

            setReels(currentReels => 
              currentReels.map(r => 
                r.id === reel.id 
                  ? { ...r, imageUrl: img, audioBase64: audio } 
                  : r
              )
            );
          } catch (err) {
            console.error(`Failed to preload assets for reel ${reel.id}`, err);
          } finally {
            // We keep it in the set to prevent retries of failed ones in the same session
            // but the reel state update above is what matters for the UI
          }
        }
      }
    };

    preloadNext();
  }, [activeIdx, reels, viewMode]);

  useEffect(() => {
    loadMoreReels();
  }, [loadMoreReels]);

  const handleScroll = () => {
    if (!scrollContainerRef.current || viewMode !== 'feed') return;
    const scrollPos = scrollContainerRef.current.scrollTop;
    const windowHeight = window.innerHeight;
    const index = Math.round(scrollPos / windowHeight);
    
    if (index !== activeIdx) {
      setActiveIdx(index);
    }

    if (index >= reels.length - 2 && !loading) {
      setLoading(true);
      loadMoreReels();
    }
  };

  const scrollToReel = (index: number) => {
    if (index < 0 || index >= reels.length || !scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'feed') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToReel(activeIdx + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToReel(activeIdx - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, viewMode, reels.length]);

  const toggleSave = (reel: ReelContent) => {
    setSavedReels(prev => {
      const isSaved = prev.some(r => r.id === reel.id);
      if (isSaved) {
        return prev.filter(r => r.id !== reel.id);
      } else {
        return [...prev, reel];
      }
    });
  };

  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <i className="fas fa-exclamation-triangle text-indigo-500 text-5xl mb-6"></i>
        <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
        <p className="text-white/60 mb-8">{error}</p>
        <button onClick={() => { setLoading(true); loadMoreReels(); }} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-500">Retry</button>
      </div>
    );
  }

  if (reels.length === 0 && loading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-xl shadow-indigo-500/50">
          <i className="fas fa-brain text-white text-3xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Preparing Your Mind</h1>
        <p className="text-indigo-400 font-medium">Generating cognitive challenges...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      <Header />
      
      {viewMode === 'feed' ? (
        <div className="relative h-full w-full">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 pointer-events-none">
            <button 
              onClick={() => scrollToReel(activeIdx - 1)}
              disabled={activeIdx === 0}
              className={`w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-all ${activeIdx === 0 ? 'opacity-0 scale-75' : 'hover:bg-white/20 active:scale-90 opacity-40 hover:opacity-100'}`}
            >
              <i className="fas fa-chevron-up"></i>
            </button>
            <button 
              onClick={() => scrollToReel(activeIdx + 1)}
              disabled={activeIdx === reels.length - 1}
              className={`w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-all ${activeIdx === reels.length - 1 ? 'opacity-0 scale-75' : 'hover:bg-white/20 active:scale-90 opacity-40 hover:opacity-100'}`}
            >
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>

          <div className="absolute right-1 top-1/4 bottom-1/4 w-0.5 bg-white/10 z-40 rounded-full overflow-hidden">
            <div className="w-full bg-indigo-500 scroll-progress-line shadow-[0_0_8px_rgba(99,102,241,0.8)]" style={{ height: `${((activeIdx + 1) / Math.max(reels.length, 1)) * 100}%` }} />
          </div>

          <div ref={scrollContainerRef} onScroll={handleScroll} className="snap-container">
            {reels.map((reel, idx) => (
              <Reel 
                key={reel.id} 
                reel={reel} 
                isActive={idx === activeIdx}
                isSaved={savedReels.some(r => r.id === reel.id)}
                onToggleSave={() => toggleSave(reel)}
              />
            ))}
            {loading && (
              <div className="snap-item flex items-center justify-center bg-black/50">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SavedItemsView savedReels={savedReels} onRemove={toggleSave} onBack={() => setViewMode('feed')} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/90 to-transparent z-50 flex justify-around items-center px-6 pointer-events-auto">
        <button onClick={() => { if (viewMode === 'feed') scrollToReel(0); setViewMode('feed'); }} className={`flex flex-col items-center transition-all duration-300 ${viewMode === 'feed' ? 'text-indigo-400 scale-110' : 'text-white/50 hover:text-white'}`}>
          <i className="fas fa-fire text-2xl"></i>
          <span className="text-[10px] mt-1 uppercase font-black tracking-tighter">Explore</span>
        </button>
        <button className="flex flex-col items-center text-white/50 hover:text-white transition-colors">
          <i className="fas fa-compass text-2xl"></i>
          <span className="text-[10px] mt-1 uppercase font-bold tracking-tighter">Search</span>
        </button>
        <button className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg transform -translate-y-4 hover:scale-110 active:scale-95 transition-all shadow-indigo-500/40">
          <i className="fas fa-plus text-xl"></i>
        </button>
        <button onClick={() => setViewMode('saved')} className={`flex flex-col items-center transition-all duration-300 ${viewMode === 'saved' ? 'text-indigo-400 scale-110' : 'text-white/50 hover:text-white'}`}>
          <i className="fas fa-vault text-2xl"></i>
          <span className="text-[10px] mt-1 uppercase font-black tracking-tighter">Vault</span>
        </button>
        <button className="flex flex-col items-center text-white/50 hover:text-white transition-colors">
          <i className="fas fa-user-circle text-2xl"></i>
          <span className="text-[10px] mt-1 uppercase font-bold tracking-tighter">You</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
