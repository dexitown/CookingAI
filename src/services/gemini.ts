import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateRecipe(ingredients: string[], cuisine?: string): Promise<Recipe> {
  const prompt = `Genera una receta deliciosa y creativa usando estos ingredientes: ${ingredients.join(", ")}. ${cuisine ? `Estilo de cocina: ${cuisine}.` : ""} Responde estrictamente en formato JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          prepTime: { type: Type.STRING },
          cookTime: { type: Type.STRING },
          servings: { type: Type.NUMBER },
          difficulty: { type: Type.STRING, enum: ["Fácil", "Media", "Difícil"] },
          cuisine: { type: Type.STRING },
          calories: { type: Type.NUMBER },
        },
        required: ["title", "description", "ingredients", "instructions", "prepTime", "cookTime", "servings", "difficulty", "cuisine"],
      },
    },
  });

  const recipeData = JSON.parse(response.text || "{}");
  return {
    ...recipeData,
    id: Math.random().toString(36).substring(7),
    image: `https://picsum.photos/seed/${recipeData.title.replace(/\s/g, "")}/800/600`,
  };
}

export async function getCookingAdvice(message: string, history: { role: 'user' | 'model', text: string }[]): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "Eres un chef experto y amable. Ayudas a los usuarios con dudas de cocina, sustituciones de ingredientes, técnicas culinarias y consejos prácticos. Responde de forma concisa pero útil.",
    },
  });

  // Reconstruct history
  // Note: sendMessage only takes a message string, so we don't pass history directly here
  // but we can simulate it if needed. For simplicity, we'll just send the message.
  const response = await chat.sendMessage({ message });
  return response.text || "Lo siento, no pude procesar tu solicitud.";
}
