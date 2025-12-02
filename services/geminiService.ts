import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Parametric Design Engineer and Creative Director.
Your task is to translate a user's conceptual description (e.g., "aggressive cyberpunk", "soft organic wellness", "minimalist architecture") into a specific set of numeric parameters for a generative logo system.

The system consists of multiple "layers" of polygons/splines.
For each layer, you define:
- segments: Number of vertices (3-12). Low = geometric, High = circle-like.
- radius: Size (20-180).
- noise: Random deviation of points from the circle (0-50). High noise = energetic/chaotic.
- smoothness: 0 (sharp polygon) to 1 (perfect curve).
- rotation: Initial angle (0-360).
- opacity: 0.1 to 1.0.
- strokeWidth: 1 to 10.
- color: Hex code.
- fill: boolean (filled shape or outline).
- speed: Animation rotation speed (-5 to 5).
- wobble: Animation pulse intensity (0 to 10).

Generate 2 to 4 layers to create a composition.
Ensure high contrast and aesthetic harmony.
`;

const DECONSTRUCTION_INSTRUCTION = `
You are a Computer Vision Engineer specializing in Vectorization.
Analyze the provided image of a logo. Deconstruct it into a set of 3 to 5 parametric geometric layers that approximate its visual style.

Rules for Deconstruction:
1. **Visibility**: Ensure 'radius' is between 50 and 180. Do not generate tiny shapes.
2. **Contrast**: Use colors that stand out against the background. Replicate the logo's palette.
3. **Structure**:
   - **Layer 0 (Back)**: Base shape/Background (e.g., filled, lower opacity, segments=30 for circle or 4 for square).
   - **Layer 1 (Mid)**: Main form (thick stroke or filled, vibrant color).
   - **Layer 2+ (Front)**: Details/Highlights (strokes, high rotation speed, segments=3-8).
4. **3D Depth**: Vary the 'rotation' and 'segments' significantly between layers to create a good "exploded view" in 3D.
5. **Animation**: Give each layer a slightly different 'speed' and 'wobble' to make it alive.

Return the result as a LogoSystem JSON.
`;

export const generateLogoParams = async (prompt: string): Promise<GeminiResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found in environment");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: getSchema()
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as GeminiResponse;
};

export const generateLogoParamsFromImage = async (base64Image: string, promptText: string = "Deconstruct this logo"): Promise<GeminiResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found in environment");

  const ai = new GoogleGenAI({ apiKey });

  // Clean base64 string if it contains metadata
  const cleanBase64 = base64Image.includes('base64,') 
    ? base64Image.split('base64,')[1] 
    : base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
        { text: promptText }
      ]
    },
    config: {
      systemInstruction: DECONSTRUCTION_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: getSchema()
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as GeminiResponse;
};

// Helper to reuse schema
function getSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      description: { type: Type.STRING },
      backgroundColor: { type: Type.STRING },
      layers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            segments: { type: Type.INTEGER },
            radius: { type: Type.NUMBER },
            noise: { type: Type.NUMBER },
            smoothness: { type: Type.NUMBER },
            rotation: { type: Type.NUMBER },
            opacity: { type: Type.NUMBER },
            strokeWidth: { type: Type.NUMBER },
            color: { type: Type.STRING },
            fill: { type: Type.BOOLEAN },
            speed: { type: Type.NUMBER },
            wobble: { type: Type.NUMBER },
          },
          required: ["segments", "radius", "noise", "smoothness", "rotation", "opacity", "strokeWidth", "color", "fill", "speed", "wobble"]
        }
      }
    },
    required: ["name", "description", "backgroundColor", "layers"]
  };
}