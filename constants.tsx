
import React from 'react';
import { Accessibility, Volume2, Type, ChevronRight, ChevronLeft, Play, Pause, Zap, BookOpen, Upload, Ghost } from 'lucide-react';

export const THEME = {
  primary: 'cyan-400',
  secondary: 'fuchsia-500',
  background: 'black',
  surface: 'slate-900',
  text: 'slate-50',
  accent: 'rose-500',
};

export const ICONS = {
  Accessibility: <Accessibility className="w-6 h-6" />,
  Volume: <Volume2 className="w-6 h-6" />,
  Type: <Type className="w-6 h-6" />,
  Next: <ChevronRight className="w-8 h-8" />,
  Prev: <ChevronLeft className="w-8 h-8" />,
  Play: <Play className="w-8 h-8 fill-current" />,
  Pause: <Pause className="w-8 h-8 fill-current" />,
  Energy: <Zap className="w-5 h-5" />,
  Manga: <BookOpen className="w-6 h-6" />,
  Upload: <Upload className="w-6 h-6" />,
  Ghost: <Ghost className="w-6 h-6" />,
};
