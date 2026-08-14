# Pep n8n — FULL paste codes (no excerpts)

Talking model is **OmniHuman v1.5** on `pep_lipsync_fal` (image + audio). Not sync-3. Not Kling. Resolution **1080p**. Unique scene + unique VO every execution.

Wire:
```text
Schedule Trigger
  → get_rows_in_sheet
  → filter_active
  → sort_rotation
  → Limit
  → Prep_day_variant
  → grok_api
  → parse_grok
  → if_complaince
  → prep_pep_beats
  → tts_pep_voice_over
  → fal_upload_tts_initiate
  → merge_tts_binary
  → fal_upload_tts_put
  → grok_imagine_reel_still
  → save_still_url
  → prep_pep_lipsync
  → pep_lipsync_fal
  → save_lipsync_video_url
  → sheets_update_creation

Schedule Trigger
  → get_blocking_pool    (side branch only — do NOT insert on the talking path)
```

`prep_pep_beats` reads `$('get_blocking_pool').all()` and picks a random body + gesture + angle. If `(get_blocking_pool)` is not on the canvas yet, builtin pools still randomize.

---

## SORT: `sort_rotation`

Picks the least-used Active row so every execution gets a **unique scene**.

| Parameter | Value |
|---|---|
| Node type | Sort |
| Exact name | `sort_rotation` |
| Type | Simple |

| Sort Field | Order |
|---|---|
| `times_used` | **Ascending** |
| `last_used_at` | **Ascending** |

Wire: `filter_active` → `sort_rotation` → `Limit`

---

## LIMIT: `Limit`

| Parameter | Value |
|---|---|
| Node type | Limit |
| Exact name | `Limit` |
| Max Items | `1` |
| Keep | First Items |

---

## SHEETS: `(get_blocking_pool)` (ADD)

Second tab **`pep-blocking-pool`**. This is pose / gesture / angle only. Scene + compound stay on `150-pb-pep-scenes`.

Wire as a **side branch** from `Schedule Trigger`. Do **not** insert this node between `Limit` and `Prep_day_variant` or anywhere on the talking path — Get Many would replace the scene item with 17 blocking rows.

`Schedule Trigger` → **`(get_blocking_pool)`** (dead-end side branch)

`prep_pep_beats` reads `$('get_blocking_pool').all()`. Use **Test workflow**, not Execute node, so that `$('get_blocking_pool')` has run.

| Parameter | fx | Value |
|---|---|---|
| Node type | — | Google Sheets |
| Exact name | — | `get_blocking_pool` |
| Credential | — | same Google Sheets account as `get_rows_in_sheet` |
| Resource | — | Sheet Within Document |
| Operation | — | Get Row(s) |
| Document | — | same document as `get_rows_in_sheet` |
| Sheet | OFF | `pep-blocking-pool` |
| Filters | — | none (return every row) |
| Combine Filters | — | AND |
| Return All / Output all matching rows | — | **ON** |
| Options → Data Location on Sheet → Header Row | OFF | `1` |
| Options → Data Location on Sheet → First Data Row | OFF | `2` |
| Options → Output Formatting | — | Formatted |

Import CSV: `marketing/sheets/pep-blocking-pool.csv` into a new tab named exactly **`pep-blocking-pool`**. Set `active` to `FALSE` to drop a pose without deleting it.

---

## CODE NODE: `prep_pep_beats`

| Parameter | fx | Value |
|---|---|---|
| Node type | — | Code |
| Exact name | — | `prep_pep_beats` |
| Mode | — | **Run Once for Each Item** |
| Language | — | JavaScript |

Do **not** use Run Once for All Items. Do **not** `return [{ json: ... }]`.

Wire: `if_complaince` (true) → `prep_pep_beats` → `tts_pep_voice_over`

Paste the full file `marketing/n8n-pep-prep-beats.js`.

Each Test workflow picks a random `pep_body_action` (walking / sitting / standing / stopping / turning) + `pep_hand_gesture` + `pep_angle`. OUTPUT must show `blocking_source` = `pep-blocking-pool` after `(get_blocking_pool)` is live, or `builtin` until that node exists. `pose_still` feeds `grok_imagine_reel_still`. `omnihuman_prompt` feeds `prep_pep_lipsync`.

---

## CODE NODE: `merge_tts_binary`

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `merge_tts_binary` |
| Mode | Run Once for All Items |
| Language | JavaScript |

