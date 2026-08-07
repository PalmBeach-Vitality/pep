# Idea → Image → Review → 15s Video (Grok)

**Status:** Ready to build node-by-node  
**Branch:** `cursor/idea-to-video-nodes-0b73`

As simple as possible:

1. You send a **detailed image description**
2. We create that image (9:16 / 2k)
3. You **review** the image
4. We turn that image into a **15s / 1080p / 9:16** video

---

## Chain

```text
idea_form          Form Trigger     ← detailed image description
  → image_gen      HTTP Request     Grok Imagine still
  → review_image   Form             show still → Continue
  → save_still_url Edit Fields      commit still_url
  → grok_video_start  HTTP Request  animate still → 15s
  → wait_video     Wait             60s
  → grok_video_poll   HTTP Request  GET status
  → if_video_ready IF
       false → wait_video
       true  → save_video_url
```

No adjust loop. No second prompt form. One text in → still → review → video out.

---

## House conventions

- Node names: `lower_case_with_underscores`
- One node at a time
- Still: `grok-imagine-image-quality`, `2k`, `9:16`
- Video: `grok-imagine-video-1.5`, `15`, `1080p`, `9:16`
- Auth: same xAI Header Auth as your working `GROK_Imagine`
- Poll until `status = done`

---

## Nodes

### 1 — `idea_form` (Form Trigger)

| Setting | Value |
|---|---|
| Form Title | Idea to Video |
| Field label | `idea` |
| Type | Textarea |
| Required | ON |

**Test:** Submit a detailed description → output has `idea`.

---

### 2 — `image_gen` (HTTP Request)

Duplicate your working Imagine node → rename `image_gen`.

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/images/generations` |
| Auth | same xAI Header Auth |
| Body (fx ON) | below |

```text
{{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: String($json.idea || $('idea_form').item.json.idea || ''),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

**Test:** `data[0].url` is a 9:16 still matching your description.

---

### 3 — `review_image` (Form)

| Setting | Value |
|---|---|
| Form Title | Review still |
| HTML | show the still (below) |
| Button / continue | Continue (default form submit) |

```html
<img src="{{ $('image_gen').item.json.data[0].url }}" alt="still" style="max-width:100%;height:auto;" />
```

Optional single field if your Form node requires one: Label `ok`, Type Text, default `continue`, or just use form submit with no fields.

**Test:** Still shows; submit continues the run.

---

### 4 — `save_still_url` (Edit Fields)

Include Other Input Fields = **ON**

| Name | Value (fx ON) |
|---|---|
| `still_url` | `{{ $('image_gen').item.json.data[0].url }}` |
| `idea` | `{{ $('idea_form').item.json.idea }}` |

**Test:** `still_url` is the reviewed still.

---

### 5 — `grok_video_start` (HTTP Request)

Duplicate Imagine / video HTTP node → rename `grok_video_start`.

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/videos/generations` |
| Auth | same xAI Header Auth |
| Body (fx ON) | below |

```text
{{ JSON.stringify({
  model: 'grok-imagine-video-1.5',
  prompt: 'Animate this image into a smooth 15-second vertical video. Slow cinematic camera, keep subject identity and composition, no new text, no people added.',
  image: { url: String($('save_still_url').item.json.still_url || '') },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '1080p'
}) }}
```

**Test:** Response has `request_id`.

---

### 6 — `wait_video` (Wait)

| Setting | Value |
|---|---|
| Resume | After Time Interval |
| Amount | `60` |
| Unit | Seconds |

---

### 7 — `grok_video_poll` (HTTP Request)

Duplicate `grok_video_start` → clear body → GET.

| Setting | Value |
|---|---|
| Method | `GET` |
| URL (fx ON) | `https://api.x.ai/v1/videos/{{ $('grok_video_start').item.json.request_id }}` |

**Test:** `status` is `pending` / `done` / `failed`.

---

### 8 — `if_video_ready` (IF)

| | |
|---|---|
| Value 1 | `{{ $json.status }}` |
| Operation | Equal |
| Value 2 | `done` |

- **True** → `save_video_url`  
- **False** → `wait_video`

---

### 9 — `save_video_url` (Edit Fields)

Include Other Input Fields = **ON**

| Name | Value (fx ON) |
|---|---|
| `video_url` | see below |
| `still_url` | `{{ $('save_still_url').item.json.still_url }}` |
| `idea` | `{{ $('idea_form').item.json.idea }}` |

```text
{{ $('grok_video_poll').item.json.video.url || $('grok_video_poll').item.json.url }}
```

**Test:** Open `video_url` — 15s vertical clip of the reviewed still.

---

## Smoke test

1. Paste a detailed image description into the form  
2. Confirm still matches  
3. Review → Continue  
4. Wait for poll → open `video_url`

---

## Source conventions

| Doc | Use |
|---|---|
| `marketing/n8n-prep-grok-video-start-landscape.js` | 15s / 1080p / 9:16 body |
| `marketing/n8n-image-quality-upgrade.md` | Imagine quality + 2k |
| `marketing/n8n-video-nodes-step-by-step.md` | Poll loop shape |
| `marketing/AGENT_RULEBOOK.md` | Naming + 9:16 |
