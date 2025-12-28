
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LearningSession, WordData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const relatedWordSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    definition: { type: Type.STRING, description: "Max 8 words. Clean meaning." }
  },
  required: ["word", "definition"]
};

const wordProperties = {
  word: { type: Type.STRING },
  definition: { type: Type.STRING, description: "Max 12 words." },
  sarcasticDefinition: { type: Type.STRING, description: "Short, witty, punchy." },
  phonetic: { type: Type.STRING },
  origin: { type: Type.STRING },
  contextSentence: { type: Type.STRING },
  moodColor: { type: Type.STRING, description: "Vibrant neon HEX (e.g. #00F0FF)." },
  glowIntensity: { type: Type.NUMBER, description: "0.0 to 1.0 brightness." },
  glowSpread: { type: Type.NUMBER, description: "10 to 200 spread radius." },
  fontVibe: { type: Type.STRING, description: "One of: SERIF, MONO, SANS." },
  nativeContexts: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING },
        description: { type: Type.STRING },
        sentence: { type: Type.STRING },
        connotation: { type: Type.STRING },
        significance: { type: Type.STRING }
      },
      required: ["label", "description", "sentence", "connotation", "significance"]
    }
  },
  usageGuide: { type: Type.STRING },
  synonyms: { type: Type.ARRAY, items: relatedWordSchema },
  antonyms: { type: Type.ARRAY, items: relatedWordSchema },
  visualPrompt: { type: Type.STRING },
  quiz: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        answer: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "answer", "explanation"]
    }
  }
};

const sessionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    fullText: { type: Type.STRING },
    words: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: wordProperties,
        required: ["word", "definition", "moodColor", "nativeContexts", "quiz"]
      }
    }
  },
  required: ["topic", "fullText", "words"]
};

export const generateLearningSession = async (input: string, mode: 'TOPIC' | 'TEXT', manualWords?: string[]): Promise<LearningSession> => {
  const prompt = mode === 'TOPIC' ? `Topic: ${input}` : `Text: ${input}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sessionSchema,
      systemInstruction: "You are an elite linguist. Ensure all moodColors are distinct and high-contrast neon. Options must be exactly 2. Set glowIntensity between 0.4 and 0.8 and glowSpread between 80 and 150 by default.",
    },
  });
  return JSON.parse(response.text) as LearningSession;
};

export const generateWordImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `${prompt}. 3D render, octane, cinematic, vibrant.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};
