
export enum PlaybackStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export interface NarrativeUnit {
  id: string;
  originalText: string;
  description: string;
  combinedNarrative: string;
  voicePreference: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  imageUrl?: string;
}

export interface MangaState {
  units: NarrativeUnit[];
  currentIndex: number;
  status: PlaybackStatus;
  playbackSpeed: number;
  error?: string;
}

export interface AudioConfig {
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  speed: number;
}
