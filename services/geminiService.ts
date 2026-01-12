
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ReelContent, ReelType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const CONTENT_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, description: "One of: TIDBIT, CHALLENGE, EXERCISE, MNEMONIC" },
      title: { type: Type.STRING },
      content: { type: Type.STRING },
      imagePrompt: { type: Type.STRING, description: "A highly descriptive artistic prompt for an AI image generator to visualize this concept." },
      interaction: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          technique: { type: Type.STRING, description: "The specific mnemonic technique explained" }
        }
      }
    },
    required: ["type", "title", "content", "imagePrompt"]
  }
};

export const fetchReels = async (): Promise<ReelContent[]> => {
  const prompt = `Generate 5 unique "MindReels". 
  Mix these categories:
  1. TIDBIT: Fascinating real-world facts (e.g., biology, space, history).
  2. CHALLENGE: Fun cognitive challenges or logic riddles.
  3. EXERCISE: Small mind exercises (e.g., sensory grounding, focus drills).
  4. MNEMONIC: Memorable techniques for common learning tasks.
  Ensure content is engaging for a short-form vertical video format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: CONTENT_SCHEMA
    }
  });

  const rawReels: any[] = JSON.parse(response.text || '[]');
  
  return rawReels.map((r, i) => ({
    ...r,
    id: `reel-${Date.now()}-${i}`,
  }));
};

export const generateReelImage = async (imagePrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Cinematic, high-quality, professional photography, artistic composition: ${imagePrompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return 'https://picsum.photos/1080/1920';
  } catch (err) {
    console.error("Image gen failed", err);
    return 'https://picsum.photos/1080/1920';
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Narrate in an engaging, calm, and educational tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      }
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  } catch (err) {
    console.error("Speech gen failed", err);
    return '';
  }
};
