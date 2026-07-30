# n8n Video Reels — Step-by-step node build

Do these **in order**. Each step says **DUPLICATE** or **CREATE FROM SCRATCH**, plus the **n8n node type**.  
**New nodes use lowercase names only** (example: `lower_case_node`).  
Exact canvas names matter for `$('node_name')` expressions.

### Assumed existing chain (already working — keep these names)
```text
Schedule → Sheets → Limit → Prep_day_variant → Edit Fields → GROK_HTTP
  → Parse_Grok → GROK_Imagine → Grok_imagine_story → Save_render_URL
  → Buffer_post_IG → Buffer_post_FB → (stories optional) → Sheets_writeback
```

### Target chain after this guide
```text
… → Grok_imagine_story
  → grok_imagine_reel_still      ← NEW (HTTP Request)
  → Save_render_URL              ← EDIT existing
  → grok_video_start             ← NEW (HTTP Request)
  → wait_video                   ← NEW (Wait)
  → grok_video_poll              ← NEW (HTTP Request)
  → if_video_ready               ← NEW (IF)
       ├─ pending → loop wait_video
       ├─ failed  → stop
       └─ done → save_video_url  ← NEW (Edit Fields)
            → buffer_ig_reel     ← NEW (HTTP Request)
            → buffer_fb_reel     ← NEW (HTTP Request)
            → buffer_tt_reel     ← NEW (HTTP Request, TikTok later)
            → Buffer_post_IG     ← existing
            → … → Sheets_writeback ← EDIT existing
```

### New nodes — quick list (name · type · how)

| New node name | n8n node type | How to make it |
|---|---|---|
| `grok_imagine_reel_still` | **HTTP Request** | **DUPLICATE** `Grok_imagine_story` |
| `grok_video_start` | **HTTP Request** | **DUPLICATE** `GROK_Imagine` |
| `wait_video` | **Wait** | **CREATE FROM SCRATCH** |
| `grok_video_poll` | **HTTP Request** | **DUPLICATE** `grok_video_start` |
| `if_video_ready` | **IF** | **CREATE FROM SCRATCH** |
| `save_video_url` | **Edit Fields** (Set) | **DUPLICATE** `Save_render_URL` |
| `buffer_ig_reel` | **HTTP Request** | **DUPLICATE** your working IG Buffer HTTP node |
| `buffer_fb_reel` | **HTTP Request** | **DUPLICATE** `buffer_ig_reel` |
| `buffer_tt_reel` | **HTTP Request** | **DUPLICATE** `buffer_fb_reel` (later) |

Edits only (not new nodes): `Prep_day_variant`, `Save_render_URL`, `Sheets_writeback`.

---

## STEP 0 — Prep_day_variant (EDIT existing — do not create new)

**Node type:** Edit Fields (Set) — existing  
**Action:** Open `Prep_day_variant` → add 2 fields (Include Other Input Fields = **ON**)

### Field 1
| Setting | Value |
|---|---|
| Name | `daily_video_format` |
| Value (fx ON) | below |

```text
{{ ({1:'Vial Identity Macro',2:'Chemistry Class Spec',3:'Synthesis Prototype',4:'Assay Engineering Bench',5:'Lab Catalog Atmosphere',6:'Research Seal Lab',7:'Precision Glass Close'})[$now.weekday] || 'Vial Identity Macro' }}
```

### Field 2
| Setting | Value |
|---|---|
| Name | `daily_motion_brief` |
| Value (fx ON) | below |

```text
{{ ({1:'Slow push-in on photoreal research vial; blue rim light sweep; compound name hold',2:'Gentle lateral slide across chemistry glassware; focus pull to class line; refraction',3:'Orbit a synthesis / prototype lab setup with vial hero; engineering calm; no use demo',4:'Bench dolly past assay instruments and vial rack; subtle LED glow; sterile health-science mood',5:'Rise onto acrylic riser with vial + lab props; settle; catalog CTA end card',6:'Calm hold on sealed research vial in lab; research-use seal fades in final 2 seconds',7:'Extreme macro vial glass / meniscus; micro push; premium quiet chemistry close'})[$now.weekday] || 'Slow push-in; photoreal vial lab catalog film' }}
```

