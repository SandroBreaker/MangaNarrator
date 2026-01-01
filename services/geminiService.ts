
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NarrativeUnit } from "../types";

/**
 * Analisa a página do mangá transformando-a em uma jornada auditiva cinematográfica.
 */
export async function analyzeMangaImage(base64Image: string): Promise<NarrativeUnit[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
          text: `Aja como um Diretor de Dublagem e Mestre de Narrativas. Converta este mangá em uma experiência auditiva imersiva para deficientes visuais.

REGRAS DE OURO:
1. IDENTIFICAÇÃO: Identifique o gênero, idade e tom de cada personagem.
2. CASTING DE VOZES (OBRIGATÓRIO):
   - 'Charon': Homens adultos, mentores, vilões ou vozes graves/épicas.
   - 'Kore': Mulheres adultas, heroínas, tons maternais ou suaves.
   - 'Fenrir': Vozes roucas, monstros, guerreiros rudes ou gritos de impacto.
   - 'Puck': Crianças, adolescentes, alívios cômicos ou personagens hiperativos.
   - 'Zephyr': Narração poética de ambiente (use quando o foco for o cenário).

3. SEM LINGUAGEM TÉCNICA: Nunca use "quadrinho", "painel", "na imagem" ou "está escrito". Narre a cena como um audiolivro vivo.
4. TEXTO: Mantenha tudo em Português do Brasil (PT-BR).

Retorne um array JSON com: originalText, description, combinedNarrative, voicePreference.`
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
            voicePreference: { 
              type: Type.STRING, 
              enum: ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr']
            },
          },
          required: ["originalText", "description", "combinedNarrative", "voicePreference"],
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
    console.error("Erro na análise imersiva", e);
    throw new Error("O narrador se perdeu na história. Tente novamente.");
  }
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

export async function generateNarrationAudio(text: string, voice: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Interprete este texto com emoção e ritmo cinematográfico: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64) return base64;
  throw new Error("Falha na síntese de voz.");
}
