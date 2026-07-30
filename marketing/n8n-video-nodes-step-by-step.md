# n8n Video Reels — Step-by-step node build

Do these **in order**. Each step says **DUPLICATE** or **CREATE FROM SCRATCH**.  
Exact canvas names matter for `$('NodeName')` expressions.

### Assumed existing chain (already working)
```text
Schedule → Sheets → Limit → Prep_day_variant → Edit Fields → GROK_HTTP
  → Parse_Grok → GROK_Imagine → Grok_imagine_story → Save_render_URL
  → Buffer_post_IG → Buffer_post_FB → (stories optional) → Sheets_writeback
```

### Target chain after this guide
```text
… → Grok_imagine_story
  → Grok_Imagine_Reel_Still          ← NEW
  → Save_render_URL                  ← EDIT (not new)
  → Grok_Video_Start                 ← NEW
  → Wait_Video                       ← NEW
  → Grok_Video_Poll                  ← NEW
  → IF_Video_Ready                   ← NEW
       ├─ (pending) loop back to Wait_Video
       ├─ (failed) stop / notify
       └─ (done) Save_video_URL      ← NEW
            → Buffer_IG_Reel         ← NEW
            → Buffer_FB_Reel         ← NEW
            → Buffer_TT_Reel         ← NEW (only if TikTok connected)
            → Buffer_post_IG         ← existing (keep or disconnect later)
            → … → Sheets_writeback   ← EDIT
```

---

## STEP 0 — Prep_day_variant (EDIT existing — do not create new)

**Type:** Edit existing node  
**Action:** Open `Prep_day_variant` → add 2 fields (Include Other Input Fields = **ON**)

### Field 1 — create new field in this node
| Setting | Value |
|---|---|
| Name | `daily_video_format` |
| Value (fx ON) | see below |

```text
{{ ({1:'Identity Macro',2:'Class Spec',3:'Format Proof',4:'Assay Bench',5:'Catalog Drop',6:'Research Seal',7:'Precision Close'})[$now.weekday] || 'Identity Macro' }}
```

### Field 2 — create new field in this node
| Setting | Value |
|---|---|
| Name | `daily_motion_brief` |
| Value (fx ON) | see below |

```text
{{ ({1:'Slow push-in on photoreal product; blue rim light sweep; name hold',2:'Gentle lateral slide; focus pull to class line; glass refraction',3:'Orbit product; emphasize pen/vial format typography; no use demo',4:'Bench dolly; subtle instrument glow; assay-context calm',5:'Rise onto acrylic riser; settle; catalog CTA end card',6:'Calm hold; research-use seal fades in final 2 seconds',7:'Extreme macro glass; micro push; premium quiet close'})[$now.weekday] || 'Slow push-in; photoreal lab catalog film' }}
```

**Test:** Execute `Prep_day_variant` only → confirm both fields appear.

---

## STEP 1 — Grok_Imagine_Reel_Still

**Action:** **DUPLICATE** node `Grok_imagine_story`  
**Rename to:** `Grok_Imagine_Reel_Still`  
**Wire:** After `Grok_imagine_story` → Before `Save_render_URL`  
(Disconnect `Grok_imagine_story` → `Save_render_URL`, insert this in between.)

### Keep from the duplicate
- Same credential / auth as Imagine (xAI Bearer)
- Same URL as Imagine images (`POST https://api.x.ai/v1/images/generations` — same as your other Imagine nodes)
- Method POST, JSON body, fx ON

### Change the Body (fx ON) — replace whole body with this

```text
{{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  aspect_ratio: '9:16',
  n: 1,
  prompt: [
    'Photoreal vertical 9:16 product catalog still for Palm Beach Vitality.',
    'Subject: ' + String($('Limit').item.json.product_form || $('Parse_Grok').item.json.product_form || 'research vial') + ' of ' + String($('Parse_Grok').item.json.display_name || $('Limit').item.json.compound_name || 'research compound') + ' as laboratory research material on a clear acrylic riser.',
    'Environment: dark premium American research lab, cool electric-blue rim lighting, soft haze, realistic glass refraction, shallow depth of field.',
    'Today video format: ' + String($('Prep_day_variant').item.json.daily_video_format || '') + '.',
    'Motion intent for later animation (compose the still for this): ' + String($('Prep_day_variant').item.json.daily_motion_brief || '') + '.',
    'TYPOGRAPHY RULES: Use ONLY these exact strings. Do not invent other words.',
    'Exact headline: ' + String($('Parse_Grok').item.json.figma_headline || $('Parse_Grok').item.json.display_name || '') + '.',
    'Exact subhead: ' + String($('Parse_Grok').item.json.figma_subhead || '') + '.',
    'Brand wordmark exactly: PALM BEACH VITALITY',
    'Footer exactly: FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE.',
    'Tiny date exactly: ' + $now.toISODate() + '.',
    'No people, no hands, no needles, no injection, no clinic, no gym, no lifestyle, no before/after, no wellness icons.',
    'No nicknames (no KLOW, Wolverine, GLOW). No purity percentages unless in input. No FDA approval claims.',
    'Look like a high-end e-commerce lab catalog photo, not an illustration, not a flat graphic poster.'
  ].join(' ')
}) }}
```

