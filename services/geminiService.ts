import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key is present to avoid errors on load if environment is missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const isAiConfigured = !!ai;

export const generateJsonFromPrompt = async (prompt: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant that generates valid JSON data based on user descriptions. You MUST return ONLY valid JSON. Do not wrap it in markdown code blocks.",
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated.");
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};