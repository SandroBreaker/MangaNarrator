
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MangaUploader } from './components/MangaUploader';
import { NarrativeViewport } from './components/NarrativeViewport';
import { AccessiblePlayer } from './components/AccessiblePlayer';
import { useNarrator } from './hooks/useNarrator';
import { PlaybackStatus } from './types';

const App: React.FC = () => {
  const narrator = useNarrator();
  const [isProcessing, setIsProcessing] = useState(false);

  // Acessibilidade do teclado: atalhos globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        narrator.togglePlayback();
      } else if (e.code === 'ArrowRight') {
        narrator.nextUnit();
      } else if (e.code === 'ArrowLeft') {
        narrator.prevUnit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [narrator]);

  const currentUnit = narrator.units[narrator.currentIndex] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col selection:bg-sky-500 selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 pb-48">
        
        <section className="sr-only">
          <h2>MangaNarrator</h2>
          <p>Leitor inclusivo com IA Gemini para audiodescrição de mangás em Português.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <NarrativeViewport 
              unit={currentUnit} 
              isLoading={isProcessing} 
              playbackStatus={narrator.status}
            />
            
            {narrator.status === PlaybackStatus.ERROR && (
              <div role="alert" className="p-8 bg-red-950/40 border-2 border-red-500 rounded-3xl text-red-100 flex items-center gap-6">
                <div className="text-4xl">⚠️</div>
                <div>
                  <h3 className="font-black text-xl mb-1 uppercase tracking-tight">Erro Crítico</h3>
                  <p className="opacity-80">{narrator.error}</p>
                  <button 
                    onClick={() => narrator.togglePlayback()}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-black uppercase text-xs hover:bg-red-500 transition-all"
                  >
                    Reiniciar Narrativa
                  </button>
                </div>
              </div>
            )}

            {!currentUnit && !isProcessing && (
              <div className="text-center py-24 bg-slate-900/20 rounded-[3rem] border-2 border-slate-800/50 backdrop-blur-sm">
                <p className="text-slate-500 text-xl font-medium mb-2">Sua história começa aqui.</p>
                <p className="text-slate-600 italic text-sm">Faça o upload da sua página favorita para ativar o Teatro Mental.</p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-800/30">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">
                  Entrada de Conteúdo
                </h3>
              </div>
              <MangaUploader 
                isProcessing={isProcessing}
                onProcessing={setIsProcessing}
                onProcessed={(units) => {
                  narrator.setUnits(units);
                  setTimeout(() => narrator.initAudio(), 100);
                }}
              />
            </div>

            <div className="p-8 bg-sky-500/5 rounded-3xl border border-sky-500/10 text-sky-200/50 text-xs font-bold leading-relaxed">
              <p className="text-sky-500 mb-3 uppercase tracking-widest">Atalhos do Sistema</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Play / Pause</span>
                  <kbd className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700 text-white font-mono">Espaço</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mudar Painel</span>
                  <kbd className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700 text-white font-mono">← / →</kbd>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Anunciador de Status */}
      <div className="sr-only" aria-live="polite">
        {isProcessing ? "Analisando página do mangá..." : ""}
        {narrator.status === PlaybackStatus.PROCESSING ? "Preparando voz e interpretação..." : ""}
        {narrator.status === PlaybackStatus.PLAYING ? "Narrando." : ""}
      </div>

      {narrator.units.length > 0 && (
        <AccessiblePlayer 
          status={narrator.status}
          currentIndex={narrator.currentIndex}
          totalUnits={narrator.units.length}
          playbackSpeed={narrator.playbackSpeed}
          onToggle={narrator.togglePlayback}
          onNext={narrator.nextUnit}
          onPrev={narrator.prevUnit}
          onSpeedChange={narrator.setSpeed}
        />
      )}
    </div>
  );
};

export default App;
