# TMS Marketing API

Generate Instagram Story images from any device - your phone, tablet, or computer.

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Start the API server
npm run api
```

Server runs at `http://localhost:3001`

## Endpoints

### GET `/quick` - Quick Generate

Generate an image with minimal parameters. Perfect for phone shortcuts.

**Parameters:**
| Param | Default | Description |
|-------|---------|-------------|
| `topic` | "Ancient Jerusalem Discovery" | The archaeological topic |
| `type` | "hook" | Slide type: hook, setup, tms_bridge, evidence, cta |
| `format` | "json" | Response format: "json" or "image" |

**Example:**
```
http://localhost:3001/quick?topic=Pool+of+Siloam&type=hook&format=image
```

### POST `/slide` - Custom Slide

Generate a slide with full control over text and visuals.

**Body:**
```json
{
  "topic": "Pool of Siloam",
  "slideType": "hook",
  "text": "Your custom text here (30-40 words)",
  "visualBrief": "Description of the visual scene"
}
```

### POST `/story` - Full 5-Slide Story

Generate all 5 slides for a complete story.

**Body:**
```json
{
  "topic": "Pool of Siloam",
  "hookText": "Custom hook text...",
  "setupText": "Custom setup text...",
  "bridgeText": "Custom bridge text...",
  "evidenceText": "Custom evidence text...",
  "ctaText": "Custom CTA text..."
}
```

---

## Phone Setup

### Accessing from Your Phone

1. **Find your computer's local IP:**
   - Mac: System Settings > Network > Wi-Fi > Details > IP Address
   - Windows: `ipconfig` in Command Prompt, look for IPv4
   - Usually looks like `192.168.1.xxx`

2. **Make sure both devices are on the same WiFi**

3. **Access the API:**
   ```
   http://192.168.1.xxx:3001/quick?topic=Your+Topic
   ```

---

## iOS Shortcuts Setup

### Shortcut 1: Quick Image Generator

1. Open **Shortcuts** app
2. Tap **+** to create new shortcut
3. Add these actions:

**Action 1: Ask for Input**
- Type: Text
- Prompt: "Enter topic"

**Action 2: URL**
```
http://YOUR_COMPUTER_IP:3001/quick?topic=[Provided Input]&format=image
```

**Action 3: Get Contents of URL**
- Method: GET

**Action 4: Save to Photo Album**

**Action 5: Show Result**

### Shortcut 2: Generate Full Story

1. Create new shortcut
2. Add action: **Ask for Input** (Text, "Enter topic")
3. Add action: **URL**
   ```
   http://YOUR_COMPUTER_IP:3001/story
   ```
4. Add action: **Get Contents of URL**
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Request Body: JSON
   ```json
   {"topic": "[Provided Input]"}
   ```
5. Add action: **Get Dictionary from Input**
6. Add action: **Repeat with Each** (slides array)
   - Get dictionary value for "image"
   - Base64 Decode
   - Save to Photo Album
7. Add action: **Show Notification** "Story generated!"

---

## Android Tasker Setup

### Task: Generate TMS Image

1. **HTTP Request**
   - Method: GET
   - URL: `http://YOUR_COMPUTER_IP:3001/quick?topic=%par1&format=image`
   - Output File: `/storage/emulated/0/DCIM/tms_image.png`

2. **Flash** "Image saved!"

### Scene: Topic Input

Create a simple scene with a text field and button that runs the task.

---

## Remote Access (Outside Home Network)

To access from anywhere, you have options:

### Option A: ngrok (Easiest)

```bash
# Install ngrok
npm install -g ngrok

# Start your API
npm run api

# In another terminal, expose it
ngrok http 3001
```

You'll get a URL like `https://abc123.ngrok.io` - use this in your phone shortcuts.

### Option B: Tailscale (More Secure)

1. Install Tailscale on computer and phone
2. Access via Tailscale IP: `http://100.x.x.x:3001`

### Option C: Deploy to Cloud

Deploy to Vercel, Railway, or Render for 24/7 access.

---

## Testing

**Quick test from terminal:**
```bash
# Health check
curl http://localhost:3001/

# Generate image (returns JSON with base64)
curl "http://localhost:3001/quick?topic=Pool+of+Siloam"

# Get raw image
curl "http://localhost:3001/quick?topic=Pool+of+Siloam&format=image" > test.png
```

**Test full story:**
```bash
curl -X POST http://localhost:3001/story \
  -H "Content-Type: application/json" \
  -d '{"topic": "Pool of Siloam"}'
```

---

## Slide Types

| Type | Purpose | Default Emotion |
|------|---------|-----------------|
| `hook` | Stop the scroll, create mystery | Curiosity |
| `setup` | Establish historical context | Anticipation |
| `tms_bridge` | Connect to TMS value | Trust |
| `evidence` | Deliver the proof | Wonder |
| `cta` | Call to action | Motivation |

---

## Troubleshooting

**"Connection refused"**
- Make sure the API is running (`npm run api`)
- Check you're using the right IP address
- Ensure both devices are on the same WiFi

**"No image generated"**
- Check your API key in `.env.local`
- The Gemini API might be rate-limited; wait a moment

**Slow generation**
- Image generation takes 10-30 seconds
- First request may be slower (cold start)
