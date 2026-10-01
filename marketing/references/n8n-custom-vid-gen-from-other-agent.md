# Reference — other agent’s n8n canvas (`custom_vid_gen1.5-idea-to-video-pbv-log`)

Saved 2026-08-13 from the other Cursor agent working in this same repo.

| Item | Value |
|---|---|
| Agent | **custom vid_gen workflow** |
| Agent URL | https://cursor.com/agents/bc-65890aad-1acd-4e10-a29d-f0cbd4f00b73 |
| bcId | `bc-65890aad-1acd-4e10-a29d-f0cbd4f00b73` |
| Branch | `cursor/idea-to-video-nodes-0b73` |
| PR | https://github.com/PalmBeach-Vitality/pep/pull/11 |
| Workflow name | `custom_vid_gen1.5-idea-to-video-pbv-log` |
| Log sheet / tab | `idea-to-video-pbv-log` |

**Keep separate from Pep.** This canvas is Grok Imagine still → Grok Imagine 15s video. It is **not** `vid_gen_palm_beach_pep`. Do **not** copy these node names onto the Pep OmniHuman talking path. Do **not** rename Pep nodes to match this canvas.

Full node-by-node paste (9:16 generated-still path):  
`marketing/references/n8n-custom-vid-gen1.5-idea-to-video-pbv-log.md`

Plan doc:  
`marketing/references/n8n-idea-to-video-grok.md`

Originals on the other branch:  
https://github.com/PalmBeach-Vitality/pep/blob/cursor/idea-to-video-nodes-0b73/marketing/n8n-custom-vid-gen1.5-idea-to-video-pbv-log.md  
https://github.com/PalmBeach-Vitality/pep/blob/cursor/idea-to-video-nodes-0b73/marketing/n8n-idea-to-video-grok.md

---

## What this canvas is

Grok Imagine **image** (`grok-imagine-image-quality`, 2k) then Grok Imagine **video** (`grok-imagine-video-1.5`, 15s, `1080p` string). No OmniHuman. No fal. No Kling. No ElevenLabs TTS. No lipsync.

Default reel aspect is **9:16**. Last live hero run for palmbeach-rx.com used **16:9**. The video API does **not** support `2.35:1`. There is no `imagine-video-2.0` on the API yet.

---

## Exact node names on that canvas

`manual_start` → `idea_input` → `image_gen` → `review_input` → `if_adjust_empty`  
True → `save_still_url`  
False → `adjust_prompt` → `image_refine` → `save_still_url`  
then `grok_video_start` → `wait_video` → `grok_video_poll` → `if_video_ready`  
False loops to `wait_video`. True → `save_video_url` → `sheets_append_run`

Swap-in nodes (existing still / custom motion prompt): `manual_still_url`, `video_prompt_input`.

`prep_grok_video_start` is **extra** on that canvas (from landscape/Pep). Leave it disconnected there.

---

## Last locked live path (after the full 9:16 doc)

Sal’s last correction: do **not** use `save_still_url` on this path.

```text
manual_still_url → video_prompt_input → grok_video_start
  → wait_video → grok_video_poll → if_video_ready
       false → wait_video
       true  → save_video_url → sheets_append_run
```

### `manual_still_url`

| Parameter | Value |
|---|---|
| Node type | Edit Fields (Set) |
| Exact name | `manual_still_url` |
| Mode | Manual Mapping |
| Include Other Input Fields | **ON** |
| Keep Only Set Fields | **OFF** |
| Field Name | `manual_still_url` |
| Type | String |
| Value | full `https://...` image URL (Fixed, fx OFF) |

### `video_prompt_input`

| Parameter | Value |
|---|---|
| Node type | Edit Fields (Set) |
| Exact name | `video_prompt_input` |
| Mode | Manual Mapping |
| Include Other Input Fields | **ON** |
| Field Name | `video_prompt` |
| Type | String |
| Value | paste motion prompt (Fixed) |

### `grok_video_start` (hero — last locked)

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `grok_video_start` |
| Method | `POST` |
| URL | `https://api.x.ai/v1/videos/generations` |
| Authentication | xAI Header Auth |
| Send Body | **ON** |
| Body Content Type | **JSON** |
| Specify Body | **Using Fields** |
| Options → Timeout | `300000` |

| Name | Value | fx |
|---|---|---|
| `model` | `grok-imagine-video-1.5` | OFF |
| `prompt` | `{{ $('video_prompt_input').item.json.video_prompt }}` | **ON** |
| `image` | `{{ ({ url: $('manual_still_url').item.json.manual_still_url }) }}` | **ON** |
| `duration` | `15` | OFF |
| `aspect_ratio` | `16:9` | OFF |
| `resolution` | `1080p` | OFF |

Send Body stays **ON**. `video_prompt_input` only stores text; it does not call xAI.

### `grok_video_poll`

Method **GET**, Send Body **OFF**. URL must be **one** expression (do not split host vs id):

```text
={{ 'https://api.x.ai/v1/videos/' + String($('grok_video_start').item.json.request_id || '') }}
```

Poll until `$json.status` **is equal to** `done` (not `COMPLETED`). Wait amount `60` seconds on `wait_video`.

---

## House conventions from that agent (useful if we ever reuse Grok video HTTP)

- Resolution is the string `'1080p'`, not the number `1080`.
- Image HTTP: `POST https://api.x.ai/v1/images/generations` · model `grok-imagine-image-quality` · `resolution: '2k'` · `n: 1`.
- `idea_input` must be Manual Mapping String. JSON Output failed on multiline `"idea"` (`jsonOutput` expects an object).
- Grok HTTP bodies that use `JSON.stringify` often fail on that canvas; JSON **Using Fields** is the working hero form.
- Do **not** Execute `image_gen` alone with no pinned/upstream data.

---

## Last accepted hero clip

`https://vidgen.x.ai/xai-vidgen-bucket/xai-video-a60e5616-9289-933a-a123-3729018d2a3c.mp4`

Earlier industrial clip:  
`https://vidgen.x.ai/xai-vidgen-bucket/xai-video-d74e3cb2-0ea5-9494-8bb3-d835fe755766.mp4`

Last sunrise prompt (one sun, rising only) for `video_prompt_input`:

```text
Animate this exact beach still into a calm cinematic sunrise. CRITICAL: only ONE sun in the entire video — the single sun on the horizon rising slowly upward. Do not add a second sun. Do not show a sun setting, descending, or moving downward. Remove any duplicate sun or sunset orb. Keep composition locked: white sand, calm ocean, palm tree on the right, one sun low behind the fronds rising gently. Golden light intensifies as that one sun rises; ocean reflection is from that single sun only. Soft palm sway, tiny shore ripples, slow cloud drift. No people, no text, no logos. Subtle push-in, photoreal, serene luxury coastal morning.
```

---

## Log CSV

Other-agent sheet:  
https://github.com/PalmBeach-Vitality/pep/blob/cursor/idea-to-video-nodes-0b73/marketing/sheets/idea-to-video-pbv-log.csv  
https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/idea-to-video-nodes-0b73/marketing/sheets/idea-to-video-pbv-log.csv
