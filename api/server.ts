/**
 * TMS Marketing API Server
 *
 * Simple REST API for generating Instagram Story images from any device.
 * Use with iOS Shortcuts, Android Tasker, or any HTTP client.
 *
 * Run: npx tsx api/server.ts
 * Or:  npm run api
 */

import http from 'http';
import { URL } from 'url';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

const PORT = process.env.API_PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('ERROR: GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

// ============================================================================
// JERUSALEM STONE PALETTE
// ============================================================================

const JERUSALEM_PALETTE = {
  jerusalemCream: '#F5F0E8',
  warmStone: '#D4C4A8',
  ancientGold: '#B8A27A',
  pureWhite: '#FFFFFF',
};

// ============================================================================
// PROMPT BUILDER (Simplified for API)
// ============================================================================

type SlideType = 'hook' | 'setup' | 'tms_bridge' | 'evidence' | 'cta';

interface SlideRequest {
  slideType: SlideType;
  text: string;
  visualBrief: string;
  topic: string;
}

function buildPrompt(slide: SlideRequest): string {
  const typeDescriptions: Record<SlideType, string> = {
    hook: 'This opening hook slide must immediately arrest attention with mystery and intrigue.',
    setup: 'This setup slide provides historical context, making viewers feel they are learning something significant.',
    tms_bridge: 'This bridge slide connects archaeological content to TMS value with an insider, authoritative feel.',
    evidence: 'This evidence slide delivers concrete proof, satisfying the curiosity built in previous slides.',
    cta: 'This final slide converts interest to action with a warm, welcoming, community-focused feel.',
  };

  return `[SCENE LOGIC]
${typeDescriptions[slide.slideType]}
Topic: ${slide.topic}
${slide.visualBrief}

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
Content: "${slide.text}"
Position: Lower third
Typography:
  - Font: Modern sans-serif, bold for headlines
  - Color: ${JERUSALEM_PALETTE.pureWhite}
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
- Jerusalem stone palette (${JERUSALEM_PALETTE.jerusalemCream}, ${JERUSALEM_PALETTE.warmStone}, ${JERUSALEM_PALETTE.ancientGold})
- Text fully legible
- Aspect ratio 9:16
- Archaeological authenticity
- Warm tones throughout`;
}

// ============================================================================
// IMAGE GENERATION
// ============================================================================

async function generateImage(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: '9:16' as any }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data; // Return base64 without data URL prefix
      }
    }
  }

  throw new Error('No image generated');
}

// ============================================================================
// HTTP SERVER
// ============================================================================

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function sendImage(res: http.ServerResponse, base64: string) {
  const buffer = Buffer.from(base64, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': buffer.length,
    'Access-Control-Allow-Origin': '*',
  });
  res.end(buffer);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, {});
    return;
  }

  console.log(`${req.method} ${url.pathname}`);

  try {
    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      sendJson(res, 200, {
        status: 'ok',
        service: 'TMS Marketing API',
        endpoints: ['/generate', '/slide', '/quick']
      });
      return;
    }

    // Quick generation - minimal params via GET
    // Example: /quick?topic=Pool%20of%20Siloam&type=hook
    if (url.pathname === '/quick' && req.method === 'GET') {
      const topic = url.searchParams.get('topic') || 'Ancient Jerusalem Discovery';
      const type = (url.searchParams.get('type') || 'hook') as SlideType;
      const format = url.searchParams.get('format') || 'json'; // 'json' or 'image'

      const defaultTexts: Record<SlideType, string> = {
        hook: `This discovery about ${topic} will change everything you thought you knew.`,
        setup: `For centuries, scholars debated whether ${topic} was real. The evidence was elusive—until now.`,
        tms_bridge: `TMS members have exclusive access to documentation about ${topic}. This is verified archaeology.`,
        evidence: `The proof is undeniable. ${topic} matches historical records exactly.`,
        cta: `Follow for more verified archaeology. The stones are speaking—are you listening?`,
      };

      const prompt = buildPrompt({
        slideType: type,
        text: defaultTexts[type],
        visualBrief: `Archaeological scene related to ${topic}`,
        topic,
      });

      console.log('Generating image...');
      const imageBase64 = await generateImage(prompt);

      if (format === 'image') {
        sendImage(res, imageBase64);
      } else {
        sendJson(res, 200, {
          success: true,
          slideType: type,
          topic,
          image: imageBase64,
          prompt,
        });
      }
      return;
    }

    // Full slide generation via POST
    if (url.pathname === '/slide' && req.method === 'POST') {
      const body = await parseBody(req);

      if (!body.text || !body.topic) {
        sendJson(res, 400, { error: 'Missing required fields: text, topic' });
        return;
      }

      const slideType = body.slideType || 'hook';
      const prompt = buildPrompt({
        slideType,
        text: body.text,
        visualBrief: body.visualBrief || `Archaeological scene for ${body.topic}`,
        topic: body.topic,
      });

      console.log('Generating slide...');
      const imageBase64 = await generateImage(prompt);

      sendJson(res, 200, {
        success: true,
        slideType,
        image: imageBase64,
        prompt,
      });
      return;
    }

    // Generate full 5-slide story via POST
    if (url.pathname === '/story' && req.method === 'POST') {
      const body = await parseBody(req);
      const topic = body.topic || 'Ancient Jerusalem Discovery';

      const slides: SlideType[] = ['hook', 'setup', 'tms_bridge', 'evidence', 'cta'];
      const results: any[] = [];

      for (const slideType of slides) {
        const slideData = body.slides?.find((s: any) => s.slideType === slideType);

        const defaultTexts: Record<SlideType, string> = {
          hook: body.hookText || `This discovery about ${topic} will change everything.`,
          setup: body.setupText || `For centuries, scholars debated ${topic}. Until now.`,
          tms_bridge: body.bridgeText || `TMS members have exclusive access to ${topic} documentation.`,
          evidence: body.evidenceText || `The proof is undeniable. ${topic} is verified.`,
          cta: body.ctaText || `Follow for more verified archaeology.`,
        };

        const prompt = buildPrompt({
          slideType,
          text: slideData?.text || defaultTexts[slideType],
          visualBrief: slideData?.visualBrief || `Archaeological scene for ${topic}`,
          topic,
        });

        console.log(`Generating ${slideType} slide...`);
        const imageBase64 = await generateImage(prompt);

        results.push({
          slideNumber: slides.indexOf(slideType) + 1,
          slideType,
          image: imageBase64,
        });
      }

      sendJson(res, 200, {
        success: true,
        topic,
        slides: results,
      });
      return;
    }

    // 404
    sendJson(res, 404, { error: 'Not found' });

  } catch (error) {
    console.error('Error:', error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           TMS Marketing API Server                        ║
╠════════════════════════════════════════════════════════════╣
║  Running on: http://localhost:${PORT}                        ║
║                                                            ║
║  Endpoints:                                                ║
║    GET  /              Health check                        ║
║    GET  /quick         Quick generate (topic, type params) ║
║    POST /slide         Generate single slide               ║
║    POST /story         Generate full 5-slide story         ║
║                                                            ║
║  Quick Test:                                               ║
║    curl "http://localhost:${PORT}/quick?topic=Pool+of+Siloam" ║
╚════════════════════════════════════════════════════════════╝
  `);
});