### Field 3 — uniqueness (required so re-runs same day still differ)
| Setting | Value |
|---|---|
| Name | `unique_run_stamp` |
| Value (fx ON) | below |

```text
{{ $now.toISO() + '-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0') }}
```

### Field 4 — unique camera / light variation
| Setting | Value |
|---|---|
| Name | `daily_camera_variant` |
| Value (fx ON) | below |

```text
{{ ({1:'camera starts slightly LOW-LEFT, push-in toward vial label',2:'camera starts HIGH-RIGHT, slow lateral slide across glassware',3:'camera orbits CLOCKWISE ~15 degrees around vial / synthesis setup',4:'camera dolly LEFT-TO-RIGHT across assay bench plane',5:'camera rises from BELOW riser then settles eye-level on vial',6:'locked tripod, vial scale breathes via focus pull only',7:'extreme MACRO start on vial glass edge, micro push to compound name'})[$now.weekday] || 'slow push-in on vial' }}
```

**Test:** Execute `Prep_day_variant` → all four video fields appear; `unique_run_stamp` changes every run.

---

## STEP 1 — `grok_imagine_reel_still`

| | |
|---|---|
| **Node type** | **HTTP Request** |
| **Action** | **DUPLICATE** `Grok_imagine_story` |
| **Rename to** | `grok_imagine_reel_still` |
| **Wire** | After `Grok_imagine_story` → Before `Save_render_URL` |

### Keep from the duplicate
- Same xAI Bearer auth  
- Same Imagine URL: `POST https://api.x.ai/v1/images/generations`  
- Method POST, JSON body, fx ON  

### Replace Body (fx ON)

```text
{{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  aspect_ratio: '9:16',
  n: 1,
  prompt: [
    'Photoreal vertical 9:16 laboratory science catalog still for Palm Beach Vitality.',
    'HERO SUBJECT (required): a clear research vial of ' + String($('Parse_Grok').item.json.display_name || $('Limit').item.json.compound_name || 'research compound') + ' as laboratory research material.',
    'SCENE WORLD (required — pick and combine): science lab, chemistry glassware, synthesis bench, engineering / prototype fixtures, assay instruments, sterile health-science research atmosphere, HPLC-adjacent gear, pipettes on a rack (unused), beakers, flasks, vial racks, acrylic risers, cool instrument panels.',
    'Compose for today format: ' + String($('Prep_day_variant').item.json.daily_video_format || 'Vial Identity Macro') + '.',
    'Motion intent for later animation: ' + String($('Prep_day_variant').item.json.daily_motion_brief || '') + '.',
    'Camera / light variant: ' + String($('Prep_day_variant').item.json.daily_camera_variant || '') + '.',
    'Unique run stamp (do not print on image): ' + String($('Prep_day_variant').item.json.unique_run_stamp || '') + '.',
    'Environment look: dark premium American research lab, cool electric-blue rim lighting, soft haze, realistic glass refraction, shallow depth of field.',
    'TYPOGRAPHY RULES: Use ONLY these exact strings. Do not invent other words.',
    'Exact headline: ' + String($('Parse_Grok').item.json.figma_headline || $('Parse_Grok').item.json.display_name || '') + '.',
    'Exact subhead: ' + String($('Parse_Grok').item.json.figma_subhead || '') + '.',
    'Brand wordmark exactly: PALM BEACH VITALITY',
    'Footer exactly: FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE.',
    'Tiny date exactly: ' + $now.toISODate() + '.',
    'HARD BAN — never depict: pens, pen injectors, autoinjectors, writing pens, pencils, markers, syringes in use, needles, injection acts, people, hands, clinics, gyms, lifestyle, before/after, wellness icons.',
    'Ignore product_form if it says Pen — always show a research VIAL, never a pen.',
    'No nicknames (no KLOW, Wolverine, GLOW). No purity percentages unless in input. No FDA approval claims.',
    'Look like a high-end laboratory science / chemistry / engineering catalog photo, not an illustration, not a flat graphic poster.'
  ].join(' ')
}) }}
```

