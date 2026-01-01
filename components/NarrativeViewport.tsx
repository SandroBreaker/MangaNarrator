import React from 'react';
import { NarrativeUnit } from '../types';
import { Upload } from 'lucide-react';

interface Props {
  unit: NarrativeUnit | null;
  isLoading: boolean;
  isFocusMode?: boolean;
  onUploadTrigger?: () => void;
}

export const NarrativeViewport: React.FC<Props> = ({ unit, isLoading, isFocusMode, onUploadTrigger }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/50 scanline"></div>
        <div className="flex flex-col items-center gap-6 relative">
          <div className="relative">
            <div className="w-20 h-20 border-8 border-sky-500/20 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-8 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-sky-400 font-black uppercase italic tracking-[0.5em] text-lg animate-pulse">
            Decodificando Matriz...
          </div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="w-full h-full bg-slate-900/50 border-4 border-dashed border-slate-800 flex items-center justify-center text-slate-600 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
        
        <div className="text-center p-8 lg:p-12 relative flex flex-col items-center gap-8">
          <div className="space-y-2">
            <p className="font-black uppercase italic tracking-[0.2em] text-4xl lg:text-7xl text-slate-800 transition-colors group-hover:text-slate-700">EMPTY SLOT</p>
            <p className="text-[10px] lg:text-xs opacity-40 font-bold uppercase tracking-[0.3em]">Protocolo de Acessibilidade v1.4.0</p>
          </div>

          <button 
            onClick={onUploadTrigger}
            className="group/btn relative px-8 py-5 bg-sky-600 border-4 border-sky-400 shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            aria-label="Fazer Upload de Mangá"
          >
            <div className="flex items-center gap-4 text-slate-950">
              <Upload size={24} strokeWidth={3} className="group-hover/btn:animate-bounce" />
              <span className="font-black uppercase italic tracking-tighter text-xl">Iniciar Protocolo</span>
            </div>
          </button>
          
          <p className="text-[10px] font-black uppercase text-slate-700 tracking-widest italic animate-pulse">
            Suporta JPG, PNG e PDF
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col transition-all duration-700 ${isFocusMode ? 'gap-12' : 'gap-4'}`}>
      {/* Visual Frame */}
      <div className={`flex-[3] min-h-0 flex items-center justify-center relative group`}>
        <div className={`relative transition-all duration-1000 ${isFocusMode ? 'scale-110 shadow-[0_0_100px_rgba(56,189,248,0.1)]' : 'scale-100'}`}>
          <div className={`relative bg-black border-[6px] transition-colors duration-700 ${isFocusMode ? 'border-sky-500 shadow-[24px_24px_0px_rgba(56,189,248,0.3)]' : 'border-slate-800 shadow-[12px_12px_0px_#0f172a]'}`}>
            <img 
              src={unit.imageUrl} 
              alt={`Visual do painel: ${unit.description}`} 
              className="max-w-full max-h-[55vh] object-contain block select-none"
            />
          </div>
          {!isFocusMode && (
            <div className="absolute -top-3 -left-3 bg-rose-600 text-white px-3 py-1 font-black italic text-[10px] uppercase shadow-[4px_4px_0px_#000] border-2 border-rose-500">
              Painel Ativo
            </div>
          )}
        </div>
      </div>

      {/* Narrative Data Block */}
      <div className={`flex-[2] min-h-0 overflow-y-auto transition-all duration-1000 bg-slate-900 border-l-[16px] p-6 lg:p-8 flex flex-col justify-center shadow-inner relative ${isFocusMode ? 'border-sky-400 bg-slate-900/100 text-center' : 'border-rose-600'}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 0)', backgroundSize: '6px 6px' }}></div>
        
        <div className="max-w-5xl mx-auto relative w-full">
          {!isFocusMode && (
            <div className="flex items-center gap-2 mb-4">
              <span className="h-[2px] w-8 bg-rose-600"></span>
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 italic">Áudio Drama Script</h4>
            </div>
          )}
          <p className={`font-black leading-[1.1] text-slate-50 italic transition-all duration-700 selection:bg-rose-600 selection:text-white ${isFocusMode ? 'text-4xl lg:text-7xl uppercase tracking-tighter' : 'text-2xl lg:text-4xl tracking-tight'}`}>
            "{unit.combinedNarrative}"
          </p>
          {!isFocusMode && (
            <div className="mt-8 flex items-center gap-4">
              <span className="bg-slate-800 text-sky-400 text-[9px] font-black px-4 py-1.5 uppercase italic border border-slate-700 shadow-[3px_3px_0px_#000]">
                {unit.originalText ? "Diálogo Detectado" : "Ação Pura"}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Matrix Link Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};