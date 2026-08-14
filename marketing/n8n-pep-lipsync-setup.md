# Pep talking clip — OmniHuman v1.5 (FULL n8n parameters)

**Rule for agents:** Always give Sal the **complete** parameter list for every node (Method, URL, Auth, Headers, Body, Options, field types). No abbreviated “see below / same as Kling” replies.

**Locked talking model:** ByteDance **OmniHuman v1.5** on fal (`fal-ai/bytedance/omnihuman/v1.5`).  
OmniHuman is **image + audio → talking video**. It does **not** take a Kling `video_url`. That is sync-3.

**Live canvas node for the job:** `pep_lipsync_fal` (fal.ai community node). Do **not** rename it.

**Not on canvas / do not invent:** `save_tts_audio_url`, `pep_lipsync_start`, `pep_lipsync_result`.

TTS public URL = `$('fal_upload_tts_initiate').item.json.file_url` (fal CDN). **Catbox is blocked by fal** for audio/video inputs. Master Catbox URL is OK only as Pep still *reference* for Grok EDIT.

Audio must be under **60s at 720p** (1080p caps at 30s). Same unique-word product pitch on every scene cut via `(split_pep_beats)`. Do not speak compliance/disclaimer. Not one word repeats.

Canvas steps: `marketing/n8n-pep-60s-1080-execute.md`.

Keeper QC: `marketing/n8n-pep-omnihuman-keeper.txt`

---

## Talking wire (exact)

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
  → split_pep_beats
  → tts_pep_voice_over
  → fal_upload_tts_initiate
  → merge_tts_binary
  → fal_upload_tts_put
  → grok_imagine_reel_still
  → save_still_url
  → prep_pep_lipsync
  → pep_lipsync_fal
  → save_lipsync_video_url
  → gather_pep_clips
  → sheets_update_creation

Schedule Trigger
  → get_blocking_pool    (side branch only — do NOT insert on the talking path)
