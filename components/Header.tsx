
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
          <i className="fas fa-brain text-white text-xl"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
          Mind<span className="text-indigo-400">Reels</span>
        </h1>
      </div>
      <div className="flex gap-4 pointer-events-auto">
        <button className="text-white hover:text-indigo-300 transition-colors">
          <i className="fas fa-search text-xl"></i>
        </button>
        <button className="text-white hover:text-indigo-300 transition-colors">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
