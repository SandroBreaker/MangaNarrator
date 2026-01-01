
import React from 'react';
import { ICONS } from '../constants';
import { PlaybackStatus } from '../types';

interface Props {
  status: PlaybackStatus;
  currentIndex: number;
  totalUnits: number;
  playbackSpeed: number;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSpeedChange: (speed: number) => void;
}

export const AccessiblePlayer: React.FC<Props> = ({
  status,
  currentIndex,
  totalUnits,
  playbackSpeed,
  onToggle,
  onNext,
  onPrev,
  onSpeedChange
}) => {
  const isPlaying = status === PlaybackStatus.PLAYING;
  const progress = totalUnits > 0 ? ((currentIndex + 1) / totalUnits) * 100 : 0;

  return (
    <div 
      id="player"
      className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-t-2 border-slate-800 p-8 z-[200] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
      role="region"
      aria-label="Console de Navegação"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
        
        {/* Progress & Meta */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-1">Capítulo Atual</span>
              <span className="text-2xl font-black text-white italic">PAINEL #{currentIndex + 1} <span className="text-slate-600">/ {totalUnits}</span></span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Sincronia</span>
              <span className="text-xl font-mono text-cyan-400">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(34,211,238,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Master Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="p-4 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-800 active:scale-90"
            aria-label="Página Anterior"
          >
            {ICONS.Prev}
          </button>

          <button 
            onClick={onToggle}
            className={`group relative p-8 rounded-full transition-all duration-300 active:scale-95 shadow-2xl ${isPlaying ? 'bg-rose-600' : 'bg-cyan-500'}`}
            aria-label={isPlaying ? "Congelar Cena" : "Despertar Narrativa"}
          >
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-inherit"></div>
            <div className="text-black group-hover:scale-110 transition-transform">
              {isPlaying ? ICONS.Pause : ICONS.Play}
            </div>
          </button>

          <button 
            onClick={onNext}
            disabled={currentIndex >= totalUnits - 1}
            className="p-4 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-800 active:scale-90"
            aria-label="Próxima Página"
          >
            {ICONS.Next}
          </button>
        </div>

        {/* Elite Options */}
        <div className="flex items-center gap-6 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
          <div className="flex flex-col px-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ritmo</span>
            <select 
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="bg-transparent text-white text-sm font-black outline-none cursor-pointer focus:text-cyan-400 transition-colors"
              aria-label="Velocidade da Voz"
            >
              <option value="0.75">Lento</option>
              <option value="1.0">Normal</option>
              <option value="1.25">Ágil</option>
              <option value="1.5">Rápido</option>
              <option value="2.0">Berserk</option>
            </select>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div className="p-2 text-cyan-500 bg-cyan-500/10 rounded-lg">
            {ICONS.Ghost}
          </div>
        </div>
      </div>
    </div>
  );
};
