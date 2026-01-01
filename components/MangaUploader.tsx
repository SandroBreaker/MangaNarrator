import React, { useState } from 'react';
import { ICONS } from '../constants';
import { analyzeMangaImage } from '../services/geminiService';
import { NarrativeUnit } from '../types';
import { SAMPLE_MANGA_PAGE } from '../sampleImage';
import * as pdfjs from 'pdfjs-dist';

// Configuração do worker do PDF.js para ESM
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface Props {
  onProcessed: (units: NarrativeUnit[]) => void;
  onProcessing: (isProcessing: boolean) => void;
  externalTriggerRef?: React.RefObject<HTMLInputElement | null>;
}

export const MangaUploader: React.FC<Props> = ({ onProcessed, onProcessing, externalTriggerRef }) => {
  const [error, setError] = useState<string | null>(null);

  const processImageBase64 = async (base64: string) => {
    setError(null);
    onProcessing(true);
    try {
      const units = await analyzeMangaImage(base64);
      onProcessed(units);
    } catch (err) {
      setError("Erro no Processamento: Imagem muito complexa ou ilegível.");
    } finally {
      onProcessing(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onProcessing(true);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Falha ao criar contexto de renderização");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        await processImageBase64(base64);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result?.toString().split(',')[1];
          if (base64) processImageBase64(base64);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError("Falha ao ler arquivo. Verifique se o PDF é válido.");
      onProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="group flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-sky-500 cursor-pointer transition-all">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-sky-400 group-hover:scale-110 transition-transform mb-2">
            {ICONS.Upload}
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">
            Upload Manga (IMG/PDF)
          </p>
        </div>
        <input 
          ref={externalTriggerRef}
          type="file" 
          className="sr-only" 
          accept="image/*,.pdf" 
          onChange={handleFileChange} 
        />
      </label>

      <button
        onClick={() => processImageBase64(SAMPLE_MANGA_PAGE)}
        className="w-full py-3 px-4 bg-rose-600 border-2 border-rose-500 text-white font-black uppercase italic text-xs tracking-tighter flex items-center justify-center gap-3 transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000]"
      >
        {ICONS.Play}
        Modo Demonstração (One Piece)
      </button>

      {error && (
        <div className="p-2 border-2 border-rose-500 text-rose-500 text-[9px] font-black uppercase bg-rose-950/20">
          {error}
        </div>
      )}
    </div>
  );
};