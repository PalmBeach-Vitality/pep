# Pep n8n — FULL paste codes (no excerpts)

Wire:
```text
tts_pep_voice_over
  → fal_upload_tts_initiate
  → merge_tts_binary
  → fal_upload_tts_put
  → grok_imagine_reel_still
  → save_still_url
  → prep_grok_video_start
  → ai_vid_generator
  → Wait2
  → Wait
  → grok_video_poll
  → save_video_url
  → prep_pep_lipsync
  → fal_lipsync_call
  → Wait3
  → pep_lipsync_poll
  → pep_lip_sync_result
  → save_lipsync_video_url
  → sheets_update_creation
```

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
| Mode | Run Once for All Items |
| Language | JavaScript |

```javascript
// Node name (exact): prep_grok_video_start
// Next node on canvas: kling_video_request (fal.ai · Kling v3 Pro I2V)
// Duplicates later: prep_grok_video_start_b / _c / _d
// Mode: Run Once for All Items
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
  'PRIMARY ACTION: walking AND talking at the same time for the entire 15 seconds. Both never stop.',
  'STITCH LOCK: This clip must dissolve into the next 15s shot. Same walk the whole time.',
  'Start already mid-stride at 0.00 seconds — first frame is a walking pose, not a planted still. Talking immediately. Do not wait. Do not start at 3 seconds.',
  'End still mid-stride at 15.00 seconds — last frame is a walking pose, mouth open mid-speech. Do not plant feet. Do not freeze. Do not pose for a cut.',
  'WALK DIRECTION (every beat): walk toward camera on a slight 3/4, screen-right bias, mid-ground. Same direction every clip so A→B→C→D can cross-dissolve. Gray tube legs and white sneakers in a continuous cartoon walk. Does not walk out of frame. Arms swing with the walk.',
  'TALK: the cartoon mouth printed on the white 10ml label opens and closes continuously from 0.00s through 15.00s WHILE he walks. Mouth never rests closed. Mouth never holds a smile. No grin-and-hold. No talk-stop-smile-talk.',
  'NO pose beats. NO thumbs-up. NO hat tip. NO pause-to-smile. NO stop-to-talk. NO freeze on first or last frame.',
  'Eyes blink. Hands stay in a walk swing, not posing.',
  'CHARACTER LOCK: Palm Beach Pep identical — 10mL crimp-seal glass vial mascot, Palm Beach Vitality sunset palm logo on white baseball cap, face on white 10ml label, gray limbs, white gloves and sneakers. No morphing.',
  `Product: ${compound} (${compoundId}). Beat ${BEAT.toUpperCase()}.`,
  `Set: ${surface}.`,
  'CAMERA: track with Pep as he walks; keep him mid-ground in 9:16; soft parallax; environment moves (waves/breeze/light). Do not lose him. Do not crop to a void. Camera move stays consistent across beats for dissolves.',
  `Lighting: ${lighting}. Grade: ${grade}.`,
  'ONLY Pep — no extra vials/bottles/pens/syringes. Crimp seal only. No humans, hospital, on-screen text. Silent. Keep scene depth.',
].filter(Boolean).join(' '), PROMPT_MAX);

const negativePrompt = clip([
  'delayed start, waits 3 seconds, starts talking late, standing still, planted feet, idle stance,',
  'freeze on first frame, freeze on last frame, pose for cut, stop at the end,',
  'stops walking, walks out of frame, moonwalk, sliding without steps, frozen legs,',
  'walks the opposite direction, sudden turn, jump cut pose,',
  'pause, stop talking, smile hold, frozen grin, closed mouth, closed-mouth smile,',
  'thumbs up, hat tip, pose and hold, talk then stop, idle, silent gap,',
  'static face, mouth not moving, mouth closed, rest face,',
  'blur, distort, morphing, deformed vial, idle freeze,',
  'extra vials, extra bottles, pens, syringes, humans, hospital, on-screen text, watermarks',
].join(' '), 800);

const MODEL_VIDEO = 'fal-kling-v3-pro-i2v';
const FAL_ENDPOINT = 'fal-ai/kling-video/v3/pro/image-to-video';
const FAL_NODE = 'kling_video_request';

const videoRequestBody = {
  prompt: videoPrompt,
  start_image_url: stillUrl,
  duration: '15',
  generate_audio: false,
  negative_prompt: negativePrompt,
  cfg_scale: 0.7,
};
if (endImageUrl) {
  videoRequestBody.end_image_url = endImageUrl;
}

return [
  {
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
  },
];
```

---

## CODE NODE: `prep_pep_lipsync`

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `prep_pep_lipsync` |
| Mode | Run Once for All Items |
| Language | JavaScript |

