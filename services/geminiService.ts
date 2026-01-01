
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NarrativeUnit } from "../types";

const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

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
 * Analisa a imagem com foco em Audio Drama Cinematográfico (Padrão de Mercado).
 */
export async function analyzeMangaImage(base64Image: string): Promise<NarrativeUnit[]> {
  const apiKey = getApiKey();
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey });
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
            text: `Você é um Diretor de Audio Drama e Dublagem profissional.
            Sua tarefa é converter esta página de mangá em uma experiência auditiva cinematográfica de alto nível para fãs de anime.
            
            Divida a imagem em unidades narrativas e para cada uma crie:
            1. 'originalText': O diálogo exato.
            2. 'description': Uma nota de direção de cena (clima, iluminação, emoção).
            3. 'combinedNarrative': Um roteiro fluido que mistura narração épica com os diálogos. 
               O estilo deve ser imersivo, como se um narrador profissional estivesse contando uma lenda, mantendo a tensão e o impacto emocional de cada quadro.
            
            IMPORTANTE: Responda em Português do Brasil. Use um tom dramático e impactante.`
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
      console.error("Erro no parse JSON do Gemini", e);
      throw new Error("Erro na estrutura narrativa gerada pela IA.");
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

/**
 * Gera narração com tom de Dublagem Profissional.
 */
export async function generateNarrationAudio(text: string, voice: string = 'Fenrir'): Promise<string> {
  const apiKey = getApiKey();
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Atue como um Dublador Profissional de Anime. 
      Narre o texto a seguir com máxima carga emocional, entonação variada e um ritmo épico. 
      Use Português do Brasil nativo: ${text}` }] }],
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
    throw new Error("Falha ao gerar trilha de áudio.");
  });
}
