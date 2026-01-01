
import React from 'react';
import { NarrativeUnit } from '../types';

interface Props {
  unit: NarrativeUnit | null;
  isLoading: boolean;
  isFocusMode?: boolean;
}

export const NarrativeViewport: React.FC<Props> = ({ unit, isLoading, isFocusMode }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-slate-800 rounded-xl flex items-center justify-center animate-pulse" aria-hidden="true">
        <div className="text-slate-500 font-medium">Processando página...</div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="w-full aspect-video bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-600 italic">
        Aguardando upload de conteúdo.
      </div>
    );
  }

  return (
    <article 
      className={`w-full space-y-6 transition-all duration-700 ${isFocusMode ? 'scale-[1.02]' : ''}`} 
      aria-live="polite"
    >
      <div className={`relative group overflow-hidden rounded-2xl border-4 transition-all duration-700 ${isFocusMode ? 'border-sky-500 shadow-[0_0_50px_rgba(56,189,248,0.3)]' : 'border-slate-800'} bg-black`}>
        <img 
          src={unit.imageUrl} 
          alt={`Visual do painel: ${unit.description}`} 
          className="w-full h-auto max-h-[60vh] object-contain transition-transform duration-500"
        />
        {!isFocusMode && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
            <p className="text-white text-sm italic">Imagem processada via Visão Computacional</p>
          </div>
        )}
      </div>

      <div className={`bg-slate-900 border-l-8 transition-all duration-700 p-8 rounded-r-xl shadow-2xl ${isFocusMode ? 'border-sky-400 bg-slate-900/100' : 'border-sky-500'}`}>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Narração Atual</h3>
        <p className={`font-bold leading-relaxed text-slate-50 selection:bg-sky-500/30 transition-all duration-700 ${isFocusMode ? 'text-4xl' : 'text-3xl'}`}>
          {unit.combinedNarrative}
        </p>
        <div className="mt-6 flex gap-3">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-sky-400 font-mono">
            {unit.originalText ? "Contém Diálogo" : "Apenas Descrição"}
          </span>
          {isFocusMode && (
             <span className="px-3 py-1 bg-sky-500/20 rounded-full text-xs text-sky-400 font-bold animate-pulse">
              Modo Imersivo Ativo
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
