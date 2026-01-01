import React, { useState } from 'react';
import { ICONS } from '../constants';
import { analyzeMangaImage } from '../services/geminiService';
import { NarrativeUnit } from '../types';
import { SAMPLE_MANGA_PAGE } from '../sampleImage';
import * as pdfjsLib from 'pdfjs-dist';

// Usando uma abordagem robusta para capturar o objeto da biblioteca,
// lidando com o fato de que alguns bundlers/CDNs colocam as exportações em um campo 'default'.
const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

if (pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

interface Props {
  onProcessed: (units: NarrativeUnit[]) => void;
  onProcessing: (status: string | null) => void;
  externalTriggerRef?: React.RefObject<HTMLInputElement | null>;
}

export const MangaUploader: React.FC<Props> = ({ onProcessed, onProcessing, externalTriggerRef }) => {
  const [error, setError] = useState<string | null>(null);

  const processImageBase64 = async (base64: string) => {
    setError(null);
    onProcessing("Invocando IA de Visão...");
    try {
      const units = await analyzeMangaImage(base64);
      onProcessing("Sincronizando Áudio Drama...");
      onProcessed(units);
    } catch (err: any) {
      setError(err.message || "Erro no Processamento.");
    } finally {
      onProcessing(null);
    }
  };

  const resizeAndProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 1600;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        processImageBase64(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onProcessing("Iniciando Protocolo de Leitura...");
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        onProcessing("Renderizando PDF...");
        const arrayBuffer = await file.arrayBuffer();
        
        if (!pdfjs || typeof pdfjs.getDocument !== 'function') {
          throw new Error("Biblioteca PDF.js não inicializada corretamente.");
        }

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Fix: Fazendo o cast para any para evitar erro de checagem estrita no RenderParameters do pdfjs-dist
        // que pode variar dependendo da versão ou do ambiente de tipos.
        await (page as any).render({ canvasContext: context!, viewport }).promise;
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        await processImageBase64(base64);
      } else {
        resizeAndProcess(file);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar arquivo.");
      onProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      <label className="group flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-sky-500 cursor-pointer transition-all focus-within:border-sky-500">
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
          aria-label="Fazer upload de mangá ou PDF"
        />
      </label>

      <button
        onClick={() => processImageBase64(SAMPLE_MANGA_PAGE)}
        className="w-full py-3 px-4 bg-rose-600 border-2 border-rose-500 text-white font-black uppercase italic text-xs tracking-tighter flex items-center justify-center gap-3 transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000]"
        aria-label="Iniciar modo demonstração com mangá de exemplo"
      >
        {ICONS.Play}
        Modo Demonstração
      </button>

      {error && (
        <div className="p-2 border-2 border-rose-500 text-rose-500 text-[9px] font-black uppercase bg-rose-950/20" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};