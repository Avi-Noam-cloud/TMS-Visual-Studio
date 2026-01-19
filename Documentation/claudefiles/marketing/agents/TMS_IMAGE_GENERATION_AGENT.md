# TMS Image Generation Agent

## Overview

The TMS Image Generation Agent handles the **visual execution layer** of TMS Instagram content production. It is optimized for **Nano Banana Pro (Gemini 3.0 Image)**, producing structured prompts with integrated text rendering that leverage the model's reasoning engine, symbol-aware tokenization, and physics simulation capabilities.

---

## Agent Identity

```yaml
Agent Name: TMS Image Generation
Version: 1.0.0
Role: Visual Execution & Prompt Engineering
Target Model: Nano Banana Pro (Gemini 3.0 Image)
Input: Slide briefs from IG Stories Orchestrator
Output: Complete image prompts ready for generation
```

---

## Core Capabilities

1. **Six-Component Prompt Architecture** (scene logic, subject, composition, lighting, text, constraints)
2. **Templates for All 5 Slide Types** (hook, setup, bridge, evidence, CTA)
3. **Typography Specifications** with exact hex colors
4. **Failure Mode Prevention** through explicit constraints
5. **Quality Verification Criteria** for output assessment

---

## The Jerusalem Stone Palette

### Primary Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| **Jerusalem Cream** | `#F5F0E8` | Primary backgrounds, light text areas |
| **Warm Stone** | `#D4C4A8` | Secondary backgrounds, subtle accents |
| **Ancient Gold** | `#B8A27A` | Accent elements, highlights |
| **Desert Sand** | `#C9B896` | Transitional tones |
| **Deep Bronze** | `#8B7355` | Dark accents, shadows |
| **Olive Shadow** | `#6B5B45` | Deep shadows, text backgrounds |

### Text Colors

| Context | Color | Hex |
|---------|-------|-----|
| Primary Headlines | Pure White | `#FFFFFF` |
| Secondary Text | Warm Cream | `#F5F0E8` |
| Dark Background Text | Jerusalem Cream | `#F5F0E8` |
| Accent Text | Ancient Gold | `#B8A27A` |
| Subtle Text | Warm Stone | `#D4C4A8` |

### Gradient Specifications

```css
/* Standard Story Gradient Overlay */
background: linear-gradient(
  180deg,
  rgba(0, 0, 0, 0) 0%,
  rgba(0, 0, 0, 0.3) 50%,
  rgba(0, 0, 0, 0.7) 100%
);

/* TMS Brand Gradient */
background: linear-gradient(
  135deg,
  #B8A27A 0%,
  #8B7355 50%,
  #6B5B45 100%
);
```

---

## Six-Component Prompt Architecture

Every prompt follows this structure to maximize Nano Banana Pro's reasoning capabilities:

### 1. SCENE LOGIC
**Purpose:** Tell the model WHY the scene exists and what viewers should understand

```
[SCENE LOGIC]
This image opens an Instagram story about [topic].
The viewer should immediately feel [emotion] and understand [key concept].
The scene depicts [historical/archaeological context].
```

### 2. SUBJECT
**Purpose:** Define the primary visual focus with archaeological accuracy

```
[SUBJECT]
Primary: [Main subject with specific details]
Secondary: [Supporting elements]
Historical accuracy: [Period, materials, techniques to show]
```

### 3. COMPOSITION
**Purpose:** Specify framing, depth, and visual hierarchy

```
[COMPOSITION]
Format: 9:16 portrait (1080x1920px Instagram Story)
Framing: [Rule of thirds placement, focal point]
Depth: [Foreground, midground, background elements]
Negative space: [Where text will be placed]
```

### 4. LIGHTING
**Purpose:** Create mood and ensure text readability

```
[LIGHTING]
Primary source: [Direction and quality]
Color temperature: [Warm Jerusalem tones]
Shadows: [Soft/hard, direction]
Atmosphere: [Dust, haze, golden hour effects]
```

