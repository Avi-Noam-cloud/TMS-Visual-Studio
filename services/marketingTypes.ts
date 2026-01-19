/**
 * Marketing Agent Types
 * Types for the TMS Instagram Stories image generation workflow
 */

// ============================================================================
// JERUSALEM STONE PALETTE
// ============================================================================

export const JERUSALEM_PALETTE = {
  // Primary Colors
  jerusalemCream: '#F5F0E8',
  warmStone: '#D4C4A8',
  ancientGold: '#B8A27A',
  desertSand: '#C9B896',
  deepBronze: '#8B7355',
  oliveShadow: '#6B5B45',

  // Text Colors
  pureWhite: '#FFFFFF',
  warmCream: '#F5F0E8',
} as const;

// ============================================================================
// SLIDE TYPES
// ============================================================================

export type SlideType = 'hook' | 'setup' | 'tms_bridge' | 'evidence' | 'cta';

export type EmotionalTarget = 'curiosity' | 'anticipation' | 'trust' | 'wonder' | 'motivation';

export type CTAType = 'follow' | 'link' | 'comment' | 'share';

// ============================================================================
// ORCHESTRATOR INPUT/OUTPUT
// ============================================================================

export interface SlideInput {
  slideNumber: 1 | 2 | 3 | 4 | 5;
  slideType: SlideType;
  textCopy: string;
  visualBrief: string;
  emotionalTarget: EmotionalTarget;
  topic: string;
  tmsValueProposition?: string; // For bridge slides
  ctaType?: CTAType; // For CTA slides
}

export interface StorySequenceInput {
  storyId: string;
  topic: string;
  angle: number; // 1-7 from content rotation
  slides: SlideInput[];
  verification?: {
    sources: string[];
    safeZoneCompliance: 'green' | 'yellow';
    tmsBridgeCheck: 'pass' | 'needs_revision';
  };
}

// ============================================================================
// IMAGE GENERATION
// ============================================================================

export interface GeneratedSlide {
  slideNumber: number;
  slideType: SlideType;
  imageDataUrl: string; // Base64 data URL
  prompt: string; // The full prompt used
  generatedAt: string; // ISO timestamp
}

export interface StoryGenerationResult {
  storyId: string;
  topic: string;
  slides: GeneratedSlide[];
  completedAt: string;
  errors?: string[];
}

// ============================================================================
// PROMPT COMPONENTS (Six-Component Architecture)
// ============================================================================

export interface SceneLogic {
  purpose: string;
  viewerEmotion: EmotionalTarget;
  historicalContext: string;
}

export interface SubjectSpec {
  primary: string;
  secondary?: string;
  historicalAccuracy?: string;
}

export interface CompositionSpec {
  framing: string;
  focalPoint: string;
  foreground?: string;
  midground?: string;
  background?: string;
  negativeSpace: string;
}

export interface LightingSpec {
  primarySource: string;
  colorTemperature: string;
  quality: string;
  shadows: string;
  atmosphere?: string;
}

export interface TextSpec {
  content: string;
  position: 'top' | 'center' | 'bottom';
  fontStyle: 'sans-serif-bold' | 'sans-serif-medium' | 'sans-serif-regular';
  color: string;
  backgroundColor: string;
  alignment: 'left' | 'center' | 'right';
}

export interface ConstraintsSpec {
  avoid: string[];
  ensure: string[];
}

export interface FullPromptComponents {
  sceneLogic: SceneLogic;
  subject: SubjectSpec;
  composition: CompositionSpec;
  lighting: LightingSpec;
  text: TextSpec;
  constraints: ConstraintsSpec;
}

// ============================================================================
// GENERATION SETTINGS
// ============================================================================

export interface GenerationSettings {
  aspectRatio: '9:16';
  resolution: '1080x1920';
  styleReference: 'archaeological-documentary';
  colorProfile: 'jerusalem-stone-warm';
  model: 'gemini-3-pro-image-preview';
}

export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  aspectRatio: '9:16',
  resolution: '1080x1920',
  styleReference: 'archaeological-documentary',
  colorProfile: 'jerusalem-stone-warm',
  model: 'gemini-3-pro-image-preview',
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export interface MarketingAgentConfig {
  apiKey: string;
  maxRetries?: number;
  retryDelayMs?: number;
  enableLogging?: boolean;
}
