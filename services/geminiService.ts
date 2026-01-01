
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
          text: `Aja como um Mestre de RPG e Diretor de Audiolivros de Elite. Converta este mangá em uma narração imersiva para alguém que não pode ver a imagem.

DIRETRIZES DE IMERSÃO (TEATRO MENTAL):
1. PROIBIDO TERMOS TÉCNICOS: Nunca use "quadrinho", "painel", "a imagem mostra" ou "está escrito".
2. NARRATIVA FLUIDA: Descreva a cena como se estivesse vivendo ela. Em vez de "Ele está bravo", use "A fúria transborda em seu olhar, as veias de sua testa saltam enquanto ele cerra os dentes".
3. ATMOSFERA E SOM: Descreva o som ambiente (o tilintar das espadas, o rugir do mar, o silêncio mortal).
4. INTERPRETAÇÃO: Mescle as falas dos personagens naturalmente na narração, transmitindo o tom de voz e a intenção.

MAPEAMENTO DE VOZES:
- 'Charon': Voz grave, de comando ou vilanesca.
- 'Kore': Voz feminina expressiva e clara.
- 'Fenrir': Voz ríspida, para monstros ou ação intensa.
- 'Puck': Voz leve, jovem ou para alívio cômico.
- 'Zephyr': Narração poética de cenário.

Toda a resposta DEVE ser em Português do Brasil.
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
    throw new Error("Não foi possível gerar a experiência narrativa.");
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
    contents: [{ parts: [{ text: `Narre com máxima emoção e interpretação: ${text}` }] }],
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
  throw new Error("Falha ao sintetizar voz.");
}
