
import React from 'react';
import { Accessibility, Volume2, Type, MoveRight, MoveLeft, Play, Pause, FastForward, Rewind, Upload } from 'lucide-react';

export const THEME = {
  primary: 'sky-400',
  background: 'slate-950',
  surface: 'slate-900',
  text: 'slate-50',
  accent: 'amber-400',
};

export const ICONS = {
  Accessibility: <Accessibility className="w-6 h-6" />,
  Volume: <Volume2 className="w-6 h-6" />,
  Type: <Type className="w-6 h-6" />,
  Next: <MoveRight className="w-6 h-6" />,
  Prev: <MoveLeft className="w-6 h-6" />,
  Play: <Play className="w-6 h-6" />,
  Pause: <Pause className="w-6 h-6" />,
  Forward: <FastForward className="w-6 h-6" />,
  Rewind: <Rewind className="w-6 h-6" />,
  Upload: <Upload className="w-6 h-6" />,
};
