
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { analyzeMangaImage } from '../services/geminiService';
import { NarrativeUnit } from '../types';
import { SAMPLE_MANGA_PAGE } from '../sampleImage';

interface Props {
  onProcessed: (units: NarrativeUnit[]) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export const MangaUploader: React.FC<Props> = ({ onProcessed, onProcessing }) => {
  const [error, setError] = useState<string | null>(null);

  const processImageBase64 = async (base64: string) => {
    setError(null);
    onProcessing(true);
    try {
      const units = await analyzeMangaImage(base64);
      onProcessed(units);
    } catch (err) {
      setError("Falha ao processar imagem via AI. Tente novamente.");
    } finally {
      onProcessing(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      if (base64) processImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = () => {
    processImageBase64(SAMPLE_MANGA_PAGE);
  };

  return (
    <section id="uploader" className="w-full max-w-2xl mx-auto p-8" aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="text-xl font-bold mb-4 sr-only">Upload de Manga</h2>
      
      <div className="space-y-4">
        <label 
          htmlFor="manga-upload" 
          className="relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/50 hover:bg-slate-900 hover:border-sky-500 cursor-pointer transition-all duration-300"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-slate-800 rounded-full mb-4 text-sky-400 group-hover:scale-110 transition-transform">
              {ICONS.Upload}
            </div>
            <p className="mb-2 text-lg text-slate-300 font-semibold text-center px-4">
              Arraste ou clique para enviar uma página
            </p>
            <p className="text-sm text-slate-500">Formatos: JPG, PNG, WEBP</p>
          </div>
          
          <input 
            id="manga-upload" 
            type="file" 
            className="sr-only" 
            accept="image/*"
            onChange={handleFileChange}
            aria-describedby="upload-hint"
          />
        </label>

        <button
          onClick={handleLoadSample}
          className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
          aria-label="Carregar imagem de exemplo: One Piece"
        >
          {ICONS.Play}
          Usar Imagem de Exemplo (One Piece)
        </button>
      </div>
      
      <div id="upload-hint" className="mt-4 text-slate-400 text-sm italic text-center">
        Dica: O sistema extrairá diálogos e gerará descrições visuais detalhadas automaticamente em Português.
      </div>

      {error && (
        <div role="alert" className="mt-4 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}
    </section>
  );
};
