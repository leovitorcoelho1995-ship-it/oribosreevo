
import React from 'react';
import { Platform, Category, SearchMode, Period, Region } from '../types';
import { CATEGORIES, PLATFORMS } from '../constants';

interface HeaderProps {
  search: string;
  setSearch: (v: string) => void;
  platform: Platform | 'All';
  setPlatform: (p: Platform | 'All') => void;
  category: Category | 'All';
  setCategory: (c: Category | 'All') => void;
  searchMode: SearchMode;
  setSearchMode: (m: SearchMode) => void;
  period: Period;
  setPeriod: (p: Period) => void;
  region: Region;
  setRegion: (r: Region) => void;
}

const Header: React.FC<HeaderProps> = ({
  search, setSearch,
  platform, setPlatform,
  category, setCategory,
  searchMode, setSearchMode,
  period, setPeriod,
  region, setRegion
}) => {
  return (
    <header className="h-20 border-b border-white/5 glass flex items-center px-8 space-x-3 z-10 sticky top-0 overflow-x-auto">
      <div className="flex-1 min-w-[200px] flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-orange-500/50 transition-colors">
        <span className="text-gray-500 mr-2 text-xs">🔍</span>
        <input
          type="text"
          placeholder="Buscar palavra-chave, título ou canal..."
          className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Search Mode Toggle */}
      <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/5 shrink-0">
        {[SearchMode.GENERAL, SearchMode.TRENDING].map((mode) => (
          <button
            key={mode}
            onClick={() => setSearchMode(mode)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${searchMode === mode
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-500 hover:text-white'
              }`}
          >
            {mode === SearchMode.TRENDING ? '🔥 ' : ''}{mode}
          </button>
        ))}
      </div>

      {/* Region Selector - Only visible/impactful for Trending if logic is applied, but requested in header */}
      <div className="relative shrink-0">
        <select
          className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-[10px] text-white outline-none focus:border-orange-500 cursor-pointer appearance-none pr-8 hover:bg-slate-800 transition-colors font-bold uppercase tracking-tighter"
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
        >
          {Object.values(Region).map((r) => (
            <option key={r} value={r} className="bg-[#030712] text-white">
              {r}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500 text-[8px]">
          ▼
        </div>
      </div>

      {/* Platform Toggle */}
      <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/5 shrink-0">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p as any)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${platform === p
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'text-gray-500 hover:text-white'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Period Filter */}
      <div className="relative shrink-0">
        <select
          className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-[10px] text-white outline-none focus:border-orange-500 cursor-pointer appearance-none pr-8 hover:bg-slate-800 transition-colors font-bold uppercase tracking-tighter"
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
        >
          {Object.values(Period).map((p) => (
            <option key={p} value={p} className="bg-[#030712] text-white">
              {p}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500 text-[8px]">
          ▼
        </div>
      </div>

      {/* Category Filter */}
      <div className="relative shrink-0">
        <select
          className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-[10px] text-white outline-none focus:border-orange-500 cursor-pointer appearance-none pr-8 hover:bg-slate-800 transition-colors font-bold uppercase tracking-tighter"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          <option value="All" className="bg-[#030712] text-white">Categorias</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-[#030712] text-white">
              {cat}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500 text-[8px]">
          ▼
        </div>
      </div>
    </header>
  );
};

export default Header;
