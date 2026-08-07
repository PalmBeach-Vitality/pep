# Idea → Image review → Video (Grok) — node plan

**Status:** Ready to build node-by-node  
**Owner:** Sal + cloud agent  
**Branch:** `cursor/idea-to-video-nodes-0b73`

Standalone workflow: type an idea → Grok still (9:16 / 2k) → human Approve/Change gate → type a **video/motion prompt** → animate that still → 15s / 1080p / 9:16 MP4.

House rules from `AGENT_RULEBOOK.md` + live Grok guides (`n8n-video-nodes-step-by-step.md`, `n8n-prep-grok-video-start-landscape.js`, `n8n-image-quality-upgrade.md`):

- New node names: `lower_case_with_underscores`
- One node at a time
- Aspect always **9:16**
- Video: `grok-imagine-video-1.5`, **15s**, **`1080p`** (string, not `1080`)
- Still: `grok-imagine-image-quality`, **`2k`**, **9:16**
- Auth: same xAI Header Auth / Bearer as your working `GROK_Imagine` / `GROK_API` credential
- Poll: `GET /v1/videos/{request_id}` until `status = done`

---

## Target chain

```text
idea_form                 Form Trigger   ← TEXT INPUT #1: idea
  → build_prompt          Edit Fields    wrap idea → image_prompt
  → image_gen             HTTP Request   Grok Imagine still
  → save_still_url        Edit Fields    still_url
  → review_image          Form           Approve / Change (+ what to change)
  → if_change             IF
       true  → adjust_prompt → image_gen   (regen loop)
       false → video_prompt_form           ← TEXT INPUT #2: video prompt
             → grok_video_start            still + typed video prompt
             → wait_video
             → grok_video_poll
             → if_video_ready
                  false → wait_video       (poll loop)
                  true  → save_video_url   final MP4 URL
```

Two typed text inputs (not one hardcoded motion string):

1. **`idea`** on `idea_form` → drives the still  
2. **`video_prompt`** on `video_prompt_form` → drives motion after you approve the still  

---

## Node list

| # | Name | Type | Notes |
|---|---|---|---|
| 1 | `idea_form` | Form Trigger | Field: `idea` (text, required) |
| 2 | `build_prompt` | Edit Fields | Sets `image_prompt` from idea |
| 3 | `image_gen` | HTTP Request | `POST /v1/images/generations` |
| 4 | `save_still_url` | Edit Fields | `still_url` from Imagine response |
| 5 | `review_image` | Form | Shows still; `decision` = Approve / Change; optional `change_notes` |
| 6 | `if_change` | IF | Change → adjust; Approve → video prompt form |
| 7 | `adjust_prompt` | Edit Fields | Appends change notes onto `image_prompt`; wires back to `image_gen` |
| 8 | `video_prompt_form` | Form | Field: `video_prompt` (text, required) |
| 9 | `grok_video_start` | HTTP Request | `POST /v1/videos/generations` + `image.url` |
| 10 | `wait_video` | Wait | 60s (15s @ 1080p) |
| 11 | `grok_video_poll` | HTTP Request | `GET /v1/videos/{{request_id}}` |
| 12 | `if_video_ready` | IF | `status = done` |
| 13 | `save_video_url` | Edit Fields | Final `video_url` |

Reuse **one** `image_gen` node for first pass and revisions (both `build_prompt` and `adjust_prompt` write `image_prompt`).

---

## Node settings (exact)

### 1 — `idea_form` (Form Trigger)

| Setting | Value |
|---|---|
| Form Title | Idea to Video |
| Element 1 Label | `idea` |
| Element 1 Type | Text |
| Required | ON |

**Test:** Submit any idea → output has `idea`.

---

### 2 — `build_prompt` (Edit Fields)

Include Other Input Fields = **ON**

| Name | Value (fx ON) |
|---|---|
| `image_prompt` | `{{ String($json.idea || '').trim() }}` |
| `aspect_ratio` | `9:16` |
| `still_resolution` | `2k` |
| `video_duration` | `15` |
| `video_resolution` | `1080p` |

**Test:** `image_prompt` equals the idea you typed.

---

### 3 — `image_gen` (HTTP Request)