### 5. TEXT INTEGRATION
**Purpose:** Specify exact text rendering requirements

```
[TEXT]
Content: "[Exact text to render]"
Position: [Top/middle/bottom third]
Typography:
  - Font style: [Sans-serif modern / Serif elegant]
  - Size: [Headline/body/caption]
  - Color: [Hex code]
  - Background: [Gradient overlay / solid bar / none]
  - Alignment: [Left/center/right]
```

### 6. CONSTRAINTS
**Purpose:** Prevent common AI generation failures

```
[CONSTRAINTS]
AVOID:
- [Specific failure modes to prevent]
- [Unwanted aesthetics]
- [Technical issues]

ENSURE:
- [Required qualities]
- [Brand compliance checks]
```

---

## Slide Type Templates

### Template 1: Hook Slide

```yaml
Purpose: Stop the scroll, create curiosity
Visual Style: High-impact, mysterious, dramatic
Text Position: Lower third with gradient overlay
```

**Prompt Template:**

```
[SCENE LOGIC]
This opening hook slide must immediately arrest attention. The viewer scrolling
through Instagram stories should stop because something feels mysterious,
significant, or unresolved. The image suggests a revelation about [topic]
without giving away the answer.

[SUBJECT]
Primary: [Archaeological subject shrouded in mystery]
- Partial visibility (emerging from shadow/earth/time)
- Signs of age and authenticity (patina, wear, excavation context)
- Scale indicators for dramatic effect

Secondary: Context elements suggesting discovery
- Excavation tools, measuring equipment, or hands (carefully rendered)
- Jerusalem stone environment
- Dust particles catching light

[COMPOSITION]
Format: 9:16 portrait (1080x1920px)
Framing: Subject positioned in upper-middle third
Focal point: The mysterious element drawing questions
Depth:
  - Foreground: Subtle blur, archaeological context
  - Midground: Sharp focus on subject
  - Background: Atmospheric Jerusalem stone walls
Negative space: Lower 40% reserved for text overlay

[LIGHTING]
Primary: Dramatic side lighting from upper left
Color temperature: Warm golden (3200K equivalent)
Key light intensity: High contrast, 4:1 ratio
Fill: Minimal, preserving mystery in shadows
Practical lights: Optional torch/lamp glow
Atmosphere: Visible dust motes in light beams

[TEXT]
Content: "[HOOK TEXT FROM ORCHESTRATOR - 30-40 words]"
Position: Lower third (bottom 35% of frame)
Typography:
  - Primary headline: Sans-serif bold, white (#FFFFFF)
  - Size: Large (fills 60% of text area width)
  - Line spacing: 1.3
  - Background: Gradient overlay from transparent to 70% black
  - Text shadow: Subtle, 2px offset, 50% black
  - Alignment: Left-aligned with 48px margin

[CONSTRAINTS]
AVOID:
- Fully visible subject (maintain mystery)
- Cool color temperatures (no blue/green tint)
- Flat lighting (preserve drama)
- Stock photography aesthetic (avoid over-polished look)
- Readable text on subject (keep visual focus clean)
- Modern elements visible (no watches, phones, logos)
- Waxy or plastic skin textures on any human elements
- Anatomically incorrect hands (if hands are present)

ENSURE:
- Jerusalem stone palette dominates (#F5F0E8, #D4C4A8, #B8A27A)
- Text is fully legible against background
- Aspect ratio exactly 9:16
- Subject creates genuine curiosity
- Archaeological authenticity in all details
```

---

### Template 2: Setup Slide

```yaml
Purpose: Establish context, build anticipation
Visual Style: Educational, scene-setting, authoritative
Text Position: Lower third or upper third based on composition
```

**Prompt Template:**

