import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NarrativeUnit } from "../types";

async function callWithRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuotaError && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Analisa a imagem com foco em Velocidade e Qualidade Cinematográfica.
 */
export async function analyzeMangaImage(base64Image: string): Promise<NarrativeUnit[]> {
  return callWithRetry(async () => {
    // Sempre instanciar novo para garantir que pegamos a chave mais recente do contexto
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Você é um Diretor de Audio Drama especializado em Mangás.
            Converta esta página em um roteiro auditivo de alto impacto.
            
            Gere um JSON ARRAY onde cada objeto tenha:
            1. 'originalText': O texto dos balões (se houver).
            2. 'description': Descrição visual curta da cena.
            3. 'combinedNarrative': Narração épica e fluida integrando diálogos e ação.
            
            Estilo: Shonen Dramático. Idioma: Português do Brasil.`
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
      const text = response.text;
      if (!text) throw new Error("IA retornou corpo vazio. Verifique sua chave de API.");
      const data = JSON.parse(text);
      return data.map((item: any, index: number) => ({
        ...item,
        id: `unit-${Date.now()}-${index}`,
        imageUrl: `data:image/jpeg;base64,${base64Image}`
      }));
    } catch (e) {
      console.error("Erro no parse JSON", e);
      throw new Error("Erro na estrutura narrativa. Tente novamente.");
    }
  });
}

export function decodeBase64Audio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioDataToBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
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

export async function generateNarrationAudio(text: string, voice: string = 'Fenrir'): Promise<string> {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Dublagem Profissional de Anime. Texto: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) return audioData;
    throw new Error("Erro na geração de áudio. Verifique sua cota da API.");
  });
}