
import { useState, useCallback, useRef, useEffect } from 'react';
import { MangaState, PlaybackStatus, NarrativeUnit, VoiceName } from '../types';
import { generateNarrationAudio, decodeBase64Audio, decodeAudioDataToBuffer } from '../services/geminiService';

const STORAGE_KEY = 'manga_narrator_v1_save';

export function useNarrator() {
  const getInitialState = (): MangaState => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          status: PlaybackStatus.IDLE,
          error: undefined
        };
      }
    } catch (e) {
      console.warn("Restore state failed", e);
    }
    return {
      units: [],
      currentIndex: 0,
      status: PlaybackStatus.IDLE,
      playbackSpeed: 1.0,
      selectedVoice: 'Fenrir',
    };
  };

  const [state, setState] = useState<MangaState>(getInitialState());
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackRequestIdRef = useRef<number>(0);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      const data = {
        units: state.units,
        currentIndex: state.currentIndex,
        playbackSpeed: state.playbackSpeed,
        selectedVoice: state.selectedVoice
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Se estourar o limite de 5MB do LocalStorage por causa das imagens base64
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn("Storage quota exceeded. Saving only preferences.");
        const miniData = { 
          units: [], 
          currentIndex: 0, 
          playbackSpeed: state.playbackSpeed, 
          selectedVoice: state.selectedVoice 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(miniData));
      }
    }
  }, [state.units, state.currentIndex, state.playbackSpeed, state.selectedVoice]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopAudio = () => {
    playbackRequestIdRef.current++;
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
  };

  const playUnit = useCallback(async (index: number) => {
    const requestId = ++playbackRequestIdRef.current;
    initAudio();
    stopAudio();

    const unit = state.units[index];
    if (!unit) return;

    setState(prev => ({ ...prev, currentIndex: index, status: PlaybackStatus.PROCESSING }));

    try {
      const base64 = await generateNarrationAudio(unit.combinedNarrative, state.selectedVoice);
      if (requestId !== playbackRequestIdRef.current) return;

      const audioData = decodeBase64Audio(base64);
      const buffer = await decodeAudioDataToBuffer(audioData, audioContextRef.current!);

      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = state.playbackSpeed;
      source.connect(audioContextRef.current!.destination);
      
      source.onended = () => {
        if (requestId !== playbackRequestIdRef.current) return;
        setState(current => {
          if (current.status === PlaybackStatus.PLAYING && index + 1 < current.units.length) {
            playUnit(index + 1);
          }
          return { ...current, status: PlaybackStatus.IDLE };
        });
      };

      source.start(0);
      sourceNodeRef.current = source;
      setState(prev => ({ ...prev, status: PlaybackStatus.PLAYING }));
    } catch (err: any) {
      if (requestId !== playbackRequestIdRef.current) return;
      setState(prev => ({ ...prev, status: PlaybackStatus.ERROR, error: "Falha na conexão neural de áudio." }));
    }
  }, [state.units, state.playbackSpeed, state.selectedVoice]);

  const togglePlayback = () => {
    if (state.status === PlaybackStatus.PLAYING) {
      stopAudio();
      setState(prev => ({ ...prev, status: PlaybackStatus.PAUSED }));
    } else {
      playUnit(state.currentIndex);
    }
  };

  const nextUnit = () => {
    if (state.currentIndex < state.units.length - 1) playUnit(state.currentIndex + 1);
  };

  const prevUnit = () => {
    if (state.currentIndex > 0) playUnit(state.currentIndex - 1);
  };

  const setUnits = (units: NarrativeUnit[]) => {
    stopAudio();
    setState(prev => ({ ...prev, units, currentIndex: 0, status: PlaybackStatus.IDLE }));
  };

  const setSpeed = (speed: number) => {
    setState(prev => ({ ...prev, playbackSpeed: speed }));
    if (sourceNodeRef.current) sourceNodeRef.current.playbackRate.value = speed;
  };

  const setVoice = (voice: VoiceName) => {
    const wasPlaying = state.status === PlaybackStatus.PLAYING;
    stopAudio();
    setState(prev => ({ ...prev, selectedVoice: voice }));
    if (wasPlaying) playUnit(state.currentIndex);
  };

  return { ...state, togglePlayback, nextUnit, prevUnit, setUnits, setSpeed, setVoice, initAudio };
}