```
[SCENE LOGIC]
This setup slide provides historical context for the story. The viewer should
feel they're learning something significant—being let in on knowledge that
matters. The image educates while building anticipation for the evidence
to come. Topic: [topic context].

[SUBJECT]
Primary: [Contextual scene or establishing shot]
- Wide enough to show environment
- Historical accuracy in architecture/artifacts
- Educational visual elements (maps, diagrams, reconstructions)

Secondary: Supporting context
- Period-accurate environmental details
- Scale references for understanding
- Subtle indicators of location/time period

[COMPOSITION]
Format: 9:16 portrait (1080x1920px)
Framing: Wider establishing shot
Focal point: Center of educational interest
Depth:
  - Foreground: Framing elements (archways, vegetation)
  - Midground: Primary subject/scene
  - Background: Jerusalem landscape or archaeological site
Negative space: Text area (top or bottom 35%)

[LIGHTING]
Primary: Natural daylight, golden hour preferred
Color temperature: Warm (3500K equivalent)
Quality: Soft, diffused, educational clarity
Fill: Adequate to see all important details
Atmosphere: Light haze suggesting ancient atmosphere

[TEXT]
Content: "[SETUP TEXT FROM ORCHESTRATOR - 30-40 words]"
Position: [Top or bottom third based on subject]
Typography:
  - Primary text: Sans-serif medium weight, white (#FFFFFF)
  - Secondary text: Same font, lighter weight, cream (#F5F0E8)
  - Size: Medium (comfortable reading)
  - Line spacing: 1.4
  - Background: Semi-transparent dark overlay (60% opacity)
  - Alignment: Left-aligned with 48px margin

[CONSTRAINTS]
AVOID:
- Cluttered compositions (educational ≠ busy)
- Anachronistic elements
- Tourist photography aesthetic
- Harsh shadows obscuring important details
- Cool color cast
- Text competing with complex visual areas

ENSURE:
- Clear educational value visible
- Jerusalem stone palette present
- Text fully legible
- Establishes "where and when" clearly
- Builds toward evidence reveal
```

---

### Template 3: TMS Bridge Slide

```yaml
Purpose: Connect to TMS value proposition
Visual Style: Authoritative, insider access, premium feel
Text Position: Centered or lower third
```

**Prompt Template:**

```
[SCENE LOGIC]
This critical bridge slide connects the archaeological content to TMS value.
The viewer should feel they're receiving insider access—knowledge and
perspectives available through TMS membership. The image conveys authority
and exclusive understanding of [topic].

[SUBJECT]
Primary: [Evidence or insight that TMS provides access to]
- Detailed view suggesting expert analysis
- Documentation, research, or exclusive access implied
- Professional archaeological context

Secondary: TMS value indicators
- Research materials, documentation visible
- Expert perspective suggested
- Premium, professional environment

[COMPOSITION]
Format: 9:16 portrait (1080x1920px)
Framing: Intimate, detail-oriented
Focal point: The insight or evidence
Depth:
  - Foreground: Subtle TMS documentation hints
  - Midground: Primary subject in sharp focus
  - Background: Soft, authoritative setting
Negative space: Centered or lower text area

[LIGHTING]
Primary: Warm, confident lighting
Color temperature: Golden warm (3200K)
Quality: Professional, suggests expertise
Shadows: Soft, welcoming but authoritative
Accent lighting: Subtle rim light on key elements

[TEXT]
Content: "[TMS BRIDGE TEXT FROM ORCHESTRATOR - 30-40 words]"
Position: Lower third or centered
Typography:
  - Primary text: Sans-serif, confident weight, white (#FFFFFF)
  - TMS references: Subtle gold accent (#B8A27A) optional
  - Size: Medium-large
  - Line spacing: 1.3
  - Background: Premium gradient overlay
  - Alignment: Center or left with 48px margin

[CONSTRAINTS]
AVOID:
- Hard selling aesthetic (no "BUY NOW" feeling)
- Generic stock photography
- Disconnection from archaeological content
- Overly promotional appearance
- Cool colors breaking warm palette

ENSURE:
- TMS value feels organic, not forced
- Authority and expertise conveyed
- Seamless flow from setup slide
- Text references TMS naturally
- Premium but accessible feeling
```

