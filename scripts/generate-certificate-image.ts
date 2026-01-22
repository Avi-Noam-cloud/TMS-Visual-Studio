/**
 * Certificate of Authenticity Image Generator
 *
 * Uses Gemini 3 Pro Image Preview for:
 * - 4K resolution (best text legibility)
 * - Complex composition with depth of field
 * - Legible text rendering (94% accuracy at 4K)
 *
 * Usage:
 *   GEMINI_API_KEY=your-key npx tsx scripts/generate-certificate-image.ts
 *
 * Get API key from: https://aistudio.google.com/apikey
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is required");
  console.error("Get your key from: https://aistudio.google.com/apikey");
  console.error("");
  console.error("Usage:");
  console.error("  GEMINI_API_KEY=your-key npx tsx scripts/generate-certificate-image.ts");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Optimized prompt based on skill guidance:
// - Specific text placement for legibility
// - Clear composition structure
// - Documentary style for authenticity
const prompt = `Cinematic close-up shot, documentary-style cinematography.

MAIN SUBJECT: Two hands at chest level holding up a Certificate of Authenticity toward the camera. The certificate fills 80% of the frame.

CERTIFICATE DETAILS (must be clearly legible):
- Standard letter-sized document on cream-colored parchment paper
- Ornate golden decorative border around edges
- Header text: "CERTIFICATE OF AUTHENTICITY" in elegant serif font
- Identification number: "No. 1358863" below header
- Body: Authentication text in smaller font
- Bottom: Two handwritten signatures
- Red wax seal in bottom right corner

BACKGROUND (soft bokeh, out of focus):
- Barely visible: chin and lower face of young woman wearing teal shawl
- Far background: Sea of Galilee with blue water, distant brown hills, clear sky

TECHNICAL:
- Natural outdoor lighting, warm
- Sharp focus on certificate, shallow depth of field
- Photorealistic rendering`;

async function generateImage() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  Certificate of Authenticity Image Generator               ║");
  console.log("╠════════════════════════════════════════════════════════════╣");
  console.log("║  Model: gemini-3-pro-image-preview                         ║");
  console.log("║  Resolution: 4K (5504x3072 at 16:9)                        ║");
  console.log("║  Aspect Ratio: 16:9 (cinematic)                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("Generating image... (this may take 30-60 seconds)");
  console.log("");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"], // Both required
        imageGenerationConfig: {
          aspectRatio: "16:9",
          imageSize: "4K", // Uppercase K required per skill docs
        },
      },
    });

    const outputDir = path.join(process.cwd(), "assets", "generated", "certificate");
    fs.mkdirSync(outputDir, { recursive: true });

    let imageCount = 0;
    const timestamp = Date.now();

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) {
        console.log("Model response:", part.text);
        console.log("");
      }
      if (part.inlineData) {
        imageCount++;
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const filename = `certificate-authenticity-4k-${timestamp}.png`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);
        console.log(`✓ Image saved: ${filepath}`);

        // Save prompt alongside image for regeneration
        const promptPath = path.join(outputDir, `certificate-authenticity-4k-${timestamp}-prompt.txt`);
        fs.writeFileSync(promptPath, prompt);
        console.log(`✓ Prompt saved: ${promptPath}`);

        // Log file size
        const stats = fs.statSync(filepath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`✓ File size: ${sizeMB} MB`);
      }
    }

    if (imageCount === 0) {
      console.error("✗ No image was generated.");
      console.error("Response:", JSON.stringify(response, null, 2));
      process.exit(1);
    }

    console.log("");
    console.log("════════════════════════════════════════════════════════════");
    console.log("Generation complete! Check assets/generated/certificate/");
    console.log("════════════════════════════════════════════════════════════");

  } catch (error: any) {
    console.error("✗ Error generating image:", error.message);

    if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
      console.error("");
      console.error("This error usually means:");
      console.error("1. API key is invalid or expired");
      console.error("2. API key has IP/referrer restrictions");
      console.error("3. Image generation not enabled for this key");
      console.error("");
      console.error("Get a new key from: https://aistudio.google.com/apikey");
    }

    if (error.response) {
      console.error("Response details:", JSON.stringify(error.response, null, 2));
    }
    process.exit(1);
  }
}

generateImage();
