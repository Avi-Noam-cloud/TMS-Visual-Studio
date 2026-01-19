# TMS Marketing Image Generation Agent

This module provides automated Instagram Story image generation using Gemini 3.0 Image (Nano Banana Pro).

## Quick Start

```typescript
import { createMarketingImageService, EXAMPLE_STORY_INPUT } from './services/marketing';

// Create the service with your API key
const service = createMarketingImageService(process.env.GEMINI_API_KEY);

// Generate a complete 5-slide story
const result = await service.generateStory(EXAMPLE_STORY_INPUT);

// Each slide contains the image data URL
result.slides.forEach(slide => {
  console.log(`Slide ${slide.slideNumber}: ${slide.imageDataUrl.substring(0, 50)}...`);
});
```

## Architecture

### Workflow

```
┌─────────────────────────────┐
│   Content Request           │
│   (Topic + Context)         │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│  IG STORIES ORCHESTRATOR    │
│  (Documentation Agent)      │
│  • Verifies facts           │
│  • Maps narrative arc       │
│  • Drafts 5 slides          │
│  • Outputs text + briefs    │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│  TMS IMAGE GENERATION       │
│  (This Service)             │
│  • Receives slide briefs    │
│  • Builds 6-component prompt│
│  • Calls Gemini 3.0 Image   │
│  • Returns complete slides  │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│  Human Review & Posting     │
└─────────────────────────────┘
```

### Six-Component Prompt Architecture

Every prompt is structured with:

1. **[SCENE LOGIC]** - Why the scene exists, viewer emotion target
2. **[SUBJECT]** - Primary and secondary visual elements
3. **[COMPOSITION]** - Framing, depth, negative space for text
4. **[LIGHTING]** - Color temperature, mood, atmosphere
5. **[TEXT]** - Exact copy, typography, positioning
6. **[CONSTRAINTS]** - Failure prevention, brand compliance

## Slide Types

| Slide | Type | Purpose | Emotional Target |
|-------|------|---------|------------------|
| 1 | Hook | Stop the scroll | Curiosity |
| 2 | Setup | Establish context | Anticipation |
| 3 | TMS Bridge | Connect to TMS value | Trust |
| 4 | Evidence | Deliver the payload | Wonder |
| 5 | CTA | Convert to action | Motivation |

## Jerusalem Stone Palette

```typescript
const JERUSALEM_PALETTE = {
  jerusalemCream: '#F5F0E8',
  warmStone: '#D4C4A8',
  ancientGold: '#B8A27A',
  desertSand: '#C9B896',
  deepBronze: '#8B7355',
  oliveShadow: '#6B5B45',
  pureWhite: '#FFFFFF',
  warmCream: '#F5F0E8',
};
```

## API

### `createMarketingImageService(apiKey: string)`

Factory function to create a new service instance.

### `MarketingImageService`

#### `generateSlide(slide: SlideInput): Promise<GeneratedSlide>`

Generate a single slide image.

#### `generateStory(input: StorySequenceInput): Promise<StoryGenerationResult>`

Generate all 5 slides for a complete story.

#### `generateFromPrompt(prompt: string): Promise<string>`

Generate an image from a raw prompt (for testing/custom use).

## Types

```typescript
interface SlideInput {
  slideNumber: 1 | 2 | 3 | 4 | 5;
  slideType: 'hook' | 'setup' | 'tms_bridge' | 'evidence' | 'cta';
  textCopy: string;
  visualBrief: string;
  emotionalTarget: 'curiosity' | 'anticipation' | 'trust' | 'wonder' | 'motivation';
  topic: string;
  tmsValueProposition?: string;
  ctaType?: 'follow' | 'link' | 'comment' | 'share';
}

interface GeneratedSlide {
  slideNumber: number;
  slideType: SlideType;
  imageDataUrl: string;
  prompt: string;
  generatedAt: string;
}
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

## Related Documentation

- `/Documentation/claudefiles/marketing/agents/IG_STORIES_ORCHESTRATOR_AGENT.md`
- `/Documentation/claudefiles/marketing/agents/TMS_IMAGE_GENERATION_AGENT.md`