Duplicate your working Imagine node (e.g. `Grok_imagine_story` / `GROK_Imagine`) so auth comes along. Rename to `image_gen`.

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/images/generations` |
| Auth | same xAI Header Auth as `GROK_Imagine` |
| Body Content Type | JSON / Raw |
| Specify Body | Using JSON / expression |
| Body (fx ON) | below |

```text
{{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: String($json.image_prompt || $('build_prompt').item.json.image_prompt || ''),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

**Test:** Response has `data[0].url`.

---

### 4 — `save_still_url` (Edit Fields)

Include Other Input Fields = **ON**

| Name | Value (fx ON) |
|---|---|
| `still_url` | `{{ $('image_gen').item.json.data[0].url }}` |
| `image_prompt` | `{{ $('build_prompt').item.json.image_prompt || $json.image_prompt }}` |

After the adjust loop, prefer:

```text
{{ $('adjust_prompt').item.json.image_prompt || $('build_prompt').item.json.image_prompt }}
```

only if `adjust_prompt` has run; simplest safe pattern once both exist:

```text
{{ $json.image_prompt || $('build_prompt').item.json.image_prompt }}
```

(with `adjust_prompt` always rewriting `image_prompt` into the item).

**Test:** `still_url` is a full https URL; open it — 9:16 still.

---

### 5 — `review_image` (Form)

Pauses the execution for human review.

| Setting | Value |
|---|---|
| Form Title | Review still |
| Custom / HTML element | show the still (below) |
| Element `decision` | Dropdown / Radio: `Approve`, `Change` — Required ON |
| Element `change_notes` | Textarea — Required OFF — “What to change (only if Change)” |

HTML preview element (adapt to your n8n Form HTML field):

```html
<img src="{{ $json.still_url }}" alt="still" style="max-width:100%;height:auto;border-radius:8px;" />
```

**Test:** Form shows the still; submitting Approve or Change continues the run.

---

### 6 — `if_change` (IF)

| | |
|---|---|
| Value 1 (fx ON) | `{{ $json.decision }}` |
| Operation | Equal |
| Value 2 | `Change` |

- **True** → `adjust_prompt`  
- **False** (Approve) → `video_prompt_form`

---

### 7 — `adjust_prompt` (Edit Fields)

Include Other Input Fields = **ON**

Default = **append** change notes onto current prompt:

| Name | Value (fx ON) |
|---|---|
| `image_prompt` | `{{ [String($('save_still_url').item.json.image_prompt || ''), String($json.change_notes || '').trim()].filter(Boolean).join('. Change: ') }}` |

One-line tweak for **full rewrite** instead of append:

```text
{{ String($json.change_notes || '').trim() || String($('save_still_url').item.json.image_prompt || '') }}
```

**Wire:** `adjust_prompt` → back into `image_gen` (same node). Then `image_gen` → `save_still_url` → `review_image` again.

---

### 8 — `video_prompt_form` (Form)

On the Approve path only.

| Setting | Value |
|---|---|
| Form Title | Video motion prompt |
| Element 1 Label | `video_prompt` |
| Element 1 Type | Textarea / Text |
| Required | ON |

**Test:** Output has `video_prompt` = what you typed.

---

### 9 — `grok_video_start` (HTTP Request)

Duplicate Imagine / video HTTP node for auth. Rename to `grok_video_start`.

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/videos/generations` |
| Auth | same xAI Header Auth |
| Body (fx ON) | below |

```text
{{ JSON.stringify({
  model: 'grok-imagine-video-1.5',
  prompt: String($json.video_prompt || $('video_prompt_form').item.json.video_prompt || ''),
  image: { url: String($('save_still_url').item.json.still_url || '') },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '1080p'
}) }}
```

**Test:** Response includes `request_id`.

---

### 10 — `wait_video` (Wait)

| Setting | Value |
|---|---|
| Resume | After Time Interval |
| Wait Amount | `60` |
| Wait Unit | Seconds |

---

### 11 — `grok_video_poll` (HTTP Request)

Duplicate `grok_video_start`. Clear body. Switch to GET.

| Setting | Value |
|---|---|
| Method | `GET` |
| URL (fx ON) | `https://api.x.ai/v1/videos/{{ $('grok_video_start').item.json.request_id }}` |
| Body | none |

**Test:** `status` is `pending` / `done` / `failed`. If your account returns `succeeded` instead of `done`, add that to the IF.

---

### 12 — `if_video_ready` (IF)

| | |
|---|---|
| Value 1 (fx ON) | `{{ $json.status }}` |
| Operation | Equal |
| Value 2 | `done` |

- **True** → `save_video_url`  
- **False** → `wait_video` (poll loop)

---

### 13 — `save_video_url` (Edit Fields)

Include Other Input Fields = **ON**

| Name | Value (fx ON) |
|---|---|
| `video_url` | `{{ $('grok_video_poll').item.json.video.url || $('grok_video_poll').item.json.url }}` |
| `video_request_id` | `{{ $('grok_video_start').item.json.request_id }}` |
| `still_url` | `{{ $('save_still_url').item.json.still_url }}` |
| `idea` | `{{ $('idea_form').item.json.idea }}` |
| `video_prompt` | `{{ $('video_prompt_form').item.json.video_prompt }}` |
| `aspect_ratio` | `9:16` |
| `duration_seconds` | `15` |
| `resolution` | `1080p` |

**Test:** Open `video_url` — 15s vertical MP4 matching the approved still + your motion prompt.

---

## Smoke test (end to end)

1. Open `idea_form` Test URL → submit an idea  
2. Confirm `image_gen` returns a 9:16 still  
3. On `review_image`: try **Change** once → confirm regen → then **Approve**  
4. On `video_prompt_form`: type a short motion prompt (e.g. “slow push-in, soft blue rim light, ambient lab only”)  
5. Confirm `grok_video_start` returns `request_id`  
6. Let poll loop until `done`  
7. Open `video_url`

---

## Source guides (pulled into this branch)

| Doc | Use |
|---|---|
| `marketing/n8n-video-nodes-step-by-step.md` | Poll loop, node naming, HTTP shapes |
| `marketing/n8n-prep-grok-video-start-landscape.js` | Live **15s / 1080p / 9:16** video body |
| `marketing/n8n-image-quality-upgrade.md` | `grok-imagine-image-quality` + `2k` |
| `marketing/n8n-grok-video-plan.md` | Model choice + compliance north star |
| `marketing/AGENT_RULEBOOK.md` | 9:16 + node naming |

No n8n instance or xAI key in this cloud environment — validate live in your n8n after each node.
