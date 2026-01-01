
import React from 'react';
import { ICONS } from '../constants';
import { PlaybackStatus, VoiceName } from '../types';

interface Props {
  status: PlaybackStatus;
  currentIndex: number;
  totalUnits: number;
  playbackSpeed: number;
  selectedVoice?: VoiceName;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSpeedChange: (speed: number) => void;
  onVoiceChange?: (voice: VoiceName) => void;
  isFocusMode?: boolean;
}

export const AccessiblePlayer: React.FC<Props> = ({
  status,
  currentIndex,
  totalUnits,
  playbackSpeed,
  selectedVoice = 'Fenrir',
  onToggle,
  onNext,
  onPrev,
  onSpeedChange,
  onVoiceChange,
  isFocusMode
}) => {
  const isPlaying = status === PlaybackStatus.PLAYING;
  const progress = totalUnits > 0 ? ((currentIndex + 1) / totalUnits) * 100 : 0;

  return (
    <div 
      className={`w-full border-t-4 border-slate-800 transition-all duration-1000 px-6 py-4 ${isFocusMode ? 'bg-black/40 border-transparent shadow-none' : 'bg-slate-950 shadow-[0_-15px_40px_rgba(0,0,0,0.8)]'}`}
      role="region"
      aria-label="Console de Navegação"
    >
      <div className={`max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center gap-8 ${isFocusMode ? 'opacity-20 hover:opacity-100 transition-opacity' : ''}`}>
        
        {/* Barra de Sincronia */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-[9px] font-black text-sky-500 uppercase italic tracking-widest">Protocol Sync // P-{currentIndex + 1}</span>
            <span className="text-[9px] font-black text-slate-600 italic uppercase">Progresso: {Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-900 border-2 border-slate-800 p-[2px]">
            <div 
              className="h-full bg-sky-500 transition-all duration-500 shadow-[0_0_20px_rgba(56,189,248,0.5)] relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]"></div>
            </div>
          </div>
        </div>

        {/* Configurações de Áudio (Voz e Velocidade) */}
        <div className="flex items-center gap-4">
          {/* Seletor de Voz */}
          <div className="flex items-center gap-2 bg-slate-900 border-2 border-slate-800 px-3 py-2">
            <span className="text-[8px] font-black text-slate-500 uppercase italic">Voz</span>
            <select 
              value={selectedVoice}
              onChange={(e) => onVoiceChange?.(e.target.value as VoiceName)}
              className="bg-transparent text-emerald-400 text-[10px] font-black uppercase focus:outline-none cursor-pointer"
              aria-label="Selecionar Voz do Narrador"
            >
              <option value="Fenrir">Fenrir (Épico)</option>
              <option value="Kore">Kore (Suave)</option>
              <option value="Puck">Puck (Jovem)</option>
              <option value="Charon">Charon (Sério)</option>
              <option value="Zephyr">Zephyr (Neutro)</option>
            </select>
          </div>

          {/* Seletor de Velocidade */}
          <div className="flex items-center gap-2 bg-slate-900 border-2 border-slate-800 px-3 py-2">
            <span className="text-[8px] font-black text-slate-500 uppercase italic">Rate</span>
            <select 
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="bg-transparent text-sky-500 text-[10px] font-black uppercase focus:outline-none cursor-pointer"
              aria-label="Selecionar Velocidade de Narração"
            >
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>

        {/* Core Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 flex items-center justify-center bg-slate-900 text-slate-500 hover:text-white border-2 border-slate-800 hover:border-sky-500 disabled:opacity-10 transition-all active:scale-90"
            aria-label="Voltar Painel"
          >
            {ICONS.Prev}
          </button>

          <button 
            onClick={onToggle}
            className={`w-16 h-16 flex items-center justify-center border-4 transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[6px_6px_0px_#000] ${isPlaying ? 'bg-rose-600 border-rose-500 text-white' : 'bg-sky-500 border-sky-400 text-slate-950'}`}
            aria-label={isPlaying ? "Pausar" : "Ouvir Painel"}
          >
            {isPlaying ? ICONS.Pause : ICONS.Play}
          </button>

          <button 
            onClick={onNext}
            disabled={currentIndex >= totalUnits - 1 || totalUnits === 0}
            className="w-12 h-12 flex items-center justify-center bg-slate-900 text-slate-500 hover:text-white border-2 border-slate-800 hover:border-sky-500 disabled:opacity-10 transition-all active:scale-90"
            aria-label="Próximo Painel"
          >
            {ICONS.Next}
          </button>
        </div>
      </div>
    </div>
  );
};
