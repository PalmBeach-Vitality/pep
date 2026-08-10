# custom_vid_gen1.5-idea-to-video-pbv-log

**Workflow name:** `custom_vid_gen1.5-idea-to-video-pbv-log`  
**Branch:** `cursor/idea-to-video-nodes-0b73`  
**Log sheet (exact):** `idea-to-video-pbv-log`

## What it does

1. Paste a detailed image description  
2. Generate a 9:16 / 2k still (`grok-imagine-image-quality`)  
3. Review still → leave `adjust` empty to approve, or fill corrections  
4. IF adjust empty → use first still; else regenerate with corrections  
5. Animate saved still → 15s / 1080p / 9:16 (`grok-imagine-video-1.5`)  
6. Poll until done → save URLs → append row to `idea-to-video-pbv-log`

---

## Full chain

```text
manual_start
  → idea_input
  → image_gen
  → review_input
  → if_adjust_empty
       true  (adjust empty)     → save_still_url ────────────────┐
       false (adjust has text)  → adjust_prompt → image_refine ──┼→ save_still_url
                                                                 → grok_video_start
                                                                 → wait_video
                                                                 → grok_video_poll
                                                                 → if_video_ready
                                                                      false → wait_video
                                                                      true  → save_video_url
                                                                            → sheets_append_run
```

---

## Node 1 — `manual_start`

**Node type:** Manual Trigger

| Parameter | Value |
|---|---|
| Node name | `manual_start` |

**Why:** Starts the workflow when you click Execute.

**Wire:** → `idea_input`

---

## Node 2 — `idea_input`

**Node type:** Edit Fields (Set)

| Parameter | Value |
|---|---|
| Node name | `idea_input` |
| Mode | Manual Mapping |
| Keep Only Set Fields | ON |
| Field Name | `idea` |
| Type | String |
| Value | paste detailed image description (Fixed, fx OFF) |

**Why:** Holds the first prompt for image generation.

**Wire:** `manual_start` → `idea_input`

---

## Node 3 — `image_gen`

**Node type:** HTTP Request

| Parameter | Value |
|---|---|
| Node name | `image_gen` |
| Method | `POST` |
| URL | `https://api.x.ai/v1/images/generations` |
| Authentication | Header Auth (same xAI credential as `GROK_Imagine`) |
| Send Headers | ON |
| Header | `Content-Type` = `application/json` |
| Send Body | ON |
| Body Content Type | Raw |
| Content Type | `application/json` |
| Timeout | `300000` |

**Body (fx ON):**

```text
={{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: String($json.idea || $('idea_input').item.json.idea || ''),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

**Why:** Creates the first 9:16 still from your description.

**Wire:** `idea_input` → `image_gen`  
**Test:** output has `data[0].url` — open and review.

---

## Node 4 — `review_input`

**Node type:** Edit Fields (Set)

| Parameter | Value |
|---|---|
| Node name | `review_input` |
| Mode | Manual Mapping |
| Keep Only Set Fields | ON |
| Field Name | `adjust` |
| Type | String |
| Value | leave **empty** to approve; paste corrections to refine (Fixed) |

**Why:** After reviewing the still URL, this field decides the IF path.

**Wire:** `image_gen` → `review_input`

---

## Node 5 — `if_adjust_empty`

**Node type:** IF

| Side | Value |
|---|---|
| Left (field) | `{{ $json.adjust }}` (fx ON) |
| Operator | **is empty** |
| Right | *(none)* |

| Branch | When | Connect to |
|---|---|---|
| **True** | `adjust` empty | `save_still_url` |
| **False** | `adjust` has text | `adjust_prompt` |

**Why:** Empty adjust = use first still. Filled adjust = refine first.

**Wire:** `review_input` → `if_adjust_empty`

---

## Node 6 — `adjust_prompt` (False path only)

**Node type:** Edit Fields (Set)

| Parameter | Value |
|---|---|
| Node name | `adjust_prompt` |
| Mode | Manual Mapping |
| Keep Only Set Fields | ON |
| Field 1 Name | `idea` |
| Field 1 Type | String |
| Field 1 Value | `{{ $('idea_input').item.json.idea }}` (fx ON) |
| Field 2 Name | `adjust` |
| Field 2 Type | String |
| Field 2 Value | `{{ $('review_input').item.json.adjust }}` (fx ON) |
| Field 3 Name | `refine_prompt` |
| Field 3 Type | String |
| Field 3 Value | below (fx ON) |

**`refine_prompt` (fx ON):**

```text
{{ [$('idea_input').item.json.idea, 'CRITICAL CORRECTIONS (must follow):', $('review_input').item.json.adjust].join(' ') }}
```

**Why:** Combines original idea + corrections for the second image call.

**Wire:** `if_adjust_empty` False → `adjust_prompt`

---

## Node 7 — `image_refine` (False path only)

**Node type:** HTTP Request  

Duplicate `image_gen` → rename `image_refine`.

| Parameter | Value |
|---|---|
| Node name | `image_refine` |
| Method | `POST` |
| URL | `https://api.x.ai/v1/images/generations` |
| Authentication | same xAI Header Auth |
| Send Headers | ON — `Content-Type: application/json` |
| Send Body | ON |
| Body Content Type | Raw |
| Timeout | `300000` |

