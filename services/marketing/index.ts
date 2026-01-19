/**
 * TMS Marketing Agents - Main Export
 *
 * This module provides the image generation service for TMS Instagram Stories
 * using Gemini 3.0 Image (Nano Banana Pro)
 */

export {
  MarketingImageService,
  createMarketingImageService,
  EXAMPLE_SLIDE_INPUT,
  EXAMPLE_STORY_INPUT,
} from '../marketingImageService';

export type {
  SlideInput,
  SlideType,
  EmotionalTarget,
  CTAType,
  GeneratedSlide,
  StorySequenceInput,
  StoryGenerationResult,
  MarketingAgentConfig,
  GenerationSettings,
  SceneLogic,
  SubjectSpec,
  CompositionSpec,
  LightingSpec,
  TextSpec,
  ConstraintsSpec,
  FullPromptComponents,
} from '../marketingTypes';

export {
  JERUSALEM_PALETTE,
  DEFAULT_GENERATION_SETTINGS,
} from '../marketingTypes';
