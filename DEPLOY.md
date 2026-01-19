# Deploy TMS Marketing API

Generate Instagram Story images from your Android phone, anywhere, anytime.

## Quick Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

Make sure your code is pushed to GitHub (it already is if you're reading this).

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your **TMS-Visual-Studio** repository
4. **Important:** Add your environment variable:
   - Click **"Environment Variables"**
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyBwg2e-JZig39cv5Peo9Q_jc2ikxtw0rik`
5. Click **"Deploy"**

Your API will be live at: `https://your-project.vercel.app`

### Step 3: Test It

Open in any browser:
```
https://your-project.vercel.app/api/generate?topic=Pool+of+Siloam&format=image
```

---

## Android Setup

### Option A: HTTP Shortcuts App (Recommended)

**HTTP Shortcuts** is a free app that lets you create home screen shortcuts for API calls.

1. **Install** [HTTP Shortcuts](https://play.google.com/store/apps/details?id=ch.rmy.android.http_shortcuts) from Play Store

2. **Create a new shortcut:**
   - Tap **+** → **Regular Shortcut**
   - Name: "Generate TMS Image"
   - Method: **GET**
   - URL: `https://your-project.vercel.app/api/generate`

3. **Add parameters:**
   - Tap **Parameters** → **+**
   - Key: `topic` | Value: `{$prompt:Topic:text}`
   - Key: `type` | Value: `hook` (or make it a variable)
   - Key: `format` | Value: `image`

4. **Configure response handling:**
   - Tap **Response** → **Save to file**
   - Filename: `tms_{$timestamp}.png`
   - Save to: Downloads or Pictures folder

5. **Add to home screen:**
   - Long-press the shortcut → **Add to home screen**

**Now just tap the icon, enter a topic, and the image saves to your phone!**

### Option B: Tasker + HTTP Request

If you use Tasker:

1. **Create a Task:**
   - **Action 1:** Variable Set `%topic` to `%par1`
   - **Action 2:** HTTP Request
     - Method: GET
     - URL: `https://your-project.vercel.app/api/generate?topic=%topic&format=image`
     - Output File: `/storage/emulated/0/DCIM/TMS/%topic.png`
   - **Action 3:** Flash `Image saved!`

2. **Create a shortcut or widget to trigger it**

### Option C: Simple Browser Bookmark

1. Open Chrome on your Android
2. Go to: `https://your-project.vercel.app/api/generate?topic=Pool+of+Siloam&format=image`
3. Long-press the image → **Download image**
4. **Bookmark the page** for quick access
5. Edit the bookmark and change `Pool+of+Siloam` to your desired topic

---

## API Endpoints

Your deployed API has these endpoints:

### Generate Single Slide
```
GET /api/generate?topic=YOUR_TOPIC&type=hook&format=image
```

| Parameter | Default | Options |
|-----------|---------|---------|
| `topic` | "Ancient Jerusalem Discovery" | Any text |
| `type` | "hook" | hook, setup, tms_bridge, evidence, cta |
| `format` | "json" | json, image |
| `text` | (auto-generated) | Custom slide text |

### Generate Full Story
```
POST /api/story
Body: { "topic": "Pool of Siloam" }
```

Returns all 5 slides with base64 images.

---

## Example URLs

**Hook slide (image):**
```
https://your-project.vercel.app/api/generate?topic=Pool+of+Siloam&type=hook&format=image
```

**Setup slide (image):**
```
https://your-project.vercel.app/api/generate?topic=Dead+Sea+Scrolls&type=setup&format=image
```

**Evidence slide (JSON with base64):**
```
https://your-project.vercel.app/api/generate?topic=Temple+Mount&type=evidence
```

---

## Slide Types Quick Reference

| Type | Use For | Emotion |
|------|---------|---------|
| `hook` | Opening attention-grabber | Curiosity |
| `setup` | Historical context | Anticipation |
| `tms_bridge` | TMS value connection | Trust |
| `evidence` | Proof/revelation | Wonder |
| `cta` | Call to action | Motivation |

---

## Troubleshooting

### "API key not configured"
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Make sure `GEMINI_API_KEY` is set

### "Generation failed" / Timeout
- Vercel free tier has 10-second timeout for hobby, 60s for pro
- The vercel.json is set for 60s, but you may need Vercel Pro for longer generations
- Try a simpler topic

### Image not downloading on Android
- Make sure you're using `format=image` parameter
- Check Chrome → Settings → Site Settings → Automatic Downloads

### Rate limiting
- Gemini API has rate limits
- Wait a few seconds between generations
- Consider upgrading your Gemini API quota

---

## Custom Text Examples

You can provide custom text for any slide:

```
/api/generate?topic=Pool+of+Siloam&type=hook&text=Archaeologists+just+found+something+incredible
```

Or via POST:
```bash
curl -X POST https://your-project.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Pool of Siloam",
    "type": "hook",
    "text": "Your custom 30-40 word text here..."
  }'
```

---

## Costs

- **Vercel:** Free tier includes 100GB bandwidth, plenty for personal use
- **Gemini API:** Free tier has generous limits; pay-as-you-go after

---

## Security Note

Your API key is stored securely in Vercel's environment variables. The deployed API is public, so anyone with the URL can generate images. If you want to restrict access:

1. Add an `API_SECRET` environment variable
2. Require it in requests: `/api/generate?secret=YOUR_SECRET&topic=...`
3. Keep the secret private

Let me know if you want me to add authentication!
