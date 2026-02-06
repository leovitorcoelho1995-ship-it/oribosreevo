
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // @ts-ignore
    const apiKey = window.env?.VITE_GEMINI_API_KEY || window.env?.API_KEY || process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn("Gemini API Key missing. AI features will be disabled.");
    }
  }

  async editThumbnail(imageBase64: string, prompt: string): Promise<string | null> {
    if (!this.ai) {
      console.error("Gemini API Key is not configured.");
      alert("Configure a chave da API Gemini no arquivo .env para usar este recurso.");
      return null;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Updated model
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64.split(',')[1],
                mimeType: 'image/png',
              },
            },
            {
              text: `Apply this modification to the image: ${prompt}. Return the resulting image directly.`,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error editing thumbnail with Gemini:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