**Test:** Run through this node → confirm `data[0].url` is a photoreal product still.

---

## STEP 2 — Save_render_URL (EDIT existing — do not create new)

**Action:** Open existing `Save_render_URL`  
**Wire:** Should now sit after `Grok_Imagine_Reel_Still`

### Add one new field
| Name | Value (fx ON) |
|---|---|
| `reel_still_url` | `{{ $('Grok_Imagine_Reel_Still').item.json.data[0].url }}` |

Keep existing fields (`spotlight_image_url`, `story_image_url`, captions, etc.).

**Important:** Because Save now comes after Reel Still, any field that used `$json.data[0].url` for the story image must use `$('Grok_imagine_story')...` instead (case-sensitive exact name).

**Test:** Execute Save → confirm `reel_still_url` is a full https URL.

---

## STEP 3 — Grok_Video_Start

**Action:** **DUPLICATE** your `GROK_Imagine` HTTP Request node (easiest way to keep xAI auth)  
**Rename to:** `Grok_Video_Start`  
**Wire:** After `Save_render_URL` → Before new Wait node  
(Do **not** delete your Buffer image path yet — for first smoke, you can temporarily disconnect Buffer and only run video.)

### Change these settings on the duplicate
| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/videos/generations` |
| Auth | same xAI Bearer as Imagine |
| Body Content Type | JSON |
| Body (fx ON) | below |

```text
{{ JSON.stringify({
  model: 'grok-imagine-video-1.5',
  prompt: [
    'Animate this photoreal Palm Beach Vitality laboratory research product still into an 8-second premium vertical catalog film.',
    'Camera: slow cinematic push-in with subtle parallax.',
    'Lighting: cool electric-blue rim light, soft volumetric haze, realistic glass refraction.',
    'Motion: ' + String($('Prep_day_variant').item.json.daily_motion_brief || 'gentle product settle, light sweep across glass, faint dust motes') + '.',
    'Keep product identity, label geometry, and all typography sharp and unchanged.',
    'On-screen text must remain exactly as in the source image — do not invent new words, claims, percentages, or approvals.',
    'No people, no hands, no needles, no injection, no clinic, no gym, no lifestyle scenes, no before/after.',
    'No voiceover and no spoken words. Ambient lab sound only or silent.',
    'Mood: expensive American research catalog, precise, sterile, premium.',
    'End on a clean hold of the compound name with laboratory research-use framing.',
    'Today format: ' + String($('Prep_day_variant').item.json.daily_video_format || 'Identity Macro') + '.'
  ].join(' '),
  image: { url: String($('Save_render_URL').item.json.reel_still_url || '') },
  duration: 8,
  aspect_ratio: '9:16',
  resolution: '720p'
}) }}
```

**Test:** Execute → response must include `request_id` (or equivalent id field).  
If the API errors on `aspect_ratio` / `resolution`, remove those two keys and retry (some REST shapes only need model/prompt/image/duration).

---

## STEP 4 — Wait_Video

**Action:** **CREATE FROM SCRATCH**  
**Node type:** `Wait`  
**Rename to:** `Wait_Video`  
**Wire:** After `Grok_Video_Start` → Before `Grok_Video_Poll`

| Setting | Value |
|---|---|
| Resume | After Time Interval |
| Wait Amount | `10` |
| Wait Unit | Seconds |

---

## STEP 5 — Grok_Video_Poll

**Action:** **DUPLICATE** `Grok_Video_Start` (keeps auth)  
**Rename to:** `Grok_Video_Poll`  
**Wire:** After `Wait_Video` → Before `IF_Video_Ready`

### Change settings
| Setting | Value |
|---|---|
| Method | `GET` |
| URL (fx ON) | below |
| Body | **none** (clear body) |

**URL (fx ON):**
```text
https://api.x.ai/v1/videos/{{ $('Grok_Video_Start').item.json.request_id }}
```

If your Start response nests the id (e.g. `json.id`), adjust to that path after the first smoke.

**Test:** After Wait, Poll should return `status`: `pending` / `done` / `failed`.

---

## STEP 6 — IF_Video_Ready

**Action:** **CREATE FROM SCRATCH**  
**Node type:** `IF`  
**Rename to:** `IF_Video_Ready`  
**Wire:** After `Grok_Video_Poll`

### Condition
| | |
|---|---|
| Value 1 (fx ON) | `{{ $json.status }}` |
| Operation | Equal |
| Value 2 | `done` |

### Wiring the three outcomes
1. **True (done)** → `Save_video_URL`  
2. **False** → add a second IF or Switch:
   - If `status` is `failed` or `expired` → stop (optional sticky note / no Buffer)  
   - Else (still pending) → wire back to `Wait_Video` (loop)

**Simple starter (recommended first day):**  
Only check `done`. If not done, Wait again manually / re-run. Add the loop after first success.

**Loop version:** False branch → `Wait_Video` (same node). Cap with a counter later so it can’t spin forever.

---

## STEP 7 — Save_video_URL

**Action:** **DUPLICATE** `Save_render_URL` (Edit Fields)  
**Rename to:** `Save_video_URL`  
**Wire:** After `IF_Video_Ready` true branch → Before Buffer Reel nodes

### Turn Include Other Input Fields **ON** (so captions/urls from Save_render_URL stay available if merged — or re-map from `$('Save_render_URL')` in Buffer)

### Set these fields (replace duplicate’s old mappings)

| Name | Value (fx ON) |
|---|---|
| `video_url` | `{{ $('Grok_Video_Poll').item.json.video.url }}` |
| `video_request_id` | `{{ $('Grok_Video_Start').item.json.request_id }}` |
| `video_model` | `grok-imagine-video-1.5` |
| `video_seconds` | `8` |
| `reel_still_url` | `{{ $('Save_render_URL').item.json.reel_still_url }}` |
| `ig_caption_draft` | `{{ $('Save_render_URL').item.json.ig_caption_draft }}` |
| `fb_caption_draft` | `{{ $('Save_render_URL').item.json.fb_caption_draft }}` |

If Poll nests differently (e.g. `json.url` instead of `json.video.url`), fix after first `done` response.

**Test:** Open `video_url` in a browser — confirm 8s vertical clip looks photoreal.

---

## STEP 8 — Buffer_IG_Reel

**Action:** **DUPLICATE** `Buffer_post_IG` (or whatever your working IG HTTP node is named — often `Buffer_post_IG` / `Buffer_post`)  
**Rename to:** `Buffer_IG_Reel`  
**Wire:** After `Save_video_URL` → Before `Buffer_FB_Reel`

### Keep
- `POST https://api.buffer.com`
- Same Buffer auth
- JSON body, fx ON