**Test:** `data[0].url` is a photoreal product still.

---

## STEP 2 — Save_render_URL (EDIT existing — do not create new)

**Node type:** Edit Fields (Set) — existing  
**Wire:** After `grok_imagine_reel_still`

### Add one field
| Name | Value (fx ON) |
|---|---|
| `reel_still_url` | `{{ $('grok_imagine_reel_still').item.json.data[0].url }}` |

Keep existing image/caption fields.  
If story URL used `$json.data[0].url`, change it to `$('Grok_imagine_story').item.json.data[0].url`.

**Test:** `reel_still_url` is a full https URL.

---

## STEP 3 — `grok_video_start`

| | |
|---|---|
| **Node type** | **HTTP Request** |
| **Action** | **DUPLICATE** `GROK_Imagine` |
| **Rename to** | `grok_video_start` |
| **Wire** | After `Save_render_URL` → Before `wait_video` |

### Change settings
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
    'Animate this photoreal Palm Beach Vitality laboratory science still into an 8-second premium vertical research catalog film.',
    'Keep the research VIAL and lab / chemistry / synthesis / engineering / prototype props exactly as in the source image.',
    'Camera: ' + String($('Prep_day_variant').item.json.daily_camera_variant || 'slow cinematic push-in with subtle parallax') + '.',
    'Lighting: cool electric-blue rim light, soft volumetric haze, realistic glass refraction.',
    'Motion: ' + String($('Prep_day_variant').item.json.daily_motion_brief || 'gentle vial settle, light sweep across glassware, faint dust motes') + '.',
    'Scene mood: science, lab, health-science research, chemistry, engineering, synthesis, prototype — sterile and premium.',
    'Keep vial identity, label geometry, and all typography sharp and unchanged.',
    'On-screen text must remain exactly as in the source image — do not invent new words, claims, percentages, or approvals.',
    'HARD BAN — do not add: pens, pen injectors, autoinjectors, writing pens, syringes, needles, injection, people, hands, clinics, gyms, lifestyle, before/after.',
    'No voiceover and no spoken words. Ambient lab sound only or silent.',
    'Mood: expensive American research catalog, precise, sterile, premium.',
    'End on a clean hold of the compound name with laboratory research-use framing.',
    'Today format: ' + String($('Prep_day_variant').item.json.daily_video_format || 'Vial Identity Macro') + '.',
    'Unique run: ' + String($('Prep_day_variant').item.json.unique_run_stamp || '') + '.'
  ].join(' '),
  image: { url: String($('Save_render_URL').item.json.reel_still_url || '') },
  duration: 8,
  aspect_ratio: '9:16',
  resolution: '720p'
}) }}
```

**Test:** Response includes `request_id`.  
If API errors on `aspect_ratio` / `resolution`, remove those keys and retry.

---

## STEP 4 — `wait_video`

| | |
|---|---|
| **Node type** | **Wait** |
| **Action** | **CREATE FROM SCRATCH** |
| **Rename to** | `wait_video` |
| **Wire** | After `grok_video_start` → Before `grok_video_poll` |

| Setting | Value |
|---|---|
| Resume | After Time Interval |
| Wait Amount | `10` |
| Wait Unit | Seconds |

---

## STEP 5 — `grok_video_poll`

| | |
|---|---|
| **Node type** | **HTTP Request** |
| **Action** | **DUPLICATE** `grok_video_start` |
| **Rename to** | `grok_video_poll` |
| **Wire** | After `wait_video` → Before `if_video_ready` |

### Change settings
| Setting | Value |
|---|---|
| Method | `GET` |
| URL (fx ON) | below |
| Body | **none** (clear it) |

```text
https://api.x.ai/v1/videos/{{ $('grok_video_start').item.json.request_id }}
```

If Start nests the id differently (e.g. `json.id`), fix after first smoke.

**Test:** `status` is `pending` / `done` / `failed`.

---

## STEP 6 — `if_video_ready`

| | |
|---|---|
| **Node type** | **IF** |
| **Action** | **CREATE FROM SCRATCH** |
| **Rename to** | `if_video_ready` |
| **Wire** | After `grok_video_poll` |

### Condition
| | |
|---|---|
| Value 1 (fx ON) | `{{ $json.status }}` |
| Operation | Equal |
| Value 2 | `done` |

### Branches
1. **True (done)** → `save_video_url`  
2. **False** → for starter: stop / re-run; later loop false → `wait_video`  

---

## STEP 7 — `save_video_url`

| | |
|---|---|
| **Node type** | **Edit Fields** (Set) |
| **Action** | **DUPLICATE** `Save_render_URL` |
| **Rename to** | `save_video_url` |
| **Wire** | After `if_video_ready` true → Before `buffer_ig_reel` |

Include Other Input Fields = **ON** (or remap captions from `$('Save_render_URL')`).

### Fields

| Name | Value (fx ON) |
|---|---|
| `video_url` | `{{ $('grok_video_poll').item.json.video.url }}` |
| `video_request_id` | `{{ $('grok_video_start').item.json.request_id }}` |
| `video_model` | `grok-imagine-video-1.5` |
| `video_seconds` | `8` |
| `reel_still_url` | `{{ $('Save_render_URL').item.json.reel_still_url }}` |
| `ig_caption_draft` | `{{ $('Save_render_URL').item.json.ig_caption_draft }}` |
| `fb_caption_draft` | `{{ $('Save_render_URL').item.json.fb_caption_draft }}` |

If poll nests as `json.url` instead of `json.video.url`, fix after first `done`.

**Test:** Open `video_url` — 8s vertical photoreal clip.

---

## STEP 8 — `buffer_ig_reel`

| | |
|---|---|
| **Node type** | **HTTP Request** |
| **Action** | **DUPLICATE** `Buffer_post_IG` (or your working IG Buffer HTTP node) |
| **Rename to** | `buffer_ig_reel` |
| **Wire** | After `save_video_url` → Before `buffer_fb_reel` |

Keep: `POST https://api.buffer.com`, Buffer auth, JSON body fx ON.

