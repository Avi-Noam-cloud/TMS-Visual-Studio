/**
 * Vercel Serverless Function: /api/story
 *
 * Generate a complete 5-slide TMS Instagram Story.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

type SlideType = 'hook' | 'setup' | 'tms_bridge' | 'evidence' | 'cta';

const PALETTE = {
  jerusalemCream: '#F5F0E8',
  warmStone: '#D4C4A8',
  ancientGold: '#B8A27A',
  pureWhite: '#FFFFFF',
};

const SLIDE_ORDER: SlideType[] = ['hook', 'setup', 'tms_bridge', 'evidence', 'cta'];

function buildPrompt(topic: string, slideType: SlideType, text: string): string {
  const typeDescriptions: Record<SlideType, string> = {
    hook: 'Opening hook - arrest attention with mystery and intrigue.',
    setup: 'Setup slide - provide historical context.',
    tms_bridge: 'Bridge slide - connect to TMS value with authority.',
    evidence: 'Evidence slide - deliver concrete proof.',
    cta: 'CTA slide - warm call to action.',
  };

  return `[SCENE LOGIC]
${typeDescriptions[slideType]}
Topic: ${topic}

[SUBJECT]
Archaeological subject for ${topic}
- Authentic ancient materials
- Jerusalem stone environment

[COMPOSITION]
Format: 9:16 portrait Instagram Story
Negative space: Lower 35% for text

[LIGHTING]
Warm golden light (3200K), Jerusalem golden hour

[TEXT]
Content: "${text}"
Position: Lower third
Color: ${PALETTE.pureWhite}
Background: Gradient to 70% black

[CONSTRAINTS]
AVOID: Cool colors, modern elements, stock aesthetic
ENSURE: Jerusalem palette (${PALETTE.jerusalemCream}, ${PALETTE.warmStone}, ${PALETTE.ancientGold}), legible text, 9:16 ratio`;
}

function getDefaultText(topic: string, slideType: SlideType): string {
  const defaults: Record<SlideType, string> = {
    hook: `This discovery about ${topic} will change everything you thought you knew.`,
    setup: `For centuries, scholars debated ${topic}. The evidence was elusive—until now.`,
    tms_bridge: `TMS members have exclusive access to ${topic} documentation. Verified archaeology.`,
    evidence: `The proof is undeniable. ${topic} matches historical records exactly.`,
    cta: `Follow for more verified archaeology. The stones are speaking.`,
  };
  return defaults[slideType];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Parse topic from GET or POST
    const topic = req.method === 'GET'
      ? (req.query.topic as string) || 'Ancient Jerusalem Discovery'
      : (req.body?.topic || 'Ancient Jerusalem Discovery');

    const customTexts = req.body || {};

    console.log(`Generating story for: ${topic}`);

    const ai = new GoogleGenAI({ apiKey });
    const slides: any[] = [];

    for (const slideType of SLIDE_ORDER) {
      const textKey = `${slideType}Text`;
      const text = customTexts[textKey] || getDefaultText(topic, slideType);
      const prompt = buildPrompt(topic, slideType, text);

      console.log(`  Generating ${slideType}...`);

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: '9:16' as any }
        }
      });

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

      slides.push({
        slideNumber: SLIDE_ORDER.indexOf(slideType) + 1,
        slideType,
        text,
        image: imageBase64 || null,
        error: imageBase64 ? null : 'Generation failed',
      });
    }

    return res.status(200).json({
      success: true,
      topic,
      generatedAt: new Date().toISOString(),
      slides,
    });

  } catch (error) {
    console.error('Story generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Generation failed'
    });
  }
}