```

Kling walk chain still exists — **leave it, do not delete**, keep it **disconnected** from this talking path:

```text
prep_grok_video_start → ai_vid_generator → Wait2 → Wait → grok_video_poll → kling_video_result → save_video_url
```

**Disconnect (do not delete/rename):** `fal_lipsync_call` → `Wait3` → `pep_lipsync_poll` → `pep_lip_sync_result`, and `kling_video_request`.

Execute with **Test workflow** (not Execute node) so `$('other_node')` has a path. Pin = n8n “Pin data” (thumbtack on OUTPUT). Frozen output is reused; Test workflow skips that API call.

---

## Node: `tts_pep_voice_over`

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
| JSON Body | **ON** | paste the expression below — must start with `={{` |
| Options → Response → Response Format | — | **File** |
| Options → Response → Put Output in Field | OFF | `data` |
| Options → Timeout | OFF | `120000` |

Do **not** also add a `xi-api-key` header on the node. The credential already sends it.

**JSON Body (fx ON).** Paste this whole block. Do **not** paste a JSON object with `"text": "={{ ... }}"` inside it — ElevenLabs will **speak the expression** (`prep_pep_beats item json vo beat a`) instead of the sheet VO.

```
={{ (() => {
  const text = String(
    $json.tts_text ||
    $('split_pep_beats').item.json.tts_text ||
    ''
  ).trim();
  if (!text) {
    throw new Error('Missing beat tts_text. Check split_pep_beats OUTPUT.');
  }
  if (text.includes("$('") || text.includes('={{')) {
    throw new Error('TTS text is an n8n expression, not the sheet VO. JSON Body fx must be ON, paste starting with ={{');
  }
  const low = text.toLowerCase();
  if (
    low.includes("today's unique set") ||
    low.includes('for laboratory research use only') ||
    low.includes('not evaluated by the fda') ||
    low.includes('everything stays in the research') ||
    low.includes('not for human use')
  ) {
    throw new Error('TTS text is sheet-list/compliance, not the product sales pitch. Re-paste prep_pep_beats.');
  }
  if (!text.endsWith('Visit us at palmbeach-vitality.store.')) {
    throw new Error('TTS text must end with: Visit us at palmbeach-vitality.store.');
  }
  if (!/palm beach pep/i.test(text)) {
    throw new Error('TTS text must start with Pep introducing himself.');
  }
  const seen = new Set();
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const k = w.replace(/[.,!?;:"'()[\]{}]/g, '').replace(/[—–]/g, '').toLowerCase();
    if (!k) continue;
    if (seen.has(k)) {
      throw new Error(`Spoken VO repeats the word "${k}". Not one word may repeat. Re-import 150-pb-pep-scenes.`);
    }
    seen.add(k);
  }
  const n = text.split(/\s+/).filter(Boolean).length;
  if (n < 142 || n > 150) {
    throw new Error(`Spoken VO is ${n} words (~${(n / 2.51).toFixed(1)}s). Need 142–150 words (55–60s). Re-import 150-pb-pep-scenes.`);
  }
  return JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.45, similarity_boost: 0.8 }
  });
})() }}
```

**Request preview must show real sheet `voice_over` words for that beat.** Item 0 is Beat A. If preview shows `$('prep_pep_beats')` or `tts_text`, fx is off or the old JSON blob is still pasted. Do **not** hardcode a spoken line.

**Expect output:** Binary property named `data` (audio/mpeg).

---

## Node: `fal_upload_tts_initiate`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `fal_upload_tts_initiate` |
| Method | `POST` |
| URL | `https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3` |
| Authentication | Generic Credential Type → Header Auth **or** fal.ai API credential |
| Auth header | `Authorization` = `Key YOUR_FAL_KEY` *(same key as Kling)* |
| Send Query Parameters | OFF |
| Send Headers | ON (if not using credential that already sets Auth) |
| Header Name | `Content-Type` |
| Header Value | `application/json` |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |
| JSON Body | see block below |
| Options → Response → Response Format | Autodetect / JSON |
| Options → Response → Include Response Headers and Status | OFF |
| Options → Timeout | `60000` |

**JSON Body:**
```json
{
  "content_type": "audio/mpeg",
  "file_name": "={{ 'pep-' + String($('split_pep_beats').item.json.creation_id || $('prep_pep_beats').item.json.creation_id || 'run') + '-' + String($('split_pep_beats').item.json.beat || 'a') + '-' + String($now.toMillis()) + '.mp3' }}"
}
```

**Expect output JSON:**
- `upload_url` (signed PUT URL)
- `file_url` (public fal CDN URL — this is OmniHuman `audio_url`)

---

## Node: `merge_tts_binary`

| Parameter | Value |
|---|---|
| Node type | Code |
| Exact name | `merge_tts_binary` |
| Mode | Run Once for All Items |
| Language | JavaScript |

```javascript
const initiates = $input.all();
const ttsItems = $('tts_pep_voice_over').all();
let splits = [];
try {
  splits = $('split_pep_beats').all();
} catch (e) {
  splits = [];
}

if (initiates.length !== ttsItems.length) {
  throw new Error(
    `TTS/initiate count mismatch: ${ttsItems.length} TTS vs ${initiates.length} initiate`
  );
}

