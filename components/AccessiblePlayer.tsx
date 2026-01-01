
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
      className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-6 z-50"
      role="region"
      aria-label="Controles de Reprodução"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
        
        {/* Progress & Info */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-tighter">
            <span>Painel {currentIndex + 1} de {totalUnits}</span>
            <span aria-hidden="true">{Math.round(progress)}% Concluído</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="h-full bg-sky-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Core Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="p-4 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Painel Anterior"
          >
            {ICONS.Prev}
          </button>

          <button 
            onClick={onToggle}
            className={`p-6 rounded-full ${isPlaying ? 'bg-amber-500' : 'bg-sky-500'} text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-lg`}
            aria-label={isPlaying ? "Pausar Narração" : "Iniciar Narração"}
          >
            {isPlaying ? ICONS.Pause : ICONS.Play}
          </button>

          <button 
            onClick={onNext}
            disabled={currentIndex >= totalUnits - 1}
            className="p-4 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Próximo Painel"
          >
            {ICONS.Next}
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-500 pl-2 pr-1 uppercase">Velocidade</span>
          <select 
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="bg-slate-800 text-slate-200 text-sm font-bold p-2 rounded-xl border-none focus:ring-2 focus:ring-sky-500 outline-none"
            aria-label="Ajustar velocidade da voz"
          >
            <option value="0.75">0.75x</option>
            <option value="1.0">Normal</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">Rápida</option>
          </select>
        </div>
      </div>
      
      {/* Visual focus hidden skip link for keyboard users */}
      <div className="sr-only" aria-live="assertive">
        {status === PlaybackStatus.PROCESSING ? "Processando áudio via Inteligência Artificial..." : ""}
        {status === PlaybackStatus.PLAYING ? `Lendo painel ${currentIndex + 1}` : ""}
      </div>
    </div>
  );
};
