# save_still_url + grok_video fix (no IF)

`grok_video` failed because `image.url` was **null**. Add `save_still_url` between the Imagine still and the video node.

```text
grok_imagine_reel_still → save_still_url → grok_video
```

---

## Node — `save_still_url`

**Node type:** Code

| Parameter | Value |
|---|---|
| Node name | `save_still_url` |
| Language | JavaScript |
| Mode | Run Once for Each Item |

**Code — paste entire file:**  
https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/n8n-save-still-url.js

**Wire:**
- Before: `grok_imagine_reel_still`
- After: `grok_video` (or `grok_video_start`)

**Test:** `reel_still_url` starts with `https://`

---

## Edit — `grok_video` (or `grok_video_start`)

Keep URL `POST https://api.x.ai/v1/videos/generations`.  
Body (fx ON) — entire JSON.stringify. **Do not** leave `"url": {{ $json.reel_still_url }}` unquoted (that becomes `null`).

```text
{{ JSON.stringify({
  model: 'grok-imagine-video-1.5',
  prompt: String($json.video_prompt || $json.video_motion_prompt || 'Animate this photoreal still. Keep product identity. No people, no needles, no new text.'),
  image: { url: String($('save_still_url').item.json.reel_still_url) },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '1080p'
}) }}
```

**Test:** Request JSON shows `"url":"https://..."` not `"url":null`.