```javascript
const initiate = $input.first();
const tts = $('tts_pep_voice_over').first();

if (!tts.binary || !tts.binary.data) {
  throw new Error('No binary data on tts_pep_voice_over — re-run TTS first');
}

return [
  {
    json: initiate.json,
    binary: tts.binary,
  },
];
```

---

## CODE NODE: `prep_grok_video_start`

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `prep_grok_video_start` |
| Mode | Run Once for Each Item |
| Language | JavaScript |

Do **not** use Run Once for All Items. Do **not** `return [{ json: ... }]`. Next HTTP node is **`ai_vid_generator`**. If `kling_video_request` is on the canvas, disconnect it.

```javascript
// Node name (exact): prep_grok_video_start
// Next node on canvas: ai_vid_generator → Wait2 → Wait → grok_video_poll
// Duplicates later: prep_grok_video_start_b / _c / _d
// Mode: Run Once for Each Item
// Do not return [{ json: ... }] — that errors with A 'json' property isn't an object.
// IMPORTANT: change BEAT to 'a' | 'b' | 'c' | 'd' in each duplicated node
// Kling hard limit: prompt max 2500 characters

const BEAT = 'a'; // ← change per node: a, b, c, or d
const PROMPT_MAX = 2500;

const beats = ['a', 'b', 'c', 'd'];
if (!beats.includes(BEAT)) {
  throw new Error(`BEAT must be one of ${beats.join(', ')}`);
}

function clip(str, max) {
  const s = String(str || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trim() + '…';
}

const prep = (() => {
  try { return $('prep_pep_beats').item.json; } catch (e) { return $json; }
})();

function stillUrlFor(beat) {
  const saveName = beat === 'a' ? 'save_still_url' : `save_still_url_${beat}`;
  const stillName = beat === 'a' ? 'grok_imagine_reel_still' : `grok_imagine_reel_still_${beat}`;

  try {
    const j = $(saveName).item.json;
    const u = j.reel_still_url || j[`reel_still_url_${beat}`] || j.data?.[0]?.url || '';
    if (u) return String(u);
  } catch (e) {}

  try {
    const j = $(stillName).item.json;
    const u = j.data?.[0]?.url || j.reel_still_url || '';
    if (u) return String(u);
  } catch (e) {}

  try {
    const u = prep[`reel_still_url_${beat}`] || '';
    if (u) return String(u);
  } catch (e) {}

  if (beat === BEAT) {
    return String($json.reel_still_url || $json.data?.[0]?.url || '');
  }
  return '';
}

const NEXT_BEAT = { a: 'b', b: 'c', c: 'd' }[BEAT] || '';

const stillUrl = stillUrlFor(BEAT);
if (!stillUrl) {
  throw new Error(
    `Missing Pep still URL for beat ${BEAT}. Check save_still_url / grok_imagine_reel_still.`
  );
}

const endImageUrl = NEXT_BEAT ? stillUrlFor(NEXT_BEAT) : '';

const compound = clip(prep.compound_name || 'research compound', 80);
const compoundId = clip(prep.compound_id || '', 40);
const motion = clip(prep[`beat_${BEAT}_motion`] || prep.video_motion_prompt || 'slow push-in', 180);
const lighting = clip(prep.lighting || '', 80);
const grade = clip(prep.color_grade || '', 80);
const surface = clip(prep.surface || prep.material_detail || '', 120);

const videoPrompt = clip([
  'PRIMARY ACTION: walking for the entire 15 seconds. Cartoon walk cycle never stops.',
  'Start already mid-stride at 0.00 seconds. End still mid-stride at 15.00 seconds.',
  'WALK DIRECTION: toward camera, slight 3/4, screen-right, mid-ground. Gray tube legs and white sneakers in a continuous cartoon walk. Does not walk out of frame.',
  'ARMS: both white gloves swing with the walk at hip height. NO thumbs-up. NO raised hand. NO hat tip. NO posing.',
  'CHARACTER LOCK: Palm Beach Pep identical — 10mL crimp-seal glass vial mascot, Palm Beach Vitality sunset palm logo on white baseball cap, face on white 10ml label, gray limbs, white gloves and sneakers. No morphing.',
  `Product: ${compound} (${compoundId}). Beat ${BEAT.toUpperCase()}.`,
  `Set: ${surface}.`,
  'CAMERA: track with Pep as he walks; keep him mid-ground in 9:16; soft parallax; environment moves (waves/breeze/light).',
  `Lighting: ${lighting}. Grade: ${grade}.`,
  'ONLY Pep — no extra vials/bottles/pens/syringes. Crimp seal only. No humans, hospital, on-screen text. Silent.',
].filter(Boolean).join(' '), PROMPT_MAX);

const negativePrompt = clip([
  'thumbs up, thumbs-up, raised hand, hat tip, posing, waving, planted feet,',
  'standing still, freeze, idle, stops walking, walks out of frame,',
  'morphing, deformed vial, extra vials, extra bottles, humans, hospital, on-screen text, watermarks',
].join(' '), 800);

const MODEL_VIDEO = 'fal-kling-v3-pro-i2v';
const FAL_ENDPOINT = 'fal-ai/kling-video/v3/pro/image-to-video';
const FAL_NODE = 'ai_vid_generator';

const videoRequestBody = {
  prompt: videoPrompt,
  start_image_url: stillUrl,
  duration: '15',
  generate_audio: false,
  negative_prompt: negativePrompt,
  cfg_scale: 0.5,
};
if (endImageUrl) {
  videoRequestBody.end_image_url = endImageUrl;
}

return {
  ...prep,
  beat: BEAT,
  fal_node: FAL_NODE,
  reel_still_url: stillUrl,
  [`reel_still_url_${BEAT}`]: stillUrl,
  prompt: videoPrompt,
  video_prompt: videoPrompt,
  prompt_char_count: videoPrompt.length,
  start_image_url: stillUrl,
  end_image_url: endImageUrl || '',
  next_beat: NEXT_BEAT || '',
  negative_prompt: negativePrompt,
  video_motion_prompt: motion,
  duration: '15',
  duration_seconds: 15,
  generate_audio: false,
  aspect_ratio: '9:16',
  resolution: '1080p',
  model_video: MODEL_VIDEO,
  fal_endpoint: FAL_ENDPOINT,
  fal_submit_url: `https://queue.fal.run/${FAL_ENDPOINT}`,
  video_request_body: videoRequestBody,
  video_request_body_string: JSON.stringify(videoRequestBody),
};
```

---

## CODE NODE: `prep_pep_lipsync`

| Parameter | fx | Value |
|---|---|---|
| Node type | — | Code |
| Exact name | — | `prep_pep_lipsync` |
| Mode | — | **Run Once for Each Item** |
| Language | — | JavaScript |

Do **not** use Run Once for All Items. Do **not** `return [{ json: ... }]`.

```javascript
function fromNode(name, keys) {
  try {
    const j = $(name).item.json;
    for (const k of keys) {
      const v = j?.[k];
      if (v) return String(v);
    }
  } catch (e) {}
  return '';
}

