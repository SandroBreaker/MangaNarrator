
import React from 'react';
import { ICONS } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="bg-black border-b-2 border-slate-800 py-6 px-8 flex justify-between items-center sticky top-0 z-[100] backdrop-blur-md bg-opacity-80" role="banner">
      <div className="flex items-center gap-4 group">
        <div className="p-2.5 bg-cyan-500 rounded-br-2xl text-black transition-transform group-hover:rotate-12">
          {ICONS.Manga}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-baseline gap-1">
            MANGA<span className="text-cyan-400">NARRATOR</span>
            <span className="text-xs font-light text-slate-500 ml-2 hidden sm:inline-block tracking-widest uppercase">漫画・ナレーター</span>
          </h1>
        </div>
      </div>
      
      <nav aria-label="Navegação de Elite" className="hidden md:block">
        <ul className="flex gap-8">
          <li>
            <a href="#uploader" className="text-slate-400 hover:text-cyan-400 font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
              Novo Capítulo
            </a>
          </li>
          <li>
            <a href="#player" className="text-slate-400 hover:text-fuchsia-500 font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full"></span>
              Modo Imersão
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
