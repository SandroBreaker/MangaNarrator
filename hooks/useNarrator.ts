
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
  const playbackRequestIdRef = useRef<number>(0);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopAudio = () => {
    playbackRequestIdRef.current++; // Invalida qualquer processo de áudio em andamento
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null; // Remove o listener para não pular para o próximo sem querer
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
  };

  const playUnit = useCallback(async (index: number) => {
    const requestId = ++playbackRequestIdRef.current; // ID único para esta tentativa de play
    
    initAudio();
    
    // Parar qualquer áudio físico tocando agora
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      } catch (e) {}
    }

    const unit = state.units[index];
    if (!unit) return;

    setState(prev => ({ ...prev, currentIndex: index, status: PlaybackStatus.PROCESSING, error: undefined }));

    try {
      const base64 = await generateNarrationAudio(unit.combinedNarrative);
      
      // VERIFICAÇÃO CRÍTICA: Se o ID mudou enquanto o Gemini processava, descartamos este resultado
      if (requestId !== playbackRequestIdRef.current) {
        console.debug("Ignorando áudio de requisição antiga.");
        return;
      }

      const audioData = decodeBase64Audio(base64);
      const buffer = await decodeAudioDataToBuffer(audioData, audioContextRef.current!);

      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = state.playbackSpeed;
      source.connect(audioContextRef.current!.destination);
      
      source.onended = () => {
        // Garantir que ainda somos a requisição ativa antes de avançar
        if (requestId !== playbackRequestIdRef.current) return;

        setState(current => {
          if (current.status === PlaybackStatus.PLAYING && index + 1 < current.units.length) {
            playUnit(index + 1);
          } else if (index + 1 >= current.units.length) {
             return { ...current, status: PlaybackStatus.IDLE };
          }
          return current;
        });
      };

      source.start(0);
      sourceNodeRef.current = source;
      setState(prev => ({ ...prev, status: PlaybackStatus.PLAYING }));
    } catch (err: any) {
      if (requestId !== playbackRequestIdRef.current) return;

      console.error("Audio playback error", err);
      const isQuota = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED');
      setState(prev => ({ 
        ...prev, 
        status: PlaybackStatus.ERROR, 
        error: isQuota 
          ? "Limite de uso da IA atingido. Aguarde um momento ou configure sua própria chave API." 
          : "Falha na narração por áudio. Verifique sua conexão." 
      }));
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
    // Se estiver tocando, atualiza o pitch/velocidade em tempo real
    if (sourceNodeRef.current) {
      sourceNodeRef.current.playbackRate.value = speed;
    }
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
