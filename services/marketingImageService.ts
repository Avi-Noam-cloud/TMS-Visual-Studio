/**
 * TMS Marketing Image Generation Service
 *
 * Generates Instagram Story images using Gemini 3.0 Image (Nano Banana Pro)
 * Implements the six-component prompt architecture optimized for TMS branding
 */

import { GoogleGenAI } from "@google/genai";
import {
  SlideInput,
  SlideType,
  EmotionalTarget,
  GeneratedSlide,
  StorySequenceInput,
  StoryGenerationResult,
  JERUSALEM_PALETTE,
  MarketingAgentConfig,
  DEFAULT_GENERATION_SETTINGS,
} from "./marketingTypes";

// ============================================================================
// RETRY HELPER
// ============================================================================

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 2000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable =
        errorMessage.includes('503') ||
        errorMessage.includes('429') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('busy') ||
        errorMessage.includes('rate limit');

      if (isRetryable && attempt <= maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
  throw lastError;
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Build the [SCENE LOGIC] component
 */
function buildSceneLogic(slide: SlideInput): string {
  const emotionDescriptions: Record<EmotionalTarget, string> = {
    curiosity: 'curious and intrigued, wanting to learn more',
    anticipation: 'anticipation building, sensing something significant',
    trust: 'trust and recognition of TMS expertise',
    wonder: 'wonder and awe at the evidence revealed',
    motivation: 'motivated to engage and become part of the community',
  };

  const typeDescriptions: Record<SlideType, string> = {
    hook: 'This opening hook slide must immediately arrest attention. The viewer scrolling through Instagram stories should stop because something feels mysterious, significant, or unresolved.',
    setup: 'This setup slide provides historical context for the story. The viewer should feel they are learning something significant—being let in on knowledge that matters.',
    tms_bridge: 'This critical bridge slide connects the archaeological content to TMS value. The viewer should feel they are receiving insider access—knowledge and perspectives available through TMS membership.',
    evidence: 'This evidence slide delivers the revelation. The viewer\'s curiosity built through previous slides is now satisfied with concrete proof.',
    cta: 'This final slide converts built interest into action. The viewer should feel invited into a community, motivated to engage, and clear on what to do next.',
  };

  return `[SCENE LOGIC]
${typeDescriptions[slide.slideType]}
The viewer should feel ${emotionDescriptions[slide.emotionalTarget]}.
Topic: ${slide.topic}
${slide.visualBrief}`;
}

/**
 * Build the [SUBJECT] component
 */
function buildSubject(slide: SlideInput): string {
  const subjectGuidelines: Record<SlideType, string> = {
    hook: `Primary: Archaeological subject shrouded in mystery
- Partial visibility (emerging from shadow/earth/time)
- Signs of age and authenticity (patina, wear, excavation context)
- Scale indicators for dramatic effect

Secondary: Context elements suggesting discovery
- Excavation tools, measuring equipment (if appropriate)
- Jerusalem stone environment
- Dust particles catching light`,

    setup: `Primary: Contextual scene or establishing shot
- Wide enough to show environment
- Historical accuracy in architecture/artifacts
- Educational visual elements

Secondary: Supporting context
- Period-accurate environmental details
- Scale references for understanding
- Subtle indicators of location/time period`,

    tms_bridge: `Primary: Evidence or insight that TMS provides access to
- Detailed view suggesting expert analysis
- Documentation, research, or exclusive access implied
- Professional archaeological context

Secondary: TMS value indicators
- Research materials, documentation visible
- Expert perspective suggested
- Premium, professional environment`,

    evidence: `Primary: The specific evidence/artifact/site
- Maximum detail and clarity
- Archaeological authenticity unmistakable
- Scale clear (include reference if helpful)

Secondary: Proof indicators
- Visible dating clues
- Archaeological context preserved
- Expert documentation visible`,

    cta: `Primary: Warm, inviting scene suggesting community/continuation
- Human connection implied (carefully rendered if people shown)
- Ongoing journey suggested
- TMS community/value subtly present

Secondary: Future promise
- More to discover implied
- Community belonging suggested
- Welcome and inclusion`,
  };

  return `[SUBJECT]
${subjectGuidelines[slide.slideType]}

Visual Brief: ${slide.visualBrief}`;
}

/**
 * Build the [COMPOSITION] component
 */
function buildComposition(slide: SlideInput): string {
  const textPositions: Record<SlideType, string> = {
    hook: 'Negative space: Lower 40% reserved for text overlay',
    setup: 'Negative space: Text area (top or bottom 35%)',
    tms_bridge: 'Negative space: Centered or lower text area',
    evidence: 'Negative space: Lower 30% for text',
    cta: 'Negative space: Centered large text area',
  };

  const framingGuidelines: Record<SlideType, string> = {
    hook: 'Framing: Subject positioned in upper-middle third, creating mystery',
    setup: 'Framing: Wider establishing shot, educational clarity',
    tms_bridge: 'Framing: Intimate, detail-oriented, authoritative',
    evidence: 'Framing: Close-up or detail shot, maximum clarity',
    cta: 'Framing: Open, inviting, welcoming composition',
  };

  return `[COMPOSITION]
Format: 9:16 portrait (1080x1920px Instagram Story)
${framingGuidelines[slide.slideType]}
Depth:
  - Foreground: Contextual framing elements
  - Midground: Primary subject in focus
  - Background: Jerusalem stone atmosphere
${textPositions[slide.slideType]}`;
}

/**
 * Build the [LIGHTING] component
 */
function buildLighting(slide: SlideInput): string {
  const lightingStyles: Record<SlideType, string> = {
    hook: `Primary: Dramatic side lighting from upper left
Color temperature: Warm golden (3200K equivalent)
Key light intensity: High contrast, 4:1 ratio
Fill: Minimal, preserving mystery in shadows
Atmosphere: Visible dust motes in light beams`,

    setup: `Primary: Natural daylight, golden hour preferred
Color temperature: Warm (3500K equivalent)
Quality: Soft, diffused, educational clarity
Fill: Adequate to see all important details
Atmosphere: Light haze suggesting ancient atmosphere`,

    tms_bridge: `Primary: Warm, confident lighting
Color temperature: Golden warm (3200K)
Quality: Professional, suggests expertise
Shadows: Soft, welcoming but authoritative
Accent lighting: Subtle rim light on key elements`,

    evidence: `Primary: Revealing, documentary-style
Color temperature: Accurate for artifact (3400K base)
Quality: Sharp, detailed, professional
Shadows: Minimal, show all details
Special: Raking light to reveal texture/inscriptions`,

    cta: `Primary: Warm, golden, embracing
Color temperature: Very warm (3000K)
Quality: Soft, glowing, hopeful
Shadows: Minimal, warm-toned
Atmosphere: Golden hour, promising`,
  };

  return `[LIGHTING]
${lightingStyles[slide.slideType]}`;
}

/**
 * Build the [TEXT] component
 */
function buildText(slide: SlideInput): string {
  const textPositions: Record<SlideType, string> = {
    hook: 'Position: Lower third (bottom 35% of frame)',
    setup: 'Position: Top or bottom third based on subject',
    tms_bridge: 'Position: Lower third or centered',
    evidence: 'Position: Lower third only',
    cta: 'Position: Centered, prominent',
  };

  const alignments: Record<SlideType, string> = {
    hook: 'Alignment: Left-aligned with 48px margin',
    setup: 'Alignment: Left-aligned with 48px margin',
    tms_bridge: 'Alignment: Center or left with 48px margin',
    evidence: 'Alignment: Left with 48px margin',
    cta: 'Alignment: Center',
  };

  return `[TEXT]
Content: "${slide.textCopy}"
${textPositions[slide.slideType]}
Typography:
  - Font: Modern sans-serif, clean and professional
  - Primary text color: ${JERUSALEM_PALETTE.pureWhite}
  - Secondary text color: ${JERUSALEM_PALETTE.warmCream}
  - Size: Appropriate for Instagram Stories readability
  - Line spacing: 1.3-1.4
  - Background: Gradient overlay from transparent to 70% black
  - Text shadow: Subtle, 2px offset for legibility
  - ${alignments[slide.slideType]}`;
}

/**
 * Build the [CONSTRAINTS] component
 */
function buildConstraints(slide: SlideInput): string {
  const commonAvoid = [
    'Cool color temperatures (no blue/green tint)',
    'Stock photography aesthetic (avoid over-polished look)',
    'Modern elements visible (no watches, phones, logos)',
    'Waxy or plastic skin textures on any human elements',
    'Anatomically incorrect hands (if hands are present)',
    'Text rendering errors or misspellings',
    'Compression artifacts or low resolution',
  ];

  const commonEnsure = [
    `Jerusalem stone palette dominates (${JERUSALEM_PALETTE.jerusalemCream}, ${JERUSALEM_PALETTE.warmStone}, ${JERUSALEM_PALETTE.ancientGold})`,
    'Text is fully legible against background',
    'Aspect ratio exactly 9:16',
    'Archaeological authenticity in all details',
    'Warm tones throughout the image',
  ];

  const typeSpecificAvoid: Record<SlideType, string[]> = {
    hook: ['Fully visible subject (maintain mystery)', 'Flat lighting (preserve drama)'],
    setup: ['Cluttered compositions', 'Harsh shadows obscuring important details'],
    tms_bridge: ['Hard selling aesthetic', 'Disconnection from archaeological content'],
    evidence: ['Obscuring important evidence details', 'Ambiguous scale', 'Shadows hiding crucial features'],
    cta: ['Cold or transactional feeling', 'Isolated or exclusive imagery', 'Abrupt ending feeling'],
  };

  const typeSpecificEnsure: Record<SlideType, string[]> = {
    hook: ['Subject creates genuine curiosity', 'Dramatic atmosphere maintained'],
    setup: ['Clear educational value visible', 'Establishes "where and when" clearly'],
    tms_bridge: ['TMS value feels organic, not forced', 'Authority and expertise conveyed'],
    evidence: ['Evidence is clearly visible and convincing', '"Wow" factor achieved'],
    cta: ['Warm, inviting atmosphere', 'Clear call to action', 'Community feeling conveyed'],
  };

  return `[CONSTRAINTS]
AVOID:
${[...commonAvoid, ...typeSpecificAvoid[slide.slideType]].map(item => `- ${item}`).join('\n')}

ENSURE:
${[...commonEnsure, ...typeSpecificEnsure[slide.slideType]].map(item => `- ${item}`).join('\n')}`;
}

/**
 * Build the complete six-component prompt
 */
function buildFullPrompt(slide: SlideInput): string {
  return `${buildSceneLogic(slide)}

${buildSubject(slide)}

${buildComposition(slide)}

${buildLighting(slide)}

${buildText(slide)}

${buildConstraints(slide)}`;
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class MarketingImageService {
  private ai: GoogleGenAI;
  private config: MarketingAgentConfig;

  constructor(config: MarketingAgentConfig) {
    this.config = {
      maxRetries: 5,
      retryDelayMs: 2000,
      enableLogging: true,
      ...config,
    };
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
  }

  /**
   * Generate a single slide image
   */
  async generateSlide(slide: SlideInput): Promise<GeneratedSlide> {
    const prompt = buildFullPrompt(slide);

    if (this.config.enableLogging) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Generating Slide ${slide.slideNumber} (${slide.slideType})`);
      console.log(`${'='.repeat(60)}`);
      console.log(prompt);
    }

    const imageDataUrl = await retryOperation(
      async () => {
        const response = await this.ai.models.generateContent({
          model: DEFAULT_GENERATION_SETTINGS.model,
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: DEFAULT_GENERATION_SETTINGS.aspectRatio as "9:16"
            }
          }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              return `data:${mimeType};base64,${part.inlineData.data}`;
            }
          }
        }

        throw new Error('No image data found in response');
      },
      this.config.maxRetries,
      this.config.retryDelayMs
    );

    return {
      slideNumber: slide.slideNumber,
      slideType: slide.slideType,
      imageDataUrl,
      prompt,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate all slides for a complete story sequence
   */
  async generateStory(input: StorySequenceInput): Promise<StoryGenerationResult> {
    const results: GeneratedSlide[] = [];
    const errors: string[] = [];

    if (this.config.enableLogging) {
      console.log(`\n${'#'.repeat(60)}`);
      console.log(`Starting Story Generation: ${input.topic}`);
      console.log(`Story ID: ${input.storyId}`);
      console.log(`Slides to generate: ${input.slides.length}`);
      console.log(`${'#'.repeat(60)}\n`);
    }

    for (const slide of input.slides) {
      try {
        const result = await this.generateSlide(slide);
        results.push(result);

        if (this.config.enableLogging) {
          console.log(`\n[SUCCESS] Slide ${slide.slideNumber} generated`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Slide ${slide.slideNumber}: ${errorMessage}`);

        if (this.config.enableLogging) {
          console.error(`\n[ERROR] Slide ${slide.slideNumber} failed: ${errorMessage}`);
        }
      }
    }

    return {
      storyId: input.storyId,
      topic: input.topic,
      slides: results,
      completedAt: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Generate a single image from a raw prompt (for testing/custom use)
   */
  async generateFromPrompt(prompt: string): Promise<string> {
    if (this.config.enableLogging) {
      console.log(`\nGenerating image from custom prompt...`);
    }

    return retryOperation(
      async () => {
        const response = await this.ai.models.generateContent({
          model: DEFAULT_GENERATION_SETTINGS.model,
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: DEFAULT_GENERATION_SETTINGS.aspectRatio as "9:16"
            }
          }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              return `data:${mimeType};base64,${part.inlineData.data}`;
            }
          }
        }

        throw new Error('No image data found in response');
      },
      this.config.maxRetries,
      this.config.retryDelayMs
    );
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new MarketingImageService instance
 */
