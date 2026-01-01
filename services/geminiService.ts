
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NarrativeUnit } from "../types";

/**
 * Função auxiliar para lidar com retentativas em caso de erro 429 (Cota excedida).
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuotaError && retries > 0) {
      console.warn(`Cota excedida. Tentando novamente em ${delay}ms... (Tentativas restantes: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Analisa uma imagem de mangá para extrair texto e descrever a cena visualmente para cegos.
 */
export async function analyzeMangaImage(base64Image: string): Promise<NarrativeUnit[]> {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Você é um narrador especialista em acessibilidade para mangás e quadrinhos. 
            Sua tarefa é tornar esta página acessível para pessoas cegas.
            Divida esta imagem em unidades narrativas (quadrinhos/painéis).
            Para cada unidade, forneça:
            1. O texto exato dos diálogos (originalText).
            2. Uma descrição visual detalhada de personagens, expressões e ação (description).
            3. Uma narrativa coesa em Português do Brasil que mistura diálogo e descrição de forma fluida (combinedNarrative).
            
            IMPORTANTE: Toda a resposta deve estar em Português do Brasil.
            Formate a saída como um array JSON de objetos com as propriedades: originalText, description, combinedNarrative.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              originalText: { type: Type.STRING },
              description: { type: Type.STRING },
              combinedNarrative: { type: Type.STRING },
            },
            required: ["originalText", "description", "combinedNarrative"],
          },
        },
      },
    });

    try {
      const data = JSON.parse(response.text || '[]');
      return data.map((item: any, index: number) => ({
        ...item,
        id: `unit-${Date.now()}-${index}`,
        imageUrl: `data:image/jpeg;base64,${base64Image}`
      }));
    } catch (e) {
      console.error("Falha ao processar resposta do Gemini", e);
      throw new Error("Não foi possível processar o conteúdo da imagem.");
    }
  });
}

/**
 * Decodifica áudio Base64 (PCM raw) para Uint8Array.
 */
export function decodeBase64Audio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converte PCM raw para AudioBuffer.
 */
export async function decodeAudioDataToBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Gera narração de áudio (TTS) para uma unidade de texto com tratamento de cota.
 */
export async function generateNarrationAudio(text: string, voice: string = 'Fenrir'): Promise<string> {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Refinando o prompt para tom épico e masculino
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Narre o texto a seguir com uma voz masculina, em um tom ÉPICO, DRAMÁTICO e SOLENE, como se estivesse contando a maior lenda de todos os tempos. Use português do Brasil nativo: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Fenrir é uma voz masculina profunda, ideal para tons épicos
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      return audioData;
    }

    throw new Error("Nenhum áudio foi gerado pelo modelo.");
  });
}