const imageUrl =
  fromNode('save_still_url', ['reel_still_url', 'reel_still_url_a']) ||
  fromNode('grok_imagine_reel_still', ['reel_still_url']) ||
  String($json.reel_still_url || $json.data?.[0]?.url || '');

const audioUrl =
  fromNode('fal_upload_tts_initiate', ['file_url', 'tts_audio_url']) ||
  String($json.tts_audio_url || $json.file_url || '');

if (!imageUrl) {
  throw new Error('Missing Pep still URL. Expected save_still_url.reel_still_url');
}
if (!audioUrl) {
  throw new Error('Missing TTS audio URL. Expected fal_upload_tts_initiate.file_url');
}
if (/catbox\.moe/i.test(audioUrl)) {
  throw new Error('TTS audio is Catbox — fal cannot fetch files.catbox.moe.');
}
if (/catbox\.moe/i.test(imageUrl)) {
  throw new Error('Still is Catbox — fal OmniHuman may not fetch files.catbox.moe. Use the xAI still URL.');
}

let creation_id = '';
let omniFromBeats = '';
try {
  const beats = $('prep_pep_beats').item.json;
  creation_id = String(beats.creation_id || '');
  omniFromBeats = String(beats.omnihuman_prompt || beats.pose_motion || '');
} catch (e) {
  creation_id = '';
}

const omniPrompt = omniFromBeats || [
  'Palm Beach Pep, anthropomorphic 10ml crimp-seal glass vial mascot,',
  'talking with the audio. Mouth on the white 10ml label moves with speech.',
  'Natural body motion with the audio — walk, sit, stand, or stop as the still shows.',
  'No thumbs-up. No hat-tip freeze.',
].join(' ');