return initiates.map((initiate, i) => {
  const tts = ttsItems[i];
  const split = splits[i] || { json: {} };
  if (!tts.binary || !tts.binary.data) {
    throw new Error(
      `No binary data on tts_pep_voice_over item ${i} (beat ${split.json?.beat || '?'})`
    );
  }
  return {
    json: {
      ...(split.json || {}),
      ...(initiate.json || {}),
      beat: split.json?.beat || initiate.json?.beat || 'a',
      creation_id: split.json?.creation_id || initiate.json?.creation_id,
    },
    binary: tts.binary,
  };
});
```

Canonical file: `marketing/n8n-pep-merge-tts-binary.js`. Do **not** use `.first()` — that glues Beat A audio onto every clip.

---

## Node: `fal_upload_tts_put`

| Parameter | Value |
|---|---|
| Node type | HTTP Request |
| Exact name | `fal_upload_tts_put` |
| Method | `PUT` |
| URL | `={{ $('fal_upload_tts_initiate').item.json.upload_url }}` |
| Authentication | None *(signed URL already has auth)* |
| Send Headers | ON |
| Header 1 Name | `Content-Type` |
| Header 1 Value | `audio/mpeg` |
| Send Body | ON |
| Body Content Type | n8n Binary File |
| Input Data Field Name | `data` |
| Options → Timeout | `120000` |

**Expect:** HTTP 200. Binary uploaded to fal. OmniHuman reads `fal_upload_tts_initiate.file_url`.

---

## Node: `prep_pep_lipsync`

| Parameter | fx | Value |
|---|---|---|
| Node type | — | Code |
| Exact name | — | `prep_pep_lipsync` |
| Mode | — | **Run Once for Each Item** |
| Language | — | JavaScript |

Do **not** use Run Once for All Items. Do **not** `return [{ json: ... }]`.

Wire: `save_still_url` → `prep_pep_lipsync` → `pep_lipsync_fal`

Paste the full file `marketing/n8n-pep-prep-lipsync.js`.

**Expect OUTPUT fields:** `lipsync_image_in` (xAI still URL), `lipsync_audio_in` (fal CDN), `omnihuman_prompt`, `omnihuman_resolution` = `720p`.

---

## FAL NODE: `pep_lipsync_fal`

This is the official fal.ai community node (`@fal-ai/n8n-nodes-fal`), not HTTP Request.

**Model Parameters** — click **Add Parameter** exactly **4** times. **Parameter Name or ID** is the dropdown (**fx OFF**). Pick **Image [string]**, **Audio [string]**, **Resolution**, **Prompt [string]**. Do not add a fifth row.

| # | Parameter Name or ID dropdown (fx OFF) | Value fx | Value |
|---|---|---|---|
| 1 | **Image [string]** (`image_url`) | ON | `={{ $('save_still_url').item.json.reel_still_url }}` |
| 2 | **Audio [string]** (`audio_url`) | ON | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| 3 | **Resolution** (`resolution`) | OFF | `720p` |
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

Do **not** send `video_url`. That is sync-3 / VEED / Kling lipsync / LatentSync. Do **not** hardcode Audio Url.

If n8n errors `[ERROR: No path back to node]` on `$('save_still_url')`, fall back to `$json.lipsync_image_in` / `$json.lipsync_audio_in` from `prep_pep_lipsync` (same URLs).

**Expect OUTPUT:** `{ "video": { "url": "https://..." } }`

---

## SET: `save_lipsync_video_url`

| Parameter | Value |
|---|---|
| Node type | Set / Edit Fields |
| Exact name | `save_lipsync_video_url` |
| Mode | Manual Mapping |
| Include Other Input Fields | **OFF** |

| Field Name | Field Type | fx | Value |
|---|---|---|---|
| `lipsync_video_url` | String | ON | `={{ $json.video.url }}` |
| `video_url` | String | ON | `={{ $json.video.url }}` |
| `tts_audio_url` | String | ON | `={{ $('fal_upload_tts_initiate').item.json.file_url }}` |
| `creation_id` | String | ON | `={{ $('split_pep_beats').item.json.creation_id \|\| $('prep_pep_beats').item.json.creation_id }}` |
| `beat` | String | ON | `={{ $('split_pep_beats').item.json.beat }}` |
| `model_video` | String | OFF | `fal-omnihuman-v1.5` |

**Wire next:** `save_lipsync_video_url` → **`(gather_pep_clips)`** → `sheets_update_creation`

Paste `marketing/n8n-pep-gather-clips.js` into `(gather_pep_clips)` (All Items). Two scene cuts, not a 60s blend. Canvas list: `marketing/n8n-pep-60s-1080-execute.md`.

---

## Pin / unpin for a unique-scene production Test

**Pin** = n8n “Pin data” (thumbtack on OUTPUT). Saving params is free. **Test workflow** is what bills APIs.

Each execution must pick a **new unused sheet row** and generate a **new still + new VO + new OmniHuman clip**.

**NEVER PIN:** `grok_imagine_reel_still`, `tts_pep_voice_over`, `pep_lipsync_fal`

**UNPIN (unique scene + unique VO):** `get_rows_in_sheet`, `filter_active`, `sort_rotation`, `Limit`, `Prep_day_variant`, `grok_api`, `parse_grok`, `if_complaince`, `get_blocking_pool`, `prep_pep_beats`, `split_pep_beats`, `tts_pep_voice_over`, `fal_upload_tts_initiate`, `merge_tts_binary`, `fal_upload_tts_put`, `grok_imagine_reel_still`, `save_still_url`, `prep_pep_lipsync`, `pep_lipsync_fal`, `save_lipsync_video_url`, `gather_pep_clips`, `sheets_update_creation`

**PIN (skip Kling bill):** `prep_grok_video_start`, `ai_vid_generator`, `Wait2`, `Wait`, `grok_video_poll`, `kling_video_result`, `save_video_url`

Leave disconnected: `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`, `kling_video_request`.

Confirm `fal_upload_tts_initiate.file_url` is a fal CDN URL (not Catbox). Confirm `save_still_url.reel_still_url` is an xAI still (not Catbox). Mouth on the still is open mid-word.

Then **Test workflow** once. Wait up to ~1200s. QC: unique scene, unique VO, mouth moves with speech, no thumbs-up.

---

## Checklist before Test workflow

- [ ] `sort_rotation` sorts `times_used` ASC then `last_used_at` ASC
- [ ] `Limit` Max Items = `1`
- [ ] `tts_pep_voice_over` JSON Body fx **ON**, paste starts with `={{ (() => {` — request preview is that beat’s sheet VO, **not** `$('prep_pep_beats')`
- [ ] `fal_upload_tts_initiate` `file_name` includes `creation_id` **and** `beat` (`pep-{{creation_id}}-{{beat}}-{{timestamp}}.mp3`)
- [ ] `(split_pep_beats)` OUTPUT is 4 items with unique `pep_body_action`
- [ ] `(gather_pep_clips)` is after `save_lipsync_video_url` so sheets write once
- [ ] `pep_lipsync_fal` Model = **OmniHuman / Omnihuman v1.5** (not sync-3 / VEED / Kling lipsync / LatentSync)
- [ ] `image_url` = `={{ $('save_still_url').item.json.reel_still_url }}`
- [ ] `audio_url` = `={{ $('fal_upload_tts_initiate').item.json.file_url }}` — **not hardcoded**
- [ ] `resolution` = `720p`
- [ ] Wait for Completion **ON**, Max Wait Time = `1200`
- [ ] `pep_lipsync_fal` Prompt Value fx ON = `={{ String($('prep_pep_lipsync').item.json.omnihuman_prompt) }}`
- [ ] `prep_pep_beats` Mode = Run Once for Each Item, returns a plain object
- [ ] `prep_pep_beats` OUTPUT shows `pep_body_action`, `pep_hand_gesture`, `pose_still` (not the same walk every run)
- [ ] `(get_blocking_pool)` is a side branch from `Schedule Trigger`, tab `pep-blocking-pool`
- [ ] `save_lipsync_video_url` Include Other Input Fields **OFF**
- [ ] `creation_id` fx **ON**
- [ ] `sheets_update_creation` writes `last_used_at` + `times_used`
- [ ] Kling chain is pinned / disconnected so it does not bill
- [ ] Disconnected: `fal_lipsync_call`, `Wait3`, `pep_lipsync_poll`, `pep_lip_sync_result`
- [ ] Do **not** pin `grok_imagine_reel_still`, `tts_pep_voice_over`, or `pep_lipsync_fal`