### Replace Body (fx ON) with this

```text
{{ JSON.stringify({
  query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }',
  variables: {
    input: {
      text: String($('Save_video_URL').item.json.ig_caption_draft || $('Save_render_URL').item.json.ig_caption_draft || ''),
      channelId: '6a668d534b2d03035f478536',
      schedulingType: 'automatic',
      mode: 'addToQueue',
      metadata: { instagram: { type: 'reel', shouldShareToFeed: true } },
      assets: [{ video: { url: String($('Save_video_URL').item.json.video_url || '') } }]
    }
  }
}) }}
```

**Test:** Execute → PostActionSuccess with `post.id`.

---

## STEP 9 — Buffer_FB_Reel

**Action:** **DUPLICATE** `Buffer_IG_Reel`  
**Rename to:** `Buffer_FB_Reel`  
**Wire:** After `Buffer_IG_Reel` → Before TikTok or Sheets

### Change only
- `channelId` → `6a668d6b4b2d03035f478575`
- `metadata` → `{ facebook: { type: 'reel' } }`
- `text` → FB caption

**Body (fx ON):**

```text
{{ JSON.stringify({
  query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }',
  variables: {
    input: {
      text: String($('Save_video_URL').item.json.fb_caption_draft || $('Save_render_URL').item.json.fb_caption_draft || ''),
      channelId: '6a668d6b4b2d03035f478575',
      schedulingType: 'automatic',
      mode: 'addToQueue',
      metadata: { facebook: { type: 'reel' } },
      assets: [{ video: { url: String($('Save_video_URL').item.json.video_url || '') } }]
    }
  }
}) }}
```

---

## STEP 10 — Buffer_TT_Reel (only if TikTok is connected in Buffer)

