
import React from 'react';
import { Accessibility, Volume2, Type, MoveRight, MoveLeft, Play, Pause, FastForward, Rewind, Upload, Maximize2 } from 'lucide-react';

export const THEME = {
  primary: 'sky-400',
  background: 'slate-950',
  surface: 'slate-900',
  text: 'slate-50',
  accent: 'rose-500', // Vermelho vibrante estilo Shonen
};

export const ICONS = {
  Accessibility: <Accessibility className="w-5 h-5" />,
  Volume: <Volume2 className="w-5 h-5" />,
  Type: <Type className="w-5 h-5" />,
  Next: <MoveRight className="w-6 h-6" />,
  Prev: <MoveLeft className="w-6 h-6" />,
  Play: <Play className="w-6 h-6 fill-current" />,
  Pause: <Pause className="w-6 h-6 fill-current" />,
  Forward: <FastForward className="w-5 h-5" />,
  Rewind: <Rewind className="w-5 h-5" />,
  Upload: <Upload className="w-6 h-6" />,
  Focus: <Maximize2 className="w-5 h-5" />,
};