return {
  creation_id: creation_id,
  beat: 'a',
  lipsync_image_in: imageUrl,
  lipsync_audio_in: audioUrl,
  reel_still_url: imageUrl,
  tts_audio_url: audioUrl,
  omnihuman_prompt: omniPrompt,
  omnihuman_resolution: '1080p',
  fal_lipsync_endpoint: 'fal-ai/bytedance/omnihuman/v1.5',
};
```

---

## HTTP: `tts_pep_voice_over`

Use a **predefined credential**. Do not paste the ElevenLabs key into a header on the node.

| Parameter | fx | Value |
|---|---|---|
| Node type | — | HTTP Request |
| Exact name | — | `tts_pep_voice_over` |
| Method | OFF | `POST` |
| URL | OFF | `https://api.elevenlabs.io/v1/text-to-speech/yl2ZDV1MzN4HbQJbMihG?output_format=mp3_44100_128` |
| Authentication | — | **Predefined Credential Type** |
| Credential Type | — | **ElevenLabs API** (if that type is installed) **or** Generic Credential Type → **Header Auth** |
| Credential | — | your ElevenLabs account |
| Header Auth Name *(only if Header Auth)* | OFF | `xi-api-key` |
| Header Auth Value *(only if Header Auth)* | OFF | *(stored in the credential, not on the node)* |
| Send Query Parameters | — | OFF |
| Send Headers | — | **ON** |
| Header 1 Name | OFF | `Accept` |
| Header 1 Value | OFF | `audio/mpeg` |
| Header 2 Name | OFF | `Content-Type` |
| Header 2 Value | OFF | `application/json` |
| Send Body | — | **ON** |
| Body Content Type | — | JSON |
| Specify Body | — | Using JSON |
| Options → Response → Response Format | — | **File** |
| Options → Response → Put Output in Field | OFF | `data` |
| Options → Timeout | OFF | `120000` |

Do **not** also add a `xi-api-key` header on the node. The credential already sends it.

JSON Body (fx **ON** on the body):
```json
{
  "text": "={{ $('prep_pep_beats').item.json.vo_beat_a || $('prep_pep_beats').item.json.voice_over }}",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.45,
    "similarity_boost": 0.8
  }
}
```

This is that sheet row’s unique VO (`vo_beat_a` from `prep_pep_beats`, which splits that row’s `voice_over`). Do **not** paste a URL into `text`. Do **not** hardcode a line of VO.

---

## HTTP: `fal_upload_tts_initiate`

| Parameter | Value |
|---|---|
| Method | POST |
| URL | `https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3` |
| Authentication | fal Key YOUR_FAL_KEY |
| Send Headers | ON |
| Header `Content-Type` | `application/json` |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| Options → Timeout | `60000` |

JSON Body:
```json
{
  "content_type": "audio/mpeg",
  "file_name": "={{ 'pep-' + String($('prep_pep_beats').item.json.creation_id || $('Limit').item.json.creation_id || 'run') + '-' + String($now.toMillis()) + '.mp3' }}"
}
```

`file_name` must be unique per run. Do **not** use `pep-beat-a.mp3` — that reused the same VO every run.

---

## HTTP: `fal_upload_tts_put`

| Parameter | Value |
|---|---|
| Method | PUT |
| URL | `={{ $('fal_upload_tts_initiate').item.json.upload_url }}` |
| Authentication | None |
| Send Headers | ON |
| Header `Content-Type` | `audio/mpeg` |
| Send Body | ON |
| Body Content Type | n8n Binary File |
| Input Data Field Name | `data` |
| Options → Timeout | `120000` |

---

## SET: `save_tts_audio_url`

**Not on canvas. Do not add.** TTS public URL is `$('fal_upload_tts_initiate').item.json.file_url`.

---

## HTTP: `ai_vid_generator`

Wire: `prep_grok_video_start` → **`ai_vid_generator`** → `Wait2` → `Wait` → `grok_video_poll`

Exact name on canvas is **`ai_vid_generator`**. Do not rename. This is fal Kling I2V (not Luma).

| Parameter | fx | Value |
|---|---|---|
| Node type | — | HTTP Request |
| Exact name | — | `ai_vid_generator` |
| Method | OFF | `POST` |
| URL | OFF | `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video` |
| Authentication | — | Predefined Credential Type |
| Credential Type | — | fal.ai API |
| Credential | — | fal.ai account |
| Send Query Parameters | — | **OFF** |
| Send Headers | — | ON |
| Header 1 Name | OFF | `Content-Type` |
| Header 1 Value | OFF | `application/json` |
| Header 2 Name | OFF | `Accept` |
| Header 2 Value | OFF | `application/json` |
| Send Body | — | ON |
| Body Content Type | — | JSON |
| Specify Body | — | Using JSON |
| JSON | ON | `={{ JSON.parse($json.video_request_body_string) }}` |
| Options → Timeout | OFF | `300000` |
| Options → Response → Response Format | — | JSON |
| Options → Never Error | — | OFF |