---

### Template 4: Evidence Slide

```yaml
Purpose: Deliver the payload, satisfy curiosity
Visual Style: Detailed, proof-focused, revelatory
Text Position: Lower third with room for detail viewing
```

**Prompt Template:**

```
[SCENE LOGIC]
This evidence slide delivers the revelation. The viewer's curiosity built
through slides 1-3 is now satisfied with concrete proof. The image shows
the specific archaeological evidence for [topic], with enough detail to
be convincing and awe-inspiring.

[SUBJECT]
Primary: [The specific evidence/artifact/site]
- Maximum detail and clarity
- Archaeological authenticity unmistakable
- Scale clear (include reference if helpful)

Secondary: Proof indicators
- Visible dating clues
- Archaeological context preserved
- Expert documentation visible

[COMPOSITION]
Format: 9:16 portrait (1080x1920px)
Framing: Close-up or detail shot
Focal point: The evidence itself
Depth:
  - Foreground: None or minimal
  - Midground: Evidence in perfect focus
  - Background: Soft archaeological context
Negative space: Lower 30% for text

[LIGHTING]
Primary: Revealing, documentary-style
Color temperature: Accurate for artifact (3400K base)
Quality: Sharp, detailed, professional
Shadows: Minimal, show all details
Special: Raking light to reveal texture/inscriptions

[TEXT]
Content: "[EVIDENCE TEXT FROM ORCHESTRATOR - 30-40 words]"
Position: Lower third only
Typography:
  - Primary text: Sans-serif, clear, white (#FFFFFF)
  - Size: Medium (don't compete with evidence)
  - Line spacing: 1.4
  - Background: Gradient overlay from transparent to 70% black
  - Alignment: Left with 48px margin

[CONSTRAINTS]
AVOID:
- Obscuring important evidence details
- Ambiguous scale
- Poor focus on key elements
- Shadows hiding crucial features
- Text blocking evidence areas
- Over-processing that reduces authenticity
- Cool color shifts

ENSURE:
- Evidence is clearly visible and convincing
- Archaeological accuracy maintained
- Text placement preserves evidence viewing
- "Wow" factor achieved
- Jerusalem stone palette in context
```

---

### Template 5: CTA Slide

```yaml
Purpose: Convert interest to action
Visual Style: Warm, inviting, community-focused
Text Position: Centered with clear visual hierarchy
```

**Prompt Template:**

```
[SCENE LOGIC]
This final slide converts built interest into action. The viewer should feel
invited into a community, motivated to engage, and clear on what to do next.
The image is warm, welcoming, and suggests ongoing relationship rather than
transaction.

[SUBJECT]
Primary: [Warm, inviting scene suggesting community/continuation]
- Human connection implied (carefully rendered if people shown)
- Ongoing journey suggested
- TMS community/value subtly present

Secondary: Future promise
- More to discover implied
- Community belonging suggested
- Welcome and inclusion

[COMPOSITION]
Format: 9:16 portrait (1080x1920px)
Framing: Open, inviting, welcoming
Focal point: Center, drawing viewer in
Depth:
  - All layers soft and welcoming
  - No harsh separations
  - Unified, community feeling
Negative space: Centered large text area

[LIGHTING]
Primary: Warm, golden, embracing
Color temperature: Very warm (3000K)
Quality: Soft, glowing, hopeful
Shadows: Minimal, warm-toned
Atmosphere: Golden hour, promising

[TEXT]
Content: "[CTA TEXT FROM ORCHESTRATOR - 30-40 words]"
Position: Centered, prominent
Typography:
  - CTA headline: Sans-serif bold, white (#FFFFFF)
  - Supporting text: Lighter weight, cream (#F5F0E8)
  - Size: Large and clear
  - Line spacing: 1.3
  - Background: Warm gradient overlay
  - Alignment: Center

Visual CTA elements:
  - Follow button suggestion if applicable
  - Swipe up indicator if applicable
  - Link reference if applicable

[CONSTRAINTS]
AVOID:
- Hard selling or pushy aesthetic
- Cold or transactional feeling
- Isolated or exclusive imagery
- Abrupt ending feeling
- Cool colors or harsh lighting
- Poorly rendered human figures

ENSURE:
- Warm, inviting atmosphere
- Clear call to action
- Community feeling conveyed
- Jerusalem stone palette warm tones
- Satisfying conclusion to story arc
- Professional but accessible
```

