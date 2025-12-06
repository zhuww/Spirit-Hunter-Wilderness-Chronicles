import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize GenAI only if key exists, otherwise we'll mock or handle gracefully
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateGhostMessage = async (context: string): Promise<string> => {
  if (!ai) {
    return "The ghost is silent... (Missing API Key)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a mysterious, ghostly voice in a fantasy RPG. 
      The player is a young woman exploring the wilderness.
      The player just: ${context}.
      
      Generate a short, cryptic, but pleading message asking for help or commenting on the beasts. 
      Keep it under 20 words. 
      Tone: Ethereal, spooky, ancient.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Help... me...";
  }
};