Do **not** use `={{ $json.video_request_body }}` — if that field is missing, n8n sends the text `undefined` and errors. Use `video_request_body_string` as above.

If `kling_video_request` is on the canvas, disconnect it. The live POST is **`ai_vid_generator`**. Two POST nodes would bill Kling twice.

Do **not** send `frontal_image_url` at root.

If later **`grok_video_poll`** or **`pep_lip_sync_result`** GET fails with 405/422, that fal.ai credential injects `User-Agent: n8n-nodes-fal/1.0.1`. Switch **those GET nodes** to Generic Header Auth `Authorization` = `Key YOUR_FAL_KEY`. Leave **`ai_vid_generator`** as fal.ai API if this POST already works.

**Body fields coming from `prep_grok_video_start` (do not retype these in the HTTP node):**

| Body key | Type | Source |
|---|---|---|
| `prompt` | string | `$json.video_request_body.prompt` |
| `start_image_url` | string | `$json.video_request_body.start_image_url` |
| `duration` | string | `"15"` |
| `generate_audio` | boolean | `false` |
| `negative_prompt` | string | `$json.video_request_body.negative_prompt` |
| `cfg_scale` | number | `0.5` |
| `end_image_url` | string | only present when next-beat still exists |

**Expect output JSON:**

| Field | Example |
|---|---|
| `status` | `IN_QUEUE` |
| `request_id` | uuid |
| `status_url` | `https://queue.fal.run/fal-ai/kling-video/requests/{id}/status` |
| `response_url` | `https://queue.fal.run/fal-ai/kling-video/requests/{id}` |
| `cancel_url` | `https://queue.fal.run/fal-ai/kling-video/requests/{id}/cancel` |

Then: **`kling_video_request`** → `Wait` → `grok_video_poll` (GET `$('kling_video_request').item.json.status_url`) → only after `COMPLETED` → `kling_video_result` (GET `$('kling_video_request').item.json.response_url`).

---

## HTTP: `grok_video_poll`

| Parameter | fx | Value |
|---|---|---|
| Method | OFF | GET |
| URL | ON | `={{ $('ai_vid_generator').item.json.status_url }}` |
| Authentication | — | Predefined Credential Type · fal.ai API · fal.ai account |
| Send Query Parameters | — | OFF |
| Send Body | — | OFF |
| Options → Timeout | OFF | `60000` |

---

## HTTP: `(kling_video_result)` (ADD)

`grok_video_poll` only returns status. It does **not** include `video.url`. Without this GET, **`save_video_url`** keeps the old mp4 via Include Other Input Fields.

Wire: `grok_video_poll` → **`(kling_video_result)`** → `save_video_url`

Only execute after `grok_video_poll` `status` = `COMPLETED`.

| Parameter | fx | Value |
|---|---|---|
| Node type | — | HTTP Request |
| Exact name | — | `kling_video_result` |
| Method | OFF | GET |
| URL | ON | `={{ $('ai_vid_generator').item.json.response_url }}` |
| Authentication | — | Predefined Credential Type · fal.ai API · fal.ai account |
| Send Query Parameters | — | OFF |
| Send Headers | — | OFF (credential sets Auth) |
| Send Body | — | OFF |
| Options → Timeout | OFF | `120000` |
| Options → Response → Response Format | — | JSON |

**Expect:** `{ "video": { "url": "https://v3b.fal.media/..." } }` — a **new** filename, not `zTmptnI9uTeWInNxHCqvo_output.mp4`.

---

## SET: `save_video_url`

| Parameter | fx | Value |
|---|---|---|
| Node type | — | Edit Fields (Set) |
| Exact name | — | `save_video_url` |
| Include Other Input Fields | — | **OFF** |

