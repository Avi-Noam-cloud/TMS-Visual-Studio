/**
 * Vercel Serverless Function: /api/generate
 *
 * Generate TMS Instagram Story images from anywhere.
 * Deploy to Vercel for 24/7 access from your phone.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// ============================================================================
// TYPES
// ============================================================================

type SlideType = 'hook' | 'setup' | 'tms_bridge' | 'evidence' | 'cta';

interface GenerateRequest {
  topic: string;
  type?: SlideType;
  text?: string;
  visualBrief?: string;
  format?: 'json' | 'image';
}

// ============================================================================
// JERUSALEM STONE PALETTE
// ============================================================================

const PALETTE = {
  jerusalemCream: '#F5F0E8',
  warmStone: '#D4C4A8',
  ancientGold: '#B8A27A',
  pureWhite: '#FFFFFF',
};

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildPrompt(topic: string, slideType: SlideType, text: string, visualBrief: string): string {
  const typeDescriptions: Record<SlideType, string> = {
    hook: 'This opening hook slide must immediately arrest attention with mystery and intrigue.',
    setup: 'This setup slide provides historical context, making viewers feel they are learning something significant.',
    tms_bridge: 'This bridge slide connects archaeological content to TMS value with an insider, authoritative feel.',
    evidence: 'This evidence slide delivers concrete proof, satisfying the curiosity built in previous slides.',
    cta: 'This final slide converts interest to action with a warm, welcoming, community-focused feel.',
  };

  return `[SCENE LOGIC]
${typeDescriptions[slideType]}
Topic: ${topic}
${visualBrief}

[SUBJECT]
Primary: Archaeological subject based on the visual brief
- Authentic ancient materials and textures
- Jerusalem stone environment
- Period-accurate details

[COMPOSITION]
Format: 9:16 portrait (1080x1920px Instagram Story)
Negative space: Reserve lower 35% for text overlay
Depth: Foreground context, midground focus, background atmosphere

[LIGHTING]
Primary: Warm golden light (3200K)
Quality: Dramatic but clear
Atmosphere: Jerusalem golden hour feeling
Shadows: Warm-toned, not cold

[TEXT]
Content: "${text}"
Position: Lower third
Typography:
  - Font: Modern sans-serif, bold for headlines
  - Color: ${PALETTE.pureWhite}
  - Background: Gradient from transparent to 70% black
  - Alignment: Left with margins

[CONSTRAINTS]
AVOID:
- Cool color temperatures (no blue/green tint)
- Stock photography aesthetic
- Modern elements (no phones, logos)
- Waxy or plastic textures
- Text rendering errors

ENSURE:
- Jerusalem stone palette (${PALETTE.jerusalemCream}, ${PALETTE.warmStone}, ${PALETTE.ancientGold})
- Text fully legible
- Aspect ratio 9:16
- Archaeological authenticity
- Warm tones throughout`;
}

// ============================================================================
// DEFAULT TEXTS
// ============================================================================

function getDefaultText(topic: string, slideType: SlideType): string {
  const defaults: Record<SlideType, string> = {
    hook: `This discovery about ${topic} will change everything you thought you knew.`,
    setup: `For centuries, scholars debated whether ${topic} was real. The evidence was elusive—until now.`,
    tms_bridge: `TMS members have exclusive access to documentation about ${topic}. This is verified archaeology.`,
    evidence: `The proof is undeniable. ${topic} matches historical records exactly.`,
    cta: `Follow for more verified archaeology. The stones are speaking—are you listening?`,
  };
  return defaults[slideType];
}

// ============================================================================
// HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Parse request (supports both GET and POST)
    let params: GenerateRequest;

    if (req.method === 'GET') {
      params = {
        topic: (req.query.topic as string) || 'Ancient Jerusalem Discovery',
        type: (req.query.type as SlideType) || 'hook',
        text: req.query.text as string,
        visualBrief: req.query.brief as string,
        format: (req.query.format as 'json' | 'image') || 'json',
      };
    } else {
      params = req.body as GenerateRequest;
    }

    const {
      topic = 'Ancient Jerusalem Discovery',
      type: slideType = 'hook',
      text,
      visualBrief = `Archaeological scene related to ${topic}`,
      format = 'json',
    } = params;

    // Build prompt
    const finalText = text || getDefaultText(topic, slideType);
    const prompt = buildPrompt(topic, slideType, finalText, visualBrief);

    console.log(`Generating ${slideType} slide for: ${topic}`);

    // Generate image
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: '9:16' as any }
      }
    });

    // Extract image
    const parts = response.candidates?.[0]?.content?.parts;
    let imageBase64 = '';

    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageBase64) {
      return res.status(500).json({ error: 'No image generated' });
    }

    // Return based on format
    if (format === 'image') {
      const buffer = Buffer.from(imageBase64, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    return res.status(200).json({
      success: true,
      topic,
      slideType,
      text: finalText,
      image: imageBase64,
    });

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Generation failed'
    });
  }
}
