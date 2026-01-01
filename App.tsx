import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MangaUploader } from './components/MangaUploader';
import { NarrativeViewport } from './components/NarrativeViewport';
import { AccessiblePlayer } from './components/AccessiblePlayer';
import { useNarrator } from './hooks/useNarrator';
import { PlaybackStatus } from './types';
import { Key, Target, RotateCcw } from 'lucide-react';
import { ICONS } from './constants';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const narrator = useNarrator();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showRestoreMsg, setShowRestoreMsg] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (narrator.units.length > 0) {
      setShowRestoreMsg(true);
      const timer = setTimeout(() => setShowRestoreMsg(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') { e.preventDefault(); narrator.togglePlayback(); }
      else if (e.code === 'ArrowRight') narrator.nextUnit();
      else if (e.code === 'ArrowLeft') narrator.prevUnit();
      else if (e.code === 'KeyF') setIsFocusMode(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [narrator]);

  const currentUnit = narrator.units[narrator.currentIndex] || null;

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden relative">
      <div 
        className={`fixed inset-0 bg-black/98 z-[45] transition-opacity duration-1000 pointer-events-none ${isFocusMode ? 'opacity-100' : 'opacity-0'}`} 
        aria-hidden="true" 
      />

      <div className={`${isFocusMode ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100 h-auto'} transition-all duration-700`}>
        <Header />
      </div>

      <main className="flex-1 flex overflow-hidden w-full max-w-[1800px] mx-auto p-4 md:p-6 gap-6 relative">
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-700 relative ${isFocusMode ? 'z-[50] justify-center' : ''}`}>
          
          {showRestoreMsg && !isFocusMode && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-500">
              <div className="bg-sky-500 text-slate-950 px-4 py-2 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <RotateCcw size={14} className="animate-spin-slow" />
                Sessão Anterior Restaurada
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0">
            <NarrativeViewport 
              unit={currentUnit} 
              isLoading={isProcessing || narrator.status === PlaybackStatus.PROCESSING}
              isFocusMode={isFocusMode}
              onUploadTrigger={triggerFileUpload}
            />
          </div>

          {!isFocusMode && narrator.status === PlaybackStatus.ERROR && (
            <div role="alert" className="mt-4 p-4 bg-rose-950/40 border-4 border-rose-600 rounded-none shadow-[6px_6px_0px_#000] text-rose-100 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-rose-600"></div>
                <div>
                  <p className="font-black uppercase italic text-sm tracking-tighter">Erro de Sistema</p>
                  <p className="text-xs opacity-80">{narrator.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className={`w-[340px] flex-col gap-6 overflow-y-auto pr-2 transition-all duration-700 hidden lg:flex ${isFocusMode ? 'opacity-0 pointer-events-none translate-x-12' : 'opacity-100 translate-x-0'}`}>
          <div className="bg-slate-900 border-4 border-slate-800 p-4 shadow-[8px_8px_0px_#1e293b] relative group">
            <div className="absolute top-0 right-0 w-8 h-8 bg-sky-500/10 flex items-center justify-center border-b-4 border-l-4 border-slate-800">
              <Target size={12} className="text-sky-500" />
            </div>
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-sky-400 mb-4 italic">
              Terminal de Upload
            </h3>
            <MangaUploader 
              onProcessing={setIsProcessing}
              onProcessed={(units) => {
                narrator.setUnits(units);
                setTimeout(() => narrator.initAudio(), 100);
              }}
              externalTriggerRef={fileInputRef}
            />
          </div>

          <div className="bg-slate-900 border-4 border-slate-800 p-5 shadow-[8px_8px_0px_#1e293b] space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-rose-500 italic">Core Settings</h3>
            
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`w-full py-3 px-4 flex items-center justify-between border-2 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${isFocusMode ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-[4px_4px_0px_#000] font-black' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-500 shadow-[4px_4px_0px_#000]'}`}
            >
              <div className="flex items-center gap-3">
                {ICONS.Focus}
                <span className="font-black uppercase text-[11px] tracking-widest italic">Modo Zen</span>
              </div>
              <kbd className="text-[9px] bg-black/30 px-2 py-0.5 rounded border border-white/10 font-bold">F</kbd>
            </button>

            <button 
              onClick={handleOpenKeySelector}
              className={`w-full py-3 px-4 flex items-center justify-between border-2 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${hasCustomKey ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400 shadow-[4px_4px_0px_#000]' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500 shadow-[4px_4px_0px_#000]'}`}
            >
              <div className="flex items-center gap-3">
                <Key size={16} />
                <span className="font-black uppercase text-[11px] tracking-widest italic">{hasCustomKey ? 'API Ativa' : 'Unlock Pro AI'}</span>
              </div>
            </button>
          </div>

          <div className="mt-auto p-4 bg-slate-900/30 border-2 border-dashed border-slate-800 text-[9px] text-slate-600 font-black uppercase tracking-widest leading-loose italic">
            <p className="text-sky-600 mb-1 tracking-tighter">— Controller Shortcuts —</p>
            <div className="flex flex-col gap-1">
              <span>[Space] Toggle Audio Link</span>
              <span>[Arrows] Jump Panels</span>
              <span>[F] Immersion Protocol</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Input de arquivo invisível para ser acionado de qualquer lugar (mobile friendly) */}
      <div className="hidden">
        {!narrator.units.length && (
           <MangaUploader 
            onProcessing={setIsProcessing}
            onProcessed={(units) => {
              narrator.setUnits(units);
              setTimeout(() => narrator.initAudio(), 100);
            }}
            externalTriggerRef={fileInputRef}
          />
        )}
      </div>

      <div className={`transition-all duration-700 ${isFocusMode ? 'z-[60]' : ''}`}>
        <AccessiblePlayer 
          status={narrator.status}
          currentIndex={narrator.currentIndex}
          totalUnits={narrator.units.length}
          playbackSpeed={narrator.playbackSpeed}
          selectedVoice={narrator.selectedVoice}
          onToggle={narrator.togglePlayback}
          onNext={narrator.nextUnit}
          onPrev={narrator.prevUnit}
          onSpeedChange={narrator.setSpeed}
          onVoiceChange={narrator.setVoice}
          isFocusMode={isFocusMode}
        />
      </div>
    </div>
  );
};

export default App;