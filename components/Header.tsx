
import React from 'react';
import { ICONS } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-950 border-b-4 border-slate-900 py-3 px-6 flex justify-between items-center z-50" role="banner">
      <div className="flex items-center gap-4">
        <div className="p-1.5 bg-rose-600 border-2 border-rose-500 shadow-[3px_3px_0px_#000]">
          {ICONS.Accessibility}
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter italic text-slate-50">
          Manga<span className="text-sky-500">Narrator</span>
          <span className="ml-2 text-[8px] border border-sky-500/50 text-sky-500 px-1 py-0.5 rounded-sm not-italic tracking-normal">v1.4.0</span>
        </h1>
      </div>
      
      <div className="hidden md:flex gap-6 items-center">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">System Status</span>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            AI Core Ready
          </span>
        </div>
      </div>
    </header>
  );
};