export function createMarketingImageService(apiKey: string): MarketingImageService {
  return new MarketingImageService({ apiKey });
}

// ============================================================================
// EXAMPLE USAGE (for testing)
// ============================================================================

export const EXAMPLE_SLIDE_INPUT: SlideInput = {
  slideNumber: 1,
  slideType: 'hook',
  textCopy: 'For 2,000 years, skeptics claimed this pool from John 9 was a myth. Then construction workers broke ground in Jerusalem. What they found changed everything.',
  visualBrief: 'Ancient stone steps emerging from excavation, dramatic lighting, sense of discovery moment. Text overlay with hook copy.',
  emotionalTarget: 'curiosity',
  topic: 'Pool of Siloam Archaeological Discovery',
};

export const EXAMPLE_STORY_INPUT: StorySequenceInput = {
  storyId: 'pool-of-siloam-001',
  topic: 'Pool of Siloam Archaeological Discovery',
  angle: 1,
  slides: [
    {
      slideNumber: 1,
      slideType: 'hook',
      textCopy: 'For 2,000 years, skeptics claimed this pool from John 9 was a myth. Then construction workers broke ground in Jerusalem. What they found changed everything.',
      visualBrief: 'Ancient stone steps emerging from excavation, dramatic lighting, sense of discovery moment.',
      emotionalTarget: 'curiosity',
      topic: 'Pool of Siloam Archaeological Discovery',
    },
    {
      slideNumber: 2,
      slideType: 'setup',
      textCopy: 'The Pool of Siloam—where Jesus healed a blind man—was considered legend by many scholars. No archaeological evidence existed. Until 2004, when a sewage pipe burst.',
      visualBrief: 'Split view feeling: ancient manuscript aesthetic alongside modern Jerusalem. Scholarly, educational feel.',
      emotionalTarget: 'anticipation',
      topic: 'Pool of Siloam Archaeological Discovery',
    },
    {
      slideNumber: 3,
      slideType: 'tms_bridge',
      textCopy: 'TMS members have walked these actual steps. Our documentation includes detailed analysis of the Pool\'s construction matching Second Temple period techniques. This isn\'t just history—it\'s verification.',
      visualBrief: 'The excavated pool with visible ancient steps, warm Jerusalem stone tones. Authoritative, insider feel.',
      emotionalTarget: 'trust',
      topic: 'Pool of Siloam Archaeological Discovery',
      tmsValueProposition: 'On-site access + detailed documentation',
    },
    {
      slideNumber: 4,
      slideType: 'evidence',
      textCopy: 'Archaeologists confirmed: the pool matches John\'s description exactly. Ritual purification steps. Second Temple period construction. The very place where a blind man received sight—proven real.',
      visualBrief: 'Close-up of ancient carved steps with water, archaeological detail visible. Golden hour lighting.',
      emotionalTarget: 'wonder',
      topic: 'Pool of Siloam Archaeological Discovery',
    },
    {
      slideNumber: 5,
      slideType: 'cta',
      textCopy: 'Every discovery like this strengthens the foundation. Follow for more verified archaeology that brings Scripture to life. The stones are speaking—are you listening?',
      visualBrief: 'Warm, inviting view of the site with visitors, community feel. TMS branding subtle but present.',
      emotionalTarget: 'motivation',
      topic: 'Pool of Siloam Archaeological Discovery',
      ctaType: 'follow',
    },
  ],
  verification: {
    sources: ['TMS Jerusalem Sites Documentation', 'Ronny Reich excavation reports'],
    safeZoneCompliance: 'green',
    tmsBridgeCheck: 'pass',
  },
};