### Body (fx ON)

```text
{{ JSON.stringify({
  query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }',
  variables: {
    input: {
      text: String($('save_video_url').item.json.ig_caption_draft || $('Save_render_URL').item.json.ig_caption_draft || ''),
      channelId: '6a668d534b2d03035f478536',
      schedulingType: 'automatic',
      mode: 'addToQueue',
      metadata: { instagram: { type: 'reel', shouldShareToFeed: true } },
      assets: [{ video: { url: String($('save_video_url').item.json.video_url || '') } }]
    }
  }
}) }}
```

**Test:** PostActionSuccess + `post.id`.

---

## STEP 9 — `buffer_fb_reel`

| | |
|---|---|
| **Node type** | **HTTP Request** |
| **Action** | **DUPLICATE** `buffer_ig_reel` |
| **Rename to** | `buffer_fb_reel` |
| **Wire** | After `buffer_ig_reel` → Before TikTok or Sheets |

### Body (fx ON)

```text
{{ JSON.stringify({
  query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }',
  variables: {
    input: {
      text: String($('save_video_url').item.json.fb_caption_draft || $('Save_render_URL').item.json.fb_caption_draft || ''),
      channelId: '6a668d6b4b2d03035f478575',
      schedulingType: 'automatic',
      mode: 'addToQueue',
      metadata: { facebook: { type: 'reel' } },
      assets: [{ video: { url: String($('save_video_url').item.json.video_url || '') } }]
    }
  }
}) }}
```