**Body (fx ON):**

```text
={{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: String($json.refine_prompt || $('adjust_prompt').item.json.refine_prompt || ''),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

**Why:** Regenerates the still with your corrections applied.

**Wire:** `adjust_prompt` → `image_refine` → `save_still_url`

---

## Node 8 — `save_still_url` (merge both IF paths)

**Node type:** Edit Fields (Set)

| Parameter | Value |
|---|---|
| Node name | `save_still_url` |
| Mode | Manual Mapping |
| Keep Only Set Fields | ON |
| Field 1 Name | `still_url` |
| Field 1 Type | String |
| Field 1 Value | below (fx ON) |
| Field 2 Name | `idea` |
| Field 2 Type | String |
| Field 2 Value | `{{ $('idea_input').item.json.idea }}` (fx ON) |
| Field 3 Name | `adjust` |
| Field 3 Type | String |
| Field 3 Value | `{{ $('review_input').item.json.adjust || '' }}` (fx ON) |

**`still_url` (fx ON):**

```text
={{ (() => { try { return $('image_refine').item.json.data[0].url; } catch (e) {} return $('image_gen').item.json.data[0].url; })() }}
```

**Why:** Single merge point. Refined URL if Change path ran; else first still.

**Wire:**
- `if_adjust_empty` True → `save_still_url`
- `image_refine` → `save_still_url`
- `save_still_url` → `grok_video_start`

---

## Node 8b — `video_prompt_input` (optional — swap in/out)

**Node type:** Edit Fields (Set)

| Parameter | Value |
|---|---|
| Node name | `video_prompt_input` |
| Mode | Manual Mapping |
| Keep Only Set Fields | OFF (keep `still_url` from previous node) |
| Include Other Input Fields | **ON** |
| Field Name | `video_prompt` |
| Type | String |
| Value | paste your motion / video prompt (Fixed) |

**Why:** Separate node you can wire in when you want a custom video prompt, or leave disconnected and use the default in `grok_video_start`.

**Wire when using it:** `save_still_url` → `video_prompt_input` → `grok_video_start`  
**Wire when skipping it:** `save_still_url` → `grok_video_start`

---

## Node 9 — `grok_video_start`

**Node type:** HTTP Request

| Parameter | Value |
|---|---|
| Node name | `grok_video_start` |
| Method | `POST` |
| URL | `https://api.x.ai/v1/videos/generations` |
| Authentication | same xAI Header Auth |
| Send Headers | ON — `Content-Type: application/json` |
| Send Body | ON |
| Body Content Type | Raw |
| Timeout | `300000` |

**Body (fx ON)** — uses `video_prompt_input` when present, else default:

```text
={{ JSON.stringify({
  model: 'grok-imagine-video-1.5',
  prompt: String($json.video_prompt || (() => { try { return $('video_prompt_input').item.json.video_prompt; } catch (e) { return ''; } })() || 'Animate this image into a smooth 15-second vertical video. Slow cinematic camera, keep subject identity, label readability, and composition. No new text, no people added, no needles, no injection.'),
  image: { url: String($json.still_url || $('save_still_url').item.json.still_url || '') },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '1080p'
}) }}
```

**Why:** Starts image-to-video; returns `request_id`.

**Wire:** `save_still_url` → (`video_prompt_input` optional) → `grok_video_start`  
**Test:** output includes `request_id`.

---

## Node 10 — `wait_video`

**Node type:** Wait

| Parameter | Value |
|---|---|
| Node name | `wait_video` |
| Resume | After Time Interval |
| Wait Amount | `60` |
| Wait Unit | Seconds |

**Why:** Gives xAI time to render before polling.

**Wire:** `grok_video_start` → `wait_video` → `grok_video_poll`  
Also: `if_video_ready` False → `wait_video` (loop)

