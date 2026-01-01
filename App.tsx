
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
        
        {/* Intro para Leitores de Tela */}
        <section className="sr-only">
          <h2>Bem-vindo ao MangaNarrator</h2>
          <p>Esta aplicação utiliza Inteligência Artificial Gemini para descrever mangás visualmente e narrar textos para usuários cegos ou com baixa visão em Português do Brasil.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Área Principal de Conteúdo */}
          <div className="lg:col-span-8 space-y-8">
            <NarrativeViewport 
              unit={currentUnit} 
              isLoading={isProcessing} 
            />
            
            {narrator.status === PlaybackStatus.ERROR && (
              <div role="alert" className="p-6 bg-red-900/30 border border-red-500 rounded-xl text-red-200">
                <h3 className="font-bold text-lg mb-2">Ops! Ocorreu um erro</h3>
                <p>{narrator.error}</p>
                <button 
                  onClick={() => narrator.togglePlayback()}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!currentUnit && !isProcessing && (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800">
                <p className="text-slate-400 text-lg mb-2">Pronto para começar sua leitura?</p>
                <p className="text-slate-500 italic">Faça o upload de uma página ou use o exemplo para iniciar a narração adaptada.</p>
              </div>
            )}
          </div>

          {/* Painel Lateral */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  Gerenciar Conteúdo
                </h3>
              </div>
              <MangaUploader 
                onProcessing={setIsProcessing}
                onProcessed={(units) => {
                  narrator.setUnits(units);
                  setTimeout(() => narrator.initAudio(), 100);
                }}
              />
            </div>

            <div className="p-6 bg-sky-950/20 rounded-2xl border border-sky-500/20 text-sky-200/70 text-sm leading-relaxed">
              <p className="font-bold text-sky-400 mb-2">Comandos Rápidos</p>
              <ul className="space-y-1">
                <li><kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs text-white">Espaço</kbd> Tocar / Pausar</li>
                <li><kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs text-white">← / →</kbd> Mudar quadrinho</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Anunciador Global de Status (Aria Live) */}
      <div className="sr-only" aria-live="polite">
        {narrator.status === PlaybackStatus.IDLE && narrator.units.length > 0 ? "Pronto para reproduzir." : ""}
        {narrator.status === PlaybackStatus.PLAYING ? "Lendo." : ""}
        {narrator.status === PlaybackStatus.PAUSED ? "Pausado." : ""}
        {isProcessing ? "Analisando imagem e gerando descrições visuais em português..." : ""}
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
      
      <footer className="py-8 px-6 text-center text-slate-600 text-xs border-t border-slate-900 mt-auto" role="contentinfo">
        <p>MangaNarrator v1.1.0 — Empoderando a leitura inclusiva através de IA Generativa.</p>
        <p className="mt-2">Conformidade WCAG 2.1 AAA & Gemini AI Vision em Português.</p>
      </footer>
    </div>
  );
};

export default App;
