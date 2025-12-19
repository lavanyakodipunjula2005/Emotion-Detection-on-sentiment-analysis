
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeText = async (text: string): Promise<Partial<AnalysisResult>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the emotional context and sentiment of the following text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentiment: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "One of: Positive, Negative, Neutral" },
              score: { type: Type.NUMBER, description: "Numeric score from -1 (negative) to 1 (positive)" },
              confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" }
            },
            required: ["label", "score", "confidence"]
          },
          emotions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                emotion: { type: Type.STRING, description: "Emotion name (e.g., Joy, Anger, Sadness, Surprise)" },
                score: { type: Type.NUMBER, description: "Intensity score from 0 to 1" }
              },
              required: ["emotion", "score"]
            }
          },
          keyPhrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          summary: { type: Type.STRING, description: "A brief psychological summary of the emotional state" },
          intensityScore: { type: Type.NUMBER, description: "Overall emotional intensity from 0 to 100" }
        },
        required: ["sentiment", "emotions", "keyPhrases", "summary", "intensityScore"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Empty response from AI");
  }

  const data = JSON.parse(response.text.trim());
  return {
    ...data,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    originalText: text
  };
};
