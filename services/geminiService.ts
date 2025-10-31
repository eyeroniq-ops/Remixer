import { GoogleGenAI, Modality } from "@google/genai";
import { PreservedDetails } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key for the app to function.");
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
    })
    .join(', ');

  let prompt = `
You are a professional graphic designer specializing in logo adaptation. Your task is to edit the provided image based on the following specifications.

**Core Task:** Adapt the existing logo style for a new brand.
`;

  if (newBrandName) {
    prompt += `\n**New Brand Name:** "${newBrandName}"
This name should replace any existing text in the logo. Make it fit naturally.
`;
  }
  
  if (industry) {
    prompt += `\n**Industry / Business Sector:** "${industry}"
The new logo should be appropriate for this industry.
`;
  }

  if (preservedItems) {
    prompt += `\n**Elements to Preserve from Original Logo:**
- ${preservedItems}
`;
  } else {
    prompt += `\n**Elements to Preserve from Original Logo:**
- None specified. Use your creative judgment based on the original style.
`;
  }

  if (changeDetails) {
    prompt += `\n**Specific Changes to Make:**
"${changeDetails}"
`;
  } else {
    prompt += `\n**Specific Changes to Make:**
"No specific additional changes were requested. Adapt the logo based on the new brand name, industry, and preservation settings."
`;
  }


  prompt += `
Please generate a new logo that incorporates the new brand name, applies the requested changes, and strictly preserves the specified elements. The output must be a high-quality image of the new logo. If 'Background Color' is not a preserved element, please make the background transparent.
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
    
    throw new Error("No image data found in the Gemini API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to generate image. ${error instanceof Error ? error.message : String(error)}`);
  }
};