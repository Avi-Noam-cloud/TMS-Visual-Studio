
import { GoogleGenAI, Type } from "@google/genai";
import { getSystemInstruction } from "../constants";
import { BrandStrategy, BrandProfile, ReferenceImage } from "../types";

// NOTE: We do not instantiate GoogleGenAI globally here because the API key
// might be selected by the user at runtime. We instantiate it inside functions.

/**
 * Step 0: "Train" the app by analyzing reference images to extract style and product details.
 */
export const analyzeBrandAssets = async (
  images: ReferenceImage[]
): Promise<{ visualStyle: string; productDescription: string }> => {
  if (!images || images.length === 0) {
    throw new Error("No images provided for analysis");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [
      {
        text: `You are an expert Creative Director and Visual Strategist. 
        Analyze the attached reference images which represent a specific brand.
        
        Your task is to extract two distinct, highly detailed descriptions:
        1. "visualStyle": The photography style, lighting (e.g., golden hour, studio), color grading, composition, textures, and mood.
        2. "productDescription": A physical description of the products shown. Materials, shapes, finishes, colors, and key details.

        Be precise and descriptive. These descriptions will be used to generate new images that look exactly like this brand.
        `
      }
    ];

    // Append all images to the request
    images.forEach(img => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualStyle: { type: Type.STRING },
            productDescription: { type: Type.STRING }
          },
          required: ["visualStyle", "productDescription"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Failed to analyze brand assets");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Brand analysis failed:", error);
    throw error;
  }
};

/**
 * Step 1: Analyze the user's request and the current image (if provided) to determine the brand strategy.
 * Uses gemini-2.5-flash for reasoning.
 */
export const determineStrategy = async (
  userInstruction: string,
  brandProfile: BrandProfile,
  base64Image?: string | null,
  mimeType?: string | null
): Promise<BrandStrategy> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptText = `Analyze this request: "${userInstruction}". `;
    
    if (base64Image) {
      promptText += "Base your strategy on the attached user-uploaded image context. ";
    } else {
      promptText += "Create a strategy for a new image based on this request. ";
    }

    if (brandProfile.styleReferenceImages?.length > 0) {
      promptText += "REFER TO THE ATTACHED 'BRAND REFERENCE IMAGES' to understand the visual style and product look required.";
    }

    const parts: any[] = [{ text: promptText }];

    // 1. Add User Input Image (if exists)
    if (base64Image && mimeType) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      });
    }

    // 2. Add Brand Reference Images (Context Injection)
    // We limit to 3 reference images to save tokens/bandwidth if many are uploaded
    if (brandProfile.styleReferenceImages?.length > 0) {
      brandProfile.styleReferenceImages.slice(0, 3).forEach(img => {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: getSystemInstruction(brandProfile),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            aspectRatio: { type: Type.STRING },
            layoutStyle: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            refinedPrompt: { type: Type.STRING }
          },
          required: ["platform", "aspectRatio", "layoutStyle", "reasoning", "refinedPrompt"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No strategy generated");
    
    return JSON.parse(text) as BrandStrategy;
  } catch (error) {
    console.error("Strategy generation failed:", error);
    throw error;
  }
};

/**
 * Step 2: Edit/Generate the image based on the refined prompt.
 * Uses gemini-3-pro-image-preview (Nano Banana Pro).
 */
export const editImage = async (
  base64Image: string | null | undefined,
  mimeType: string | null | undefined,
  prompt: string,
  aspectRatio: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Map strategy aspect ratio to API allowed values if possible, or default to 1:1 if unknown
    // Supported: "1:1", "3:4", "4:3", "9:16", "16:9"
    let apiAspectRatio = "1:1";
    if (["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio)) {
      apiAspectRatio = aspectRatio;
    } else if (aspectRatio.includes("16:9")) apiAspectRatio = "16:9";
    else if (aspectRatio.includes("9:16")) apiAspectRatio = "9:16";

    const parts: any[] = [{ text: prompt }];
    
    // Only add image part if image is provided (Editing mode)
    if (base64Image && mimeType) {
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: parts
      },
      // Note: responseMimeType and responseSchema are NOT supported for nano banana models
      config: {
        imageConfig: {
           // We cast to any because the type definition might expect strict enum, 
           // but the string value is what's sent.
           aspectRatio: apiAspectRatio as any
        }
      }
    });

    // Iterate parts to find the image
    const partsResponse = response.candidates?.[0]?.content?.parts;
    if (partsResponse) {
      for (const part of partsResponse) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};