**Action:** **DUPLICATE** `Buffer_FB_Reel`  
**Rename to:** `Buffer_TT_Reel`  
**Wire:** After `Buffer_FB_Reel` → Before Sheets_writeback

### Before building
1. Buffer → connect TikTok channel  
2. Copy that channel’s ID  
3. Paste into `channelId` below  

### Body (fx ON) — update channelId + caption prefix

```text
{{ JSON.stringify({
  query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }',
  variables: {
    input: {
      text: 'TT — ' + String($('Save_render_URL').item.json.ig_caption_draft || ''),
      channelId: 'PASTE_TIKTOK_CHANNEL_ID_HERE',
      schedulingType: 'automatic',
      mode: 'addToQueue',
      metadata: { tiktok: { } },
      assets: [{ video: { url: String($('Save_video_URL').item.json.video_url || '') } }]
    }
  }
}) }}
```

If Buffer rejects `metadata.tiktok`, try omitting metadata or check Buffer’s TikTok createPost docs for the exact key. The `TT —` prefix avoids duplicate-guard vs IG.

**Skip this whole step** until TikTok is connected — IG + FB Reels can go live without it.

---

## STEP 11 — Sheets_writeback (EDIT existing — do not create new)

**Action:** Edit existing Sheets writeback node  
**Wire:** Keep at end (after Reel Buffer nodes)

### Add / map columns (create columns in Google Sheet first if missing)

| Sheet column | n8n value (fx) |
|---|---|
| `reel_still_url` | `{{ $('Save_video_URL').item.json.reel_still_url }}` |
| `video_url` | `{{ $('Save_video_URL').item.json.video_url }}` |
| `video_request_id` | `{{ $('Save_video_URL').item.json.video_request_id }}` |
| `video_model` | `grok-imagine-video-1.5` |
| `video_seconds` | `8` |
| `daily_video_format` | `{{ $('Prep_day_variant').item.json.daily_video_format }}` |
| `buffer_ig_reel_id` | `{{ $('Buffer_IG_Reel').item.json.data.createPost.post.id }}` (confirm path from response) |
| `buffer_fb_reel_id` | same pattern from `Buffer_FB_Reel` |
| `buffer_tt_reel_id` | from `Buffer_TT_Reel` if used |

Response paths for Buffer IDs can vary — click the Buffer node output once and copy the real `post.id` path.

---

## STEP 12 — Optional: keep or pause old image Buffer posts

For first video week, either:

**A) Keep both** (image feed + video Reel) — more exposure, more cost  
**B) Disconnect** `Buffer_post_IG` / `Buffer_post_FB` image nodes temporarily so only Reels post  

Recommendation: **A for 2–3 days**, then decide.

---

## Smoke-test checklist (do before enabling Schedule)

1. Prep shows `daily_video_format` + `daily_motion_brief`  
2. `Grok_Imagine_Reel_Still` returns photoreal 9:16 URL  
3. `Grok_Video_Start` returns `request_id`  
4. Poll reaches `status: done` and `video.url` plays  
5. Video has **no people / needles / claims**; type matches still  
6. `Buffer_IG_Reel` + `Buffer_FB_Reel` return success ids  
7. Captions still end with full disclaimer  
8. Sheets writeback row updated  

---

## Quick reference — Duplicate vs Scratch

| Node | Duplicate or Scratch? | Source to duplicate |
|---|---|---|
| Prep fields | **EDIT existing** | `Prep_day_variant` |
| `Grok_Imagine_Reel_Still` | **DUPLICATE** | `Grok_imagine_story` |
| `Save_render_URL` | **EDIT existing** | add `reel_still_url` |
| `Grok_Video_Start` | **DUPLICATE** | `GROK_Imagine` (change URL + body) |
| `Wait_Video` | **CREATE FROM SCRATCH** | Wait node |
| `Grok_Video_Poll` | **DUPLICATE** | `Grok_Video_Start` (change to GET) |
| `IF_Video_Ready` | **CREATE FROM SCRATCH** | IF node |
| `Save_video_URL` | **DUPLICATE** | `Save_render_URL` |
| `Buffer_IG_Reel` | **DUPLICATE** | `Buffer_post_IG` / working IG HTTP |
| `Buffer_FB_Reel` | **DUPLICATE** | `Buffer_IG_Reel` |
| `Buffer_TT_Reel` | **DUPLICATE** (later) | `Buffer_FB_Reel` |
| Sheets writeback | **EDIT existing** | add video columns |

---

## FDA reminder (every run)
Chemical names only. Laboratory research use only. Not for human use. Full disclaimer at end of IG + FB + TikTok captions. No nickname packs. No efficacy claims on video or caption.
