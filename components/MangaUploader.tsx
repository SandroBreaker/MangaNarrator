
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
      setError("AI Vision Error: Retículas ilegíveis.");
    } finally {
      onProcessing(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      if (base64) processImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <label className="group flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-sky-500 cursor-pointer transition-all">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-sky-400 group-hover:scale-110 transition-transform mb-2">
            {ICONS.Upload}
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">
            Upload Manga Page
          </p>
        </div>
        <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
      </label>

      <button
        onClick={() => processImageBase64(SAMPLE_MANGA_PAGE)}
        className="w-full py-3 px-4 bg-rose-600 border-2 border-rose-500 text-white font-black uppercase italic text-xs tracking-tighter flex items-center justify-center gap-3 transition-all active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000]"
      >
        {ICONS.Play}
        Quick Start (One Piece)
      </button>

      {error && (
        <div className="p-2 border-2 border-rose-500 text-rose-500 text-[9px] font-black uppercase bg-rose-950/20">
          {error}
        </div>
      )}
    </div>
  );
};