---

## STEP 10 — `buffer_tt_reel` (only if TikTok connected)

| | |
|---|---|
| **Node type** | **HTTP Request** |
| **Action** | **DUPLICATE** `buffer_fb_reel` |
| **Rename to** | `buffer_tt_reel` |
| **Wire** | After `buffer_fb_reel` → Before Sheets_writeback |

Paste TikTok `channelId` from Buffer. Skip until connected.

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
      assets: [{ video: { url: String($('save_video_url').item.json.video_url || '') } }]
    }
  }
}) }}
```

---

## STEP 11 — Sheets_writeback (EDIT existing — do not create new)

**Node type:** Google Sheets — existing  
**Wire:** End of chain after reel Buffer nodes

| Sheet column | n8n value (fx) |
|---|---|
| `reel_still_url` | `{{ $('save_video_url').item.json.reel_still_url }}` |
| `video_url` | `{{ $('save_video_url').item.json.video_url }}` |
| `video_request_id` | `{{ $('save_video_url').item.json.video_request_id }}` |
| `video_model` | `grok-imagine-video-1.5` |
| `video_seconds` | `8` |
| `daily_video_format` | `{{ $('Prep_day_variant').item.json.daily_video_format }}` |
| `buffer_ig_reel_id` | from `buffer_ig_reel` response `post.id` path |
| `buffer_fb_reel_id` | from `buffer_fb_reel` |
| `buffer_tt_reel_id` | from `buffer_tt_reel` if used |

---

## STEP 12 — Optional: keep or pause old image Buffer posts

**A)** Keep image feed + video Reels  
**B)** Disconnect `Buffer_post_IG` / `Buffer_post_FB` temporarily  

Start with **A** for 2–3 days.

---

## Smoke-test checklist

1. Prep has `daily_video_format` + `daily_motion_brief`  
2. `grok_imagine_reel_still` → photoreal URL  
3. `grok_video_start` → `request_id`  
4. `grok_video_poll` → `status: done` + playable `video.url`  
5. No people / needles / claims in video  
6. `buffer_ig_reel` + `buffer_fb_reel` success  
7. Captions end with full disclaimer  
8. Sheets writeback updated  

---

## Quick reference

| Node name | n8n type | Duplicate / Scratch / Edit | Source |
|---|---|---|---|
| `Prep_day_variant` | Edit Fields | **EDIT** | existing |
| `grok_imagine_reel_still` | **HTTP Request** | **DUPLICATE** | `Grok_imagine_story` |
| `Save_render_URL` | Edit Fields | **EDIT** | add `reel_still_url` |
| `grok_video_start` | **HTTP Request** | **DUPLICATE** | `GROK_Imagine` |
| `wait_video` | **Wait** | **CREATE FROM SCRATCH** | — |
| `grok_video_poll` | **HTTP Request** | **DUPLICATE** | `grok_video_start` |
| `if_video_ready` | **IF** | **CREATE FROM SCRATCH** | — |
| `save_video_url` | **Edit Fields** | **DUPLICATE** | `Save_render_URL` |
| `buffer_ig_reel` | **HTTP Request** | **DUPLICATE** | working IG Buffer HTTP |
| `buffer_fb_reel` | **HTTP Request** | **DUPLICATE** | `buffer_ig_reel` |
| `buffer_tt_reel` | **HTTP Request** | **DUPLICATE** (later) | `buffer_fb_reel` |
| `Sheets_writeback` | Google Sheets | **EDIT** | add video columns |

**Naming rule for all new nodes:** `lower_case_with_underscores` only.

---

## FDA reminder
Chemical names only. Laboratory research use only. Not for human use. Full disclaimer at end of IG + FB + TikTok captions. No nicknames. No efficacy claims on video or caption.
