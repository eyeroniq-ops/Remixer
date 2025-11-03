import { GoogleGenAI, Modality } from "@google/genai";
import { PreservedDetails } from '../types';

if (!process.env.API_KEY) {
    console.warn("La variable de entorno API_KEY no está configurada. Usando un marcador de posición. Por favor, configura tu clave de API para que la aplicación funcione.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

const generatePrompt = (
  newBrandName: string,
  industry: string,
  changeDetails: string,
  preservedDetails: PreservedDetails
): string => {
  const preservedItems = (Object.keys(preservedDetails) as Array<keyof PreservedDetails>)
    .filter((key) => preservedDetails[key])
    .map(key => {
        switch (key) {
            case 'color': return 'Color Palette';
            case 'backgroundColor': return 'Background Color';
            case 'icon': return 'Icon / Shape';
            case 'typography': return 'Typography';
            case 'style': return 'Style';
            default: return key;
        }
    });

  const prompt = `
Analyze the provided logo image and adapt it based on the following instructions.

**New Brand Name:** ${newBrandName || 'Not provided. Keep original or remove text as appropriate.'}
**Target Industry:** ${industry || 'Not provided.'}

**Preserve from original image:**
${preservedItems.length > 0 ? preservedItems.map(item => `- ${item}`).join('\n') : '- None. Use creative judgment based on the original style.'}

**Required Modifications:**
${changeDetails || 'Adapt the logo based on the new brand name, industry, and preservation settings.'}

**Output Instructions:**
- Generate a new logo that incorporates the new brand name and applies the required modifications.
- Strictly adhere to the list of elements to preserve.
- If 'Background Color' is NOT in the preservation list, the output logo must have a transparent background.
- The final output must only be the image. Do not add any text, description, or commentary.
`;

  return prompt;
};


export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  newBrandName: string,
  industry: string,
  changeDetails: string,
  preservedDetails: PreservedDetails
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  const textPrompt = generatePrompt(newBrandName, industry, changeDetails, preservedDetails);

  console.log("Sending prompt to Gemini:", textPrompt);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
              },
            },
            {
              text: textPrompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No se encontraron datos de imagen en la respuesta de la API de Gemini.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Error al generar la imagen. ${error instanceof Error ? error.message : String(error)}`);
  }
};