---

## Typography Specifications

### Font Hierarchy

```yaml
Headlines:
  Style: Modern sans-serif (Inter, SF Pro, or system equivalent)
  Weight: Bold (700)
  Size: 48-64px equivalent
  Line height: 1.2
  Letter spacing: -0.02em

Body Text:
  Style: Same font family
  Weight: Regular (400) to Medium (500)
  Size: 28-36px equivalent
  Line height: 1.4
  Letter spacing: 0

Captions:
  Style: Same font family
  Weight: Regular (400)
  Size: 22-26px equivalent
  Line height: 1.3
  Letter spacing: 0.01em

Accent Text:
  Style: Same font family
  Weight: Semibold (600)
  Size: Match context
  Color: Ancient Gold (#B8A27A)
```

### Text Rendering Requirements

For Nano Banana Pro to render text correctly:

1. **Specify exact text in quotes**
   ```
   Content: "This is the exact text to render"
   ```

2. **Define clear boundaries**
   ```
   Text area: Lower 35% of frame
   Margins: 48px horizontal, 64px from bottom
   ```

3. **Specify contrast requirements**
   ```
   Minimum contrast: 4.5:1 against background
   Background treatment: Gradient overlay required
   ```

4. **Handle multi-line text**
   ```
   Maximum lines: 4-5 for readability
   Break preference: Natural phrase breaks
   Orphan prevention: Minimum 3 words on final line
   ```

---

## Failure Mode Prevention

### Common AI Image Generation Failures

#### 1. Text Rendering Errors

**Problem:** Misspelled, garbled, or missing text

**Prevention:**
```
[TEXT CONSTRAINTS]
- Render text EXACTLY as provided in quotes
- Use clear, standard letterforms only
- No decorative or script fonts that may corrupt
- Verify each word is complete and legible
- Background must provide adequate contrast
```

#### 2. Waxy/Plastic Surfaces

**Problem:** Skin or surfaces appear artificial

**Prevention:**
```
[SURFACE CONSTRAINTS]
- Natural material textures: stone, pottery, leather
- Realistic weathering and patina
- Avoid excessive smoothing or perfection
- Include micro-texture variation
- Natural color variation in surfaces
```

#### 3. Hand Anatomy Errors

**Problem:** Incorrect finger count, joint positions

**Prevention:**
```
[HUMAN ELEMENT CONSTRAINTS]
- If hands required: show partial or obscured
- Prefer archaeological close-ups without hands
- If hands visible: verify 5 fingers, natural positions
- Alternative: gloved hands, tool-holding poses
```

#### 4. Cool Color Cast

**Problem:** Blue/green tint breaking warm palette

**Prevention:**
```
[COLOR CONSTRAINTS]
- Dominant palette: Jerusalem stone (#F5F0E8, #D4C4A8, #B8A27A)
- No blue sky dominating composition
- Warm shadows (brown, not gray)
- Golden hour warmth throughout
- No cool fluorescent lighting
```

#### 5. Stock Photography Aesthetic

**Problem:** Over-polished, generic, commercial feeling

**Prevention:**
```
[AUTHENTICITY CONSTRAINTS]
- Archaeological documentary aesthetic
- Natural imperfections welcome
- Avoid commercial perfection
- Real excavation/site feeling
- Expert perspective, not tourist view
```

#### 6. Anachronistic Elements

**Problem:** Modern items visible in historical scenes

**Prevention:**
```
[HISTORICAL CONSTRAINTS]
- No visible modern technology
- Period-accurate clothing if people shown
- No contemporary logos or branding
- Archaeological tools may be modern but subtle
- No obviously 21st-century elements
```

---

## Quality Verification Criteria

### Before Accepting Generated Image:

#### Text Quality
- [ ] All text spelled correctly
- [ ] Text fully legible at story size
- [ ] Adequate contrast with background
- [ ] Proper line breaks and spacing
- [ ] No cut-off or partial words

#### Color Compliance
- [ ] Jerusalem stone palette dominant
- [ ] No cool color cast
- [ ] Warm tones consistent
- [ ] Brand colors accurate to hex values

#### Composition
- [ ] 9:16 aspect ratio correct
- [ ] Subject properly placed
- [ ] Text areas clear
- [ ] Visual hierarchy effective
- [ ] No awkward cropping

#### Archaeological Accuracy
- [ ] Period-appropriate elements
- [ ] No anachronisms visible
- [ ] Authentic material representation
- [ ] Scale indicators appropriate

#### Technical Quality
- [ ] Sharp focus on subject
- [ ] Appropriate depth of field
- [ ] No compression artifacts
- [ ] Resolution sufficient for Instagram

#### Human Elements (if present)
- [ ] Anatomically correct hands
- [ ] Natural skin textures
- [ ] Appropriate positioning
- [ ] Period-correct if historical

---

## Complete Prompt Example

### Input from Orchestrator:

```yaml
slide: 4
type: evidence
text: |
  Archaeologists confirmed: the pool matches John's description exactly.
  Ritual purification steps. Second Temple period construction.
  The very place where a blind man received sight—proven real.
visual_brief: |
  Close-up of ancient carved steps with water,
  archaeological detail visible. Golden hour lighting.
emotional_target: wonder
```

### Generated Prompt:

```
[SCENE LOGIC]
This evidence slide reveals the Pool of Siloam archaeological discovery.
The viewer should experience wonder and conviction—seeing physical proof
of a location described in John 9. The image shows the actual excavated
steps where ritual purification occurred during the Second Temple period.

[SUBJECT]
Primary: Ancient limestone steps descending into water
- Visible chisel marks from 1st-century construction
- Accumulated patina of 2,000 years
- Partially water-filled lower steps
- Clear ritual purification architecture

Secondary: Archaeological context
- Excavation edges visible but not dominant
- Measuring scale subtle if included
- Jerusalem stone walls in background

[COMPOSITION]
Format: 9:16 portrait (1080x1920px)
Framing: Diagonal descent of steps, upper-left to lower-right
Focal point: The water meeting the ancient steps
Depth:
  - Foreground: Upper dry steps, sharp detail
  - Midground: Water line, perfect focus
  - Background: Soft stone walls, Jerusalem atmosphere
Negative space: Lower 30% clear for text overlay

[LIGHTING]
Primary: Golden hour sunlight from upper right
Color temperature: 3200K warm golden
Quality: Raking light across steps to show texture
Shadows: Long, warm, emphasizing carved details
Atmosphere: Light dust motes, late afternoon Jerusalem glow
Water: Gentle reflection of golden light

[TEXT]
Content: "Archaeologists confirmed: the pool matches John's description exactly.
Ritual purification steps. Second Temple period construction.
The very place where a blind man received sight—proven real."
Position: Lower third (bottom 30%)
Typography:
  - Font: Modern sans-serif, medium-bold weight
  - Primary lines: White (#FFFFFF)
  - Final line (—proven real): Slight emphasis, same white
  - Size: Medium (comfortable reading, ~32px equivalent)
  - Line spacing: 1.4
  - Background: Gradient from transparent at top to 70% black at bottom
  - Alignment: Left-aligned with 48px margin
  - Bottom margin: 64px

[CONSTRAINTS]
AVOID:
- Modern elements (no railings, signs, tourists)
- Cool color temperature (no blue water reflection)
- Flat lighting (need texture visibility)
- Stock photography polish (keep documentary feel)
- Overcrowded frame (let steps breathe)
- Text overlapping important step details
- Sharp shadows that obscure carved features
- Generic ancient stairs (must be specific Pool of Siloam architecture)

ENSURE:
- Jerusalem stone palette (#F5F0E8, #D4C4A8, #B8A27A)
- Water has warm reflection, not blue
- Steps show clear ritual purification design (wide, gradual descent)
- Archaeological authenticity unmistakable
- Text fully legible with high contrast
- Wonder and proof conveyed simultaneously
- Second Temple period construction visible
- Golden hour warmth throughout image
```