---

## Node 11 — `grok_video_poll`

**Node type:** HTTP Request  

Duplicate `grok_video_start` → rename → GET, clear body.

| Parameter | Value |
|---|---|
| Node name | `grok_video_poll` |
| Method | `GET` |
| URL (fx ON) | full expression below |
| Authentication | same xAI Header Auth |
| Send Body | OFF |

**URL (fx ON) — entire URL in one expression:**

```text
={{ 'https://api.x.ai/v1/videos/' + String($('grok_video_start').item.json.request_id || '') }}
```

**Why:** Checks job status until video is ready.

**Wire:** `wait_video` → `grok_video_poll`  
**Test:** `status` = `pending` / `done` / `failed`; when done, `video.url` is the MP4.

---

## Node 12 — `if_video_ready`

**Node type:** IF

| Side | Value |
|---|---|
| Left (field) | `{{ $json.status }}` (fx ON) |
| Operator | **is equal to** |
| Right | `done` (Fixed) |

| Branch | Connect to |
|---|---|
| **True** | `save_video_url` |
| **False** | `wait_video` |

**Why:** Loops poll until status is `done`.

**Wire:** `grok_video_poll` → `if_video_ready`

---

## Node 13 — `save_video_url`

**Node type:** Edit Fields (Set)

| Parameter | Value |
|---|---|
| Node name | `save_video_url` |
| Mode | Manual Mapping |
| Keep Only Set Fields | ON |

| Field | Type | Value (fx ON unless noted) |
|---|---|---|
| `created_at` | String | `{{ $now.toISO() }}` |
| `run_id` | String | `{{ $now.toISO() + '-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0') }}` |
| `video_url` | String | `{{ $('grok_video_poll').item.json.video.url }}` |
| `still_url` | String | `{{ $('save_still_url').item.json.still_url }}` |
| `idea` | String | `{{ $('idea_input').item.json.idea }}` |
| `adjust` | String | `{{ $('review_input').item.json.adjust || '' }}` |
| `video_request_id` | String | `{{ $('grok_video_start').item.json.request_id }}` |
| `duration_seconds` | Number | `15` (Fixed) |
| `aspect_ratio` | String | `9:16` (Fixed) |
| `resolution` | String | `1080p` (Fixed) |
| `model_video` | String | `grok-imagine-video-1.5` (Fixed) |
| `status` | String | `done` (Fixed) |

**Why:** Final clean payload for logging / downstream use.

**Wire:** `if_video_ready` True → `save_video_url` → `sheets_append_run`

---

## Node 14 — `sheets_append_run`

**Node type:** Google Sheets

| Parameter | Value |
|---|---|
| Node name | `sheets_append_run` |
| Credential | your Google Sheets credential |
| Resource | Sheet Within Document |
| Operation | **Append Row** |
| Document | your spreadsheet |
| Sheet / Tab (exact) | **`idea-to-video-pbv-log`** |
| Mapping | Map Each Column Manually |

| Column | Value |
|---|---|
| `run_id` | `{{ $json.run_id }}` |
| `created_at` | `{{ $json.created_at }}` |
| `idea` | `{{ $json.idea }}` |
| `adjust` | `{{ $json.adjust }}` |
| `still_url` | `{{ $json.still_url }}` |
| `video_url` | `{{ $json.video_url }}` |
| `video_request_id` | `{{ $json.video_request_id }}` |
| `duration_seconds` | `{{ $json.duration_seconds }}` |
| `aspect_ratio` | `{{ $json.aspect_ratio }}` |
| `resolution` | `{{ $json.resolution }}` |
| `model_video` | `{{ $json.model_video }}` |
| `status` | `{{ $json.status }}` |

**Why:** Writes one log row every successful execution.

**Wire:** `save_video_url` → `sheets_append_run`

---

## Spreadsheet

Exact name: **`idea-to-video-pbv-log`**

https://github.com/PalmBeach-Vitality/pep/blob/cursor/idea-to-video-nodes-0b73/marketing/sheets/idea-to-video-pbv-log.csv  

Raw:  
https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/idea-to-video-nodes-0b73/marketing/sheets/idea-to-video-pbv-log.csv

Import as Google Sheets tab **`idea-to-video-pbv-log`**.

---

## Quick run checklist

1. Paste description in `idea_input` → Execute  
2. Open `image_gen` still URL → review  
3. Leave `adjust` empty **or** paste corrections → continue  
4. Wait for video poll → `status: done`  
5. Confirm `video_url` + new row on `idea-to-video-pbv-log`
