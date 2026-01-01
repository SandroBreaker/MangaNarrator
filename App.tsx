
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MangaUploader } from './components/MangaUploader';
import { NarrativeViewport } from './components/NarrativeViewport';
import { AccessiblePlayer } from './components/AccessiblePlayer';
import { useNarrator } from './hooks/useNarrator';
import { PlaybackStatus } from './types';
import { Key, Sparkles } from 'lucide-react';
import { ICONS } from './constants';

declare global {
  interface Window {
    // Fix: Using the global AIStudio type to match environment expectations and avoid modifier mismatches.
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const narrator = useNarrator();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasCustomKey(hasKey);
        } catch (e) {
          console.debug("Erro ao verificar estado da chave API");
        }
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasCustomKey(true);
      } catch (e) {
        console.error("Falha ao abrir seletor de chave");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        narrator.togglePlayback();
      } else if (e.code === 'ArrowRight') {
        narrator.nextUnit();
      } else if (e.code === 'ArrowLeft') {
        narrator.prevUnit();
      } else if (e.code === 'KeyF') {
        setIsFocusMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [narrator]);

  const currentUnit = narrator.units[narrator.currentIndex] || null;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-50 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-700`}>
      {/* Overlay de Foco */}
      <div 
        className={`fixed inset-0 bg-black/95 z-[45] transition-opacity duration-700 pointer-events-none ${isFocusMode ? 'opacity-100' : 'opacity-0'}`} 
        aria-hidden="true" 
      />

      <div className={isFocusMode ? 'opacity-20 pointer-events-none transition-opacity duration-700' : 'transition-opacity duration-700'}>
        <Header />
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 pb-48 relative">
        <section className="sr-only">
          <h2>Bem-vindo ao MangaNarrator</h2>
          <p>Esta aplicação utiliza Inteligência Artificial Gemini para descrever mangás visualmente e narrar textos para usuários cegos ou com baixa visão em Português do Brasil.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className={`lg:col-span-8 space-y-8 relative ${isFocusMode ? 'z-[50]' : ''}`}>
            <NarrativeViewport 
              unit={currentUnit} 
              isLoading={isProcessing || narrator.status === PlaybackStatus.PROCESSING}
              isFocusMode={isFocusMode}
            />
            
            <div className={isFocusMode ? 'hidden' : ''}>
              {narrator.status === PlaybackStatus.ERROR && (
                <div role="alert" className="p-6 bg-red-900/30 border border-red-500 rounded-xl text-red-200 shadow-2xl animate-in fade-in slide-in-from-top-4">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span>Ops! Ocorreu um erro</span>
                  </h3>
                  <p className="mb-4">{narrator.error}</p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => narrator.togglePlayback()}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors shadow-lg"
                    >
                      Tentar novamente
                    </button>
                    {narrator.error?.includes("Limite") && (
                      <button 
                        onClick={handleOpenKeySelector}
                        className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
                      >
                        <Key size={18} />
                        Usar Minha Própria Chave API
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!currentUnit && !isProcessing && (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800">
                  <p className="text-slate-400 text-lg mb-2">Pronto para começar sua leitura?</p>
                  <p className="text-slate-500 italic">Faça o upload de uma página ou use o exemplo para iniciar a narração adaptada.</p>
                </div>
              )}
            </div>
          </div>

          <aside className={`lg:col-span-4 space-y-6 transition-opacity duration-700 ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
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

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Configurações</h3>
              
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all ${isFocusMode ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
                aria-pressed={isFocusMode}
              >
                <div className="flex items-center gap-2">
                  {ICONS.Focus}
                  <span className="text-sm">Modo de Foco Imersivo</span>
                </div>
                <kbd className={`text-[10px] px-1.5 py-0.5 rounded ${isFocusMode ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-400'}`}>F</kbd>
              </button>

              <button 
                onClick={handleOpenKeySelector}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all ${hasCustomKey ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <Key size={18} />
                  <span className="text-sm font-bold">{hasCustomKey ? 'Chave Personalizada Ativa' : 'Usar Chave API Própria'}</span>
                </div>
              </button>
            </div>

            <div className="p-6 bg-sky-950/20 rounded-2xl border border-sky-500/20 text-sky-200/70 text-sm leading-relaxed">
              <p className="font-bold text-sky-400 mb-2">Comandos Rápidos</p>
              <ul className="space-y-1">
                <li><kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs text-white">Espaço</kbd> Tocar / Pausar</li>
                <li><kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs text-white">← / →</kbd> Mudar quadrinho</li>
                <li><kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs text-white">F</kbd> Modo de Foco</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <div className="sr-only" aria-live="polite">
        {isFocusMode ? "Modo de foco ativado. O restante da página foi escurecido." : "Modo de foco desativado."}
      </div>

      {narrator.units.length > 0 && (
        <div className={`relative z-[60]`}>
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
        </div>
      )}
      
      <footer className={`py-8 px-6 text-center text-slate-600 text-xs border-t border-slate-900 mt-auto transition-opacity duration-700 ${isFocusMode ? 'opacity-0' : 'opacity-100'}`} role="contentinfo">
        <p>MangaNarrator v1.3.0 — Empoderando a leitura inclusiva através de IA Generativa.</p>
      </footer>
    </div>
  );
};

export default App;