| Field Name | Field Type | fx | Value |
|---|---|---|---|
| `video_url` | String | ON | `={{ $json.video.url }}` |
| `creation_id` | String | ON | `={{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | OFF | `a` |
| `model_video` | String | OFF | `fal-kling-v3-pro-i2v` |

**Delete** any field named `video_url_a` or `save_video_url`. Include Other Input Fields **OFF** so the old clip cannot ride through. Previous node must be **`kling_video_result`**.

---

## FAL NODE: `pep_lipsync_fal`

OmniHuman is **image + audio → talking video**. It does **not** take a Kling `video_url`.

Wire: `save_still_url` → `prep_pep_lipsync` → **`pep_lipsync_fal`** → `save_lipsync_video_url`

Disconnect `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`. Leave Kling disconnected from this talking path.

Do **not** hardcode Audio Url. Do **not** send `video_url` (sync-3 / VEED / Kling lipsync / LatentSync).

**Model Parameters** — click **Add Parameter** exactly **4** times. **Parameter Name or ID** is the dropdown (**fx OFF**). Pick **Image [string]**, **Audio [string]**, **Resolution**, **Prompt [string]**. Do not add a fifth row.

| # | Parameter Name or ID dropdown (fx OFF) | Value fx | Value |
|---|---|---|---|
| 1 | **Image [string]** (`image_url`) | ON | `={{ $('save_still_url').item.json.reel_still_url }}` |
| 2 | **Audio [string]** (`audio_url`) | ON | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| 3 | **Resolution** (`resolution`) | OFF | `1080p` |
| 4 | **Prompt [string]** (`prompt`) | **ON** | `={{ String($('prep_pep_lipsync').item.json.omnihuman_prompt) }}` |

Prompt Value must be a **string**. `String(...)` keeps it a string. Do **not** use `={{ $json.omnihuman_prompt }}` (that is `undefined` on this fal node). Confirm `prep_pep_lipsync` OUTPUT has `omnihuman_prompt` before Test workflow.

The dropdown may show `Image Url [string] *` / `Audio Url [string] *` / `Resolution [select]` / `Prompt [string]`. Those are the same four.

| Parameter | fx | Value |
|---|---|---|
| Node type | — | fal.ai |
| Exact name | — | `pep_lipsync_fal` |
| Credential | — | fal.ai account |
| Resource | — | Model |
| Operation | — | Generate Media |
| Model | — | From list · **OmniHuman** / **Omnihuman v1.5** (`fal-ai/bytedance/omnihuman/v1.5`) |
| Wait for Completion | — | **ON** |
| Poll Interval (Seconds) | — | `5` |
| Max Wait Time (Seconds) | — | `1200` |

1080p can take longer than 10 min. **600 is too short** (n8n default). Use **1200**.

If n8n errors `[ERROR: No path back to node]` on `$('save_still_url')`, use `$json.lipsync_image_in` / `$json.lipsync_audio_in` from `prep_pep_lipsync` instead (same URLs).

**Expect OUTPUT:** `{ "video": { "url": "https://..." } }`

---

## HTTP: disconnected sync-3 chain (do not wire)

These exist on canvas from the old sync-3 attempt. **Leave disconnected.** Talking clip is `pep_lipsync_fal` OmniHuman.

Do **not** execute: `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`.

**Not on canvas / do not invent:** `pep_lipsync_start`, `pep_lipsync_result`.

---

## SET: `save_lipsync_video_url`

| Parameter | Value |
|---|---|
| Include Other Input Fields | **OFF** |

| Field | Type | Value |
|---|---|---|
| `lipsync_video_url` | String | `={{ $json.video.url }}` |
| `video_url` | String | `={{ $json.video.url }}` |
| `tts_audio_url` | String | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `creation_id` | String | `={{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | `a` |
| `model_video` | String | `fal-omnihuman-v1.5` |

---

## SHEETS: `sheets_update_creation` (LAST NODE)

| Parameter | Value |
|---|---|
| Resource | Sheet Within Document |
| Operation | Update |
| Sheet | `150-pb-pep-scenes` |
| Column to Match On | `creation_id` |
| Value to Match On | `={{ $('prep_pep_beats').item.json.creation_id \|\| $('Limit').item.json.creation_id }}` |

| Column | Value |
|---|---|
| `last_used_at` | `={{ $now.toISO() }}` |
| `times_used` | `={{ Number($('Limit').item.json.times_used \|\| $('Prep_day_variant').item.json.times_used \|\| 0) + 1 }}` |
| `reel_still_url` | `={{ $('save_still_url').item.json.reel_still_url \|\| $('save_still_url').item.json.data[0].url }}` |
| `video_url` | `={{ $('save_lipsync_video_url').item.json.lipsync_video_url \|\| $('save_lipsync_video_url').item.json.video_url \|\| $('save_video_url').item.json.video_url }}` |
| `model_video` | `={{ $('save_lipsync_video_url').item.json.model_video \|\| 'fal-omnihuman-v1.5' }}` |
