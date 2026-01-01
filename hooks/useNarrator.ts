
import { useState, useCallback, useRef, useEffect } from 'react';
import { MangaState, PlaybackStatus, NarrativeUnit } from '../types';
import { generateNarrationAudio, decodeBase64Audio, decodeAudioDataToBuffer } from '../services/geminiService';

export function useNarrator() {
  const [state, setState] = useState<MangaState>({
    units: [],
    currentIndex: 0,
    status: PlaybackStatus.IDLE,
    playbackSpeed: 1.0, // Padrão 'Normal' conforme solicitado
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignora se já estiver parado
      }
      sourceNodeRef.current = null;
    }
  };

  const playUnit = useCallback(async (index: number) => {
    initAudio();
    stopAudio();

    const unit = state.units[index];
    if (!unit) return;

    setState(prev => ({ ...prev, currentIndex: index, status: PlaybackStatus.PROCESSING }));

    try {
      const base64 = await generateNarrationAudio(unit.combinedNarrative, unit.voicePreference);
      const audioData = decodeBase64Audio(base64);
      const buffer = await decodeAudioDataToBuffer(audioData, audioContextRef.current!);

      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = state.playbackSpeed;
      source.connect(audioContextRef.current!.destination);
      
      source.onended = () => {
        // Só avança automaticamente se ainda estiver no estado PLAYING
        setState(current => {
          if (current.status === PlaybackStatus.PLAYING && index + 1 < current.units.length) {
            // Pequeno delay para respiração entre painéis
            setTimeout(() => playUnit(index + 1), 400);
          } else if (index + 1 >= current.units.length) {
            return { ...current, status: PlaybackStatus.IDLE };
          }
          return current;
        });
      };

      source.start(0);
      sourceNodeRef.current = source;
      setState(prev => ({ ...prev, status: PlaybackStatus.PLAYING }));
    } catch (err) {
      console.error("Erro na reprodução imersiva", err);
      setState(prev => ({ ...prev, status: PlaybackStatus.ERROR, error: "Ocorreu um erro na narração. Tente novamente." }));
    }
  }, [state.units, state.playbackSpeed]);

  const togglePlayback = () => {
    if (state.status === PlaybackStatus.PLAYING) {
      stopAudio();
      setState(prev => ({ ...prev, status: PlaybackStatus.PAUSED }));
    } else {
      playUnit(state.currentIndex);
    }
  };

  const nextUnit = () => {
    if (state.currentIndex < state.units.length - 1) {
      playUnit(state.currentIndex + 1);
    }
  };

  const prevUnit = () => {
    if (state.currentIndex > 0) {
      playUnit(state.currentIndex - 1);
    }
  };

  const setUnits = (units: NarrativeUnit[]) => {
    setState(prev => ({ ...prev, units, currentIndex: 0, status: PlaybackStatus.IDLE }));
  };

  const setSpeed = (speed: number) => {
    setState(prev => ({ ...prev, playbackSpeed: speed }));
  };

  return {
    ...state,
    togglePlayback,
    nextUnit,
    prevUnit,
    setUnits,
    setSpeed,
    initAudio
  };
}