```javascript
const videoUrl = String($('save_video_url').item.json.video_url || '');
const audioUrl = String($('save_tts_audio_url').item.json.tts_audio_url || '');

if (!videoUrl) throw new Error('Missing video_url from save_video_url');
if (!audioUrl) throw new Error('Missing tts_audio_url from save_tts_audio_url');

const lipsync_request_body = {
  video_url: videoUrl,
  audio_url: audioUrl,
  sync_mode: 'cut_off',
};

let creation_id = '';
try {
  creation_id = String($('prep_pep_beats').item.json.creation_id || '');
} catch (e) {
  creation_id = '';
}

return [
  {
    creation_id: creation_id,
    beat: 'a',
    video_url: videoUrl,
    tts_audio_url: audioUrl,
    fal_lipsync_endpoint: 'fal-ai/sync-lipsync/v3',
    fal_lipsync_submit_url: 'https://queue.fal.run/fal-ai/sync-lipsync/v3',
    lipsync_request_body: lipsync_request_body,
    lipsync_request_body_string: JSON.stringify(lipsync_request_body),
  },
];
```

---

## HTTP: `tts_pep_voice_over`

| Parameter | Value |
|---|---|
| Method | POST |
| URL | `https://api.elevenlabs.io/v1/text-to-speech/yl2ZDV1MzN4HbQJbMihG?output_format=mp3_44100_128` |
| Authentication | None |
| Send Headers | ON |
| Header `xi-api-key` | YOUR_ELEVENLABS_KEY |
| Header `Accept` | `audio/mpeg` |
| Header `Content-Type` | `application/json` |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| Options → Response → Response Format | File |
| Options → Response → Put Output in Field | `data` |
| Options → Timeout | `120000` |

JSON Body:
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
  "file_name": "pep-beat-a.mp3"
}
```

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

| Parameter | Value |
|---|---|
| Include Other Input Fields | ON |

| Field | Type | Value |
|---|---|---|
| `tts_audio_url` | String | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `beat` | String | `a` |

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
| JSON | ON | `={{ $json.video_request_body }}` |
| Options → Timeout | OFF | `300000` |
| Options → Response → Response Format | — | JSON |
| Options → Never Error | — | OFF |

If `={{ $json.video_request_body }}` errors, JSON fx ON: `={{ JSON.parse($json.video_request_body_string) }}`

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
| `cfg_scale` | number | `0.7` |
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

| Parameter | Value |
|---|---|
| Method | GET |
| URL | `={{ $('kling_video_request').item.json.status_url }}` |
| Authentication | fal Key YOUR_FAL_KEY |
| Send Body | OFF |
| Options → Timeout | `60000` |

---

## HTTP: `kling_video_result`

| Parameter | Value |
|---|---|
| Method | GET |
| URL | `={{ $('kling_video_request').item.json.response_url }}` |
| Authentication | fal Key YOUR_FAL_KEY |
| Send Body | OFF |
| Options → Response → Response Format | JSON |
| Options → Timeout | `120000` |

Only when poll status = `COMPLETED`.

---

## SET: `save_video_url`

| Parameter | Value |
|---|---|
| Include Other Input Fields | ON |

| Field | Type | Value |
|---|---|---|
| `video_url` | String | `={{ $json.video.url }}` |
| `creation_id` | String | `={{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | `a` |
| `model_video` | String | `fal-kling-v3-pro-i2v` |

---

## HTTP: `pep_lipsync_start`

| Parameter | Value |
|---|---|
| Method | POST |
| URL | `https://queue.fal.run/fal-ai/sync-lipsync/v3` |
| Authentication | fal Key YOUR_FAL_KEY |
| Send Headers | ON |
| Header `Content-Type` | `application/json` |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| JSON Body | `={{ JSON.parse($json.lipsync_request_body_string) }}` |
| Options → Timeout | `300000` |

---

## HTTP: `pep_lipsync_poll`

| Parameter | Value |
|---|---|
| Method | GET |
| URL | `={{ $('pep_lipsync_start').item.json.status_url }}` |
| Authentication | fal Key YOUR_FAL_KEY |
| Send Body | OFF |
| Options → Timeout | `60000` |

---

## HTTP: `pep_lipsync_result`

| Parameter | Value |
|---|---|
| Method | GET |
| URL | `={{ $('pep_lipsync_start').item.json.response_url }}` |
| Authentication | fal Key YOUR_FAL_KEY |
| Send Body | OFF |
| Options → Response → Response Format | JSON |
| Options → Timeout | `120000` |

Only when poll status = `COMPLETED`.

---

## SET: `save_lipsync_video_url`

| Parameter | Value |
|---|---|
| Include Other Input Fields | ON |

| Field | Type | Value |
|---|---|---|
| `lipsync_video_url` | String | `={{ $json.video.url }}` |
| `video_url` | String | `={{ $json.video.url }}` |
| `tts_audio_url` | String | `={{ $('save_tts_audio_url').item.json.tts_audio_url }}` |
| `creation_id` | String | `={{ $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | `a` |
| `model_video` | String | `fal-sync-lipsync-v3` |

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
| `model_video` | `={{ $('save_lipsync_video_url').item.json.model_video \|\| 'fal-sync-lipsync-v3' }}` |