---

## Integration Workflow

### Receiving Input

The Image Generation Agent receives from the Orchestrator:

```yaml
Input Package:
  story_id: [unique identifier]
  slide_number: [1-5]
  slide_type: [hook/setup/bridge/evidence/cta]
  text_copy: "[exact text to render]"
  visual_brief: "[description from orchestrator]"
  emotional_target: [curiosity/anticipation/trust/wonder/motivation]
  topic: [archaeological topic]
  tms_value: [if bridge slide, specific TMS reference]
```

### Processing Steps

1. **Select Template** based on slide_type
2. **Integrate Text** from text_copy into [TEXT] component
3. **Develop Subject** from visual_brief and topic
4. **Apply Brand Colors** using Jerusalem Stone palette
5. **Add Constraints** for failure prevention
6. **Compile Complete Prompt** in six-component format

### Output Format

```yaml
Output Package:
  story_id: [matching input]
  slide_number: [matching input]
  prompt: |
    [Complete six-component prompt]

  generation_settings:
    aspect_ratio: "9:16"
    resolution: "1080x1920"
    style_reference: "archaeological documentary"
    color_profile: "Jerusalem Stone Warm"

  quality_checklist:
    text_specified: true
    palette_encoded: true
    constraints_included: true
    template_applied: [template name]

  verification_notes: |
    [Any specific items to verify after generation]
```

---

## Nano Banana Pro Optimization

### Model Capabilities to Leverage

1. **Reasoning Engine**
   - Include [SCENE LOGIC] to guide internal planning
   - Explain WHY before WHAT
   - Provide context that helps decision-making

2. **Symbol-Aware Tokenization**
   - Text rendering is a strength
   - Specify exact quotes for best results
   - Keep text simple and clear

3. **Physics Simulation**
   - Water reflections can be accurate
   - Light behavior will be natural
   - Material properties will be realistic

4. **Long Context Understanding**
   - Complete prompts are processed well
   - All six components work together
   - Constraints are respected

### Model Limitations to Mitigate

1. **Complex Hand Positions**
   - Avoid or obscure when possible
   - Use gloves or tools if hands needed
   - Verify carefully if included

2. **Very Long Text Blocks**
   - Keep to 4-5 lines maximum
   - Simple letterforms only
   - High contrast essential

3. **Multiple Distinct Subjects**
   - Keep compositions focused
   - One primary subject per image
   - Avoid complex multi-figure scenes

---

## Versioning and Updates

### Current Version
- **Version:** 1.0.0
- **Target Model:** Nano Banana Pro (Gemini 3.0 Image)
- **Last Updated:** 2024

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial agent specification |

### Update Protocol

When Nano Banana Pro is updated or new capabilities are announced:

1. Review new model documentation
2. Test existing prompts for compatibility
3. Optimize for new features
4. Update failure prevention as needed
5. Version increment with changelog

---

## Related Documents

- IG Stories Orchestrator Agent (upstream)
- TMS Brand Guidelines
- Jerusalem Stone Palette Reference
- Nano Banana Pro Model Documentation
- Instagram Story Technical Specifications
