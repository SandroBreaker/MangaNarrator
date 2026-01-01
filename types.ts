
export enum PlaybackStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface NarrativeUnit {
  id: string;
  originalText: string;
  description: string;
  combinedNarrative: string;
  imageUrl?: string;
}

export interface MangaState {
  units: NarrativeUnit[];
  currentIndex: number;
  status: PlaybackStatus;
  playbackSpeed: number;
  selectedVoice: VoiceName;
  error?: string;
}

export interface AudioConfig {
  voice: VoiceName;
  speed: number;
}
