import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MangaUploader } from './components/MangaUploader';
import { NarrativeViewport } from './components/NarrativeViewport';
import { AccessiblePlayer } from './components/AccessiblePlayer';
import { useNarrator } from './hooks/useNarrator';
import { PlaybackStatus } from './types';
import { Key, RotateCcw } from 'lucide-react';
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
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showRestoreMsg, setShowRestoreMsg] = useState(false);
  const [ariaAnnounce, setAriaAnnounce] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screen Reader Announcer
  useEffect(() => {
    if (processingStatus) {
      setAriaAnnounce(`Status: ${processingStatus}`);
    } else if (narrator.status === PlaybackStatus.PLAYING) {
      const unit = narrator.units[narrator.currentIndex];
      if (unit) setAriaAnnounce(`Lendo painel ${narrator.currentIndex + 1}: ${unit.combinedNarrative}`);
    }
  }, [processingStatus, narrator.status, narrator.currentIndex]);

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
          console.debug("API Key check error");
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
        console.error("Key selector failed");
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') { 
        e.preventDefault(); 
        narrator.togglePlayback(); 
      }
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
      {/* Aria Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaAnnounce}
      </div>

      <div 
        className={`fixed inset-0 bg-black/98 z-[45] transition-opacity duration-1000 pointer-events-none ${isFocusMode ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className={`${isFocusMode ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100 h-auto'} transition-all duration-700`}>
        <Header />
      </div>

      <main className="flex-1 flex overflow-hidden w-full max-w-[1800px] mx-auto p-4 md:p-6 gap-6 relative">
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-700 relative ${isFocusMode ? 'z-[50] justify-center' : ''}`}>
          
          {showRestoreMsg && !isFocusMode && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-500">
              <div className="bg-sky-500 text-slate-950 px-4 py-2 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <RotateCcw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                Sessão Restaurada
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0">
            <NarrativeViewport 
              unit={currentUnit} 
              processingStatus={processingStatus || (narrator.status === PlaybackStatus.PROCESSING ? "Narração..." : null)}
              isFocusMode={isFocusMode}
              onUploadTrigger={triggerFileUpload}
            />
          </div>

          {!isFocusMode && narrator.status === PlaybackStatus.ERROR && (
            <div role="alert" className="mt-4 p-4 bg-rose-950/40 border-4 border-rose-600 text-rose-100">
              <p className="font-black uppercase italic text-sm tracking-tighter">Erro: {narrator.error}</p>
            </div>
          )}
        </div>

        <aside className={`w-[340px] flex-col gap-6 overflow-y-auto pr-2 hidden lg:flex ${isFocusMode ? 'hidden' : ''}`}>
          <div className="bg-slate-900 border-4 border-slate-800 p-4 shadow-[8px_8px_0px_#1e293b]">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-sky-400 mb-4 italic">Painel de Controle</h3>
            <MangaUploader 
              onProcessing={setProcessingStatus}
              onProcessed={(units) => {
                narrator.setUnits(units);
                setTimeout(() => narrator.initAudio(), 100);
              }}
              externalTriggerRef={fileInputRef}
            />
          </div>

          <div className="bg-slate-900 border-4 border-slate-800 p-5 shadow-[8px_8px_0px_#1e293b] space-y-4">
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`w-full py-3 px-4 flex items-center justify-between border-2 transition-all hover:bg-slate-800 ${isFocusMode ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
              aria-pressed={isFocusMode}
            >
              <div className="flex items-center gap-3">
                {ICONS.Focus}
                <span className="font-black uppercase text-[11px] italic">Modo Zen (F)</span>
              </div>
            </button>

            <button 
              onClick={handleOpenKeySelector}
              className={`w-full py-3 px-4 flex items-center justify-between border-2 transition-all hover:brightness-110 ${hasCustomKey ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' : 'border-slate-700 text-slate-500 bg-slate-900'}`}
            >
              <div className="flex items-center gap-3">
                <Key size={16} />
                <span className="font-black uppercase text-[11px] italic">{hasCustomKey ? 'API Ativa' : 'Unlock Pro AI'}</span>
              </div>
            </button>
          </div>
        </aside>
      </main>

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