
import { useState, useCallback, useRef } from 'react';
import { MangaState, PlaybackStatus, NarrativeUnit } from '../types';
import { generateNarrationAudio, decodeBase64Audio, decodeAudioDataToBuffer } from '../services/geminiService';

export function useNarrator() {
  const [state, setState] = useState<MangaState>({
    units: [],
    currentIndex: 0,
    status: PlaybackStatus.IDLE,
    playbackSpeed: 1.0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const activeTaskIdRef = useRef<number>(0);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopAudio = () => {
    // Incrementa o ID da tarefa para cancelar qualquer processo assíncrono anterior (fetch ou decode)
    activeTaskIdRef.current += 1;
    
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      } catch (e) {
        // Áudio já parado ou não iniciado
      }
      sourceNodeRef.current = null;
    }
  };

  const playUnit = useCallback(async (index: number) => {
    initAudio();
    stopAudio();

    const unit = state.units[index];
    if (!unit) return;

    const currentTaskId = activeTaskIdRef.current;
    setState(prev => ({ ...prev, currentIndex: index, status: PlaybackStatus.PROCESSING }));

    try {
      // Chamada à API de TTS
      const base64 = await generateNarrationAudio(unit.combinedNarrative, unit.voicePreference);
      
      // Se o usuário mudou de página enquanto o áudio carregava, aborta
      if (currentTaskId !== activeTaskIdRef.current) return;

      const audioData = decodeBase64Audio(base64);
      const buffer = await decodeAudioDataToBuffer(audioData, audioContextRef.current!);

      if (currentTaskId !== activeTaskIdRef.current) return;

      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = state.playbackSpeed;
      source.connect(audioContextRef.current!.destination);
      
      source.onended = () => {
        // Só avança se a tarefa ainda for a ativa
        if (currentTaskId !== activeTaskIdRef.current) return;
        
        setState(current => {
          if (current.status === PlaybackStatus.PLAYING && index + 1 < current.units.length) {
            setTimeout(() => playUnit(index + 1), 600); // Pausa dramática entre quadros
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
      if (currentTaskId !== activeTaskIdRef.current) return;
      console.error("Erro na narração", err);
      setState(prev => ({ ...prev, status: PlaybackStatus.ERROR, error: "Houve uma falha ao preparar a narração deste trecho." }));
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
    stopAudio();
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
