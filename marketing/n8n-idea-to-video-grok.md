# Idea → Image → Review → 15s Video (Grok)

**Status:** Ready to build node-by-node  
**Branch:** `cursor/idea-to-video-nodes-0b73`

As simple as possible:

1. Paste a **detailed image description** into Edit Fields  
2. Create that image (9:16 / 2k)  
3. **Review** the image URL in the `image_gen` output  
4. Turn that image into a **15s / 1080p / 9:16** video  

---

## Chain

```text
manual_start       Manual Trigger   start run
  → idea_input     Edit Fields      ← paste detailed image description
  → image_gen      HTTP Request     Grok Imagine still
  → save_still_url Edit Fields      commit still_url (after you review)
  → grok_video_start  HTTP Request  animate still → 15s
  → wait_video     Wait             60s
  → grok_video_poll   HTTP Request  GET status
  → if_video_ready IF
       false → wait_video
       true  → save_video_url
```

No Form Trigger. Paste the description in `idea_input`, run, review the still URL, continue.

---

## House conventions

- Node names: `lower_case_with_underscores`
- One node at a time
- When giving Sal each node: **node type first**, then **all parameters**, then **why**
- Still: `grok-imagine-image-quality`, `2k`, `9:16`
- Video: `grok-imagine-video-1.5`, `15`, `1080p`, `9:16`
- Auth: same xAI Header Auth as your working `GROK_Imagine`
- Poll until `status = done`
- HTTP Grok bodies: prefer **Raw** + `application/json` + `={{ JSON.stringify(...) }}`

---

## Nodes

### 1 — `manual_start` (Manual Trigger)

Starts the workflow when you click Execute / Test workflow.

### 2 — `idea_input` (Edit Fields / Set)

Paste your detailed image description into field `idea` before each run.

### 3 — `image_gen` (HTTP Request)

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://api.x.ai/v1/images/generations` |
| Auth | same xAI Header Auth |
| Body Content Type | **Raw** |
| Body (fx ON) | below |

```text
={{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: String($json.idea || $('idea_input').item.json.idea || ''),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

**Review step:** open `data[0].url` from the output. If good, continue. If not, edit `idea` in `idea_input` and re-run.

### 4 — `save_still_url` (Edit Fields)

| Name | Value (fx ON) |
|---|---|
| `still_url` | `{{ $('image_gen').item.json.data[0].url }}` |
| `idea` | `{{ $('idea_input').item.json.idea }}` |

### 5 — `grok_video_start` (HTTP Request)

```text
={{ JSON.stringify({
  model: 'grok-imagine-video-1.5',
  prompt: 'Animate this image into a smooth 15-second vertical video. Slow cinematic camera, keep subject identity and composition, no new text, no people added.',
  image: { url: String($('save_still_url').item.json.still_url || '') },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '1080p'
}) }}
```

### 6 — `wait_video` (Wait) — 60 seconds

### 7 — `grok_video_poll` (HTTP Request) — GET `https://api.x.ai/v1/videos/{{ $('grok_video_start').item.json.request_id }}`

### 8 — `if_video_ready` (IF) — `$json.status` Equal `done` → save; else → wait

### 9 — `save_video_url` (Edit Fields)

```text
{{ $('grok_video_poll').item.json.video.url || $('grok_video_poll').item.json.url }}
```

---

## Source conventions

| Doc | Use |
|---|---|
| `marketing/n8n-prep-grok-video-start-landscape.js` | 15s / 1080p / 9:16 body |
| `marketing/n8n-image-quality-upgrade.md` | Imagine quality + 2k |
| `marketing/n8n-video-nodes-step-by-step.md` | Poll loop shape |
| `marketing/n8n-finish-grok-node.md` | Raw body HTTP pattern |
| `marketing/AGENT_RULEBOOK.md` | Naming + handoff format |
