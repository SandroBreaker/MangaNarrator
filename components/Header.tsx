
import React from 'react';
import { ICONS } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex justify-between items-center" role="banner">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sky-500 rounded-lg text-white">
          {ICONS.Accessibility}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-50">
          Manga<span className="text-sky-400">Narrator</span>
        </h1>
      </div>
      
      <nav aria-label="Main Navigation">
        <ul className="flex gap-4">
          <li>
            <a href="#uploader" className="text-slate-400 hover:text-white font-medium transition-colors p-2">
              Upload
            </a>
          </li>
          <li>
            <a href="#player" className="text-slate-400 hover:text-white font-medium transition-colors p-2">
              Leitor
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
