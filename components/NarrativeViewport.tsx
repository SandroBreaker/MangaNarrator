
import React from 'react';
import { NarrativeUnit, PlaybackStatus } from '../types';

interface Props {
  unit: NarrativeUnit | null;
  isLoading: boolean;
  playbackStatus?: PlaybackStatus;
}

export const NarrativeViewport: React.FC<Props> = ({ unit, isLoading, playbackStatus }) => {
  const isGeneratingAudio = playbackStatus === PlaybackStatus.PROCESSING;

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="w-20 h-20 border-8 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(34,211,238,0.4)]"></div>
        <div className="text-cyan-400 font-black tracking-[0.4em] uppercase text-lg animate-pulse">Sincronizando Realidade...</div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="w-full aspect-video bg-black border-4 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-700 relative group overflow-hidden">
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="text-6xl mb-4 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">⚔️</div>
        <p className="text-2xl font-black uppercase tracking-widest">Aguardando Missão</p>
        <p className="text-sm font-bold opacity-60">Upload de mangá necessário para iniciar o teatro mental.</p>
      </div>
    );
  }

  return (
    <article className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" aria-live="polite">
      {/* Container da Imagem estilo Manga Panel */}
      <div className="relative group rounded-[2rem] border-4 border-white bg-black shadow-[20px_20px_0px_rgba(255,255,255,0.05)] overflow-hidden">
        <img 
          src={unit.imageUrl} 
          alt={`Cena: ${unit.description}`} 
          className="w-full h-auto max-h-[70vh] object-contain transition-all duration-1000 group-hover:scale-105"
        />
        
        {/* Overlay de Processamento Estilo Anime */}
        {isGeneratingAudio && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="flex gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className="w-4 h-16 bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[bounce_0.8s_infinite]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <p className="text-white font-black text-3xl uppercase italic tracking-tighter drop-shadow-lg">
              Gerando <span className="text-cyan-400">Teatro Mental</span>
            </p>
          </div>
        )}
        
        <div className="absolute top-6 left-6 bg-white text-black font-black px-4 py-1 skew-x-[-12deg] text-xs uppercase tracking-widest shadow-xl">
          Painel de Imersão
        </div>
      </div>

      {/* Narrative Card - Estilo Caixa de Diálogo de RPG de Luxo */}
      <div className="relative bg-[#0a0a0a] border-2 border-slate-800 p-12 rounded-3xl shadow-2xl before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-cyan-500 before:to-fuchsia-500">
        <div className="absolute -top-6 left-10 bg-fuchsia-600 text-white px-6 py-2 font-black italic skew-x-[-15deg] shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
          VOCALIZAÇÃO ATIVA
        </div>

        <p className="text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight selection:bg-cyan-400 selection:text-black">
          {unit.combinedNarrative}
        </p>
        
        <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-800/50 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <span className="text-lg">🎙️</span>
            </div>
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Cast: <span className="text-white">{unit.voicePreference}</span>
            </span>
          </div>
          
          <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/5 text-[10px] font-bold text-slate-500 rounded uppercase tracking-[0.2em] border border-white/10">
              Fidelity: Ultra
            </span>
            {unit.originalText && (
              <span className="px-3 py-1 bg-cyan-500/10 text-[10px] font-bold text-cyan-400 rounded uppercase tracking-[0.2em] border border-cyan-500/20">
                Texto Capturado
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
