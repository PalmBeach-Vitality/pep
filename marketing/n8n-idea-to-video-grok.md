# Idea → Image → Adjust → 15s Video (Grok)

**Status:** Ready to build node-by-node  
**Branch:** `cursor/idea-to-video-nodes-0b73`

Simple flow:

1. Paste a **detailed image description** (`idea`)  
2. Create the still  
3. **Review** the still URL  
4. Paste a **second prompt** with corrections (`adjust`)  
5. Regenerate the still with corrections applied  
6. Save still → **15s / 1080p / 9:16** video  

---

## Chain

```text
manual_start        Manual Trigger
  → idea_input      Edit Fields      ← first prompt (detailed description)
  → image_gen       HTTP Request     first still
  → adjust_input    Edit Fields      ← second prompt (corrections)  [REVIEW HERE]
  → image_refine    HTTP Request     second still (idea + adjust)
  → save_still_url  Edit Fields      commit refined still_url
  → grok_video_start HTTP Request    animate still → 15s
  → wait_video      Wait             60s
  → grok_video_poll HTTP Request     GET status
  → if_video_ready  IF
       false → wait_video
       true  → save_video_url
```

After `image_gen`, open `data[0].url`, decide what to fix, put that in `adjust_input`, then continue.

---

## House conventions

- Node names: `lower_case_with_underscores`
- One node at a time
- When giving Sal each node: **node type first**, then **all parameters**, then **why**
- Still: `grok-imagine-image-quality`, `2k`, `9:16`
- Video: `grok-imagine-video-1.5`, `15`, `1080p`, `9:16`
- Auth: same xAI Header Auth as `GROK_Imagine`
- HTTP bodies: **Raw** + `application/json` + `={{ JSON.stringify(...) }}`
- `idea_input` / `adjust_input`: Edit Fields **Manual Mapping**, String fields (not JSON Output)

---

## Nodes (summary)

### `idea_input` — Manual Mapping, field `idea` (String)

### `image_gen` — POST `/v1/images/generations`

```text
={{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: String($('idea_input').item.json.idea || ''),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

### `adjust_input` — Manual Mapping, field `adjust` (String)

Second prompt. Example for current still:

```text
Only ONE vial in the entire frame. Remove the duplicate second vial. Single clear glass 10ml vial only. Keep the robotic claw, 3 claw marks, sparks, and label details.
```

### `image_refine` — POST `/v1/images/generations` (duplicate of `image_gen`)

```text
={{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: [
    String($('idea_input').item.json.idea || ''),
    'CRITICAL CORRECTIONS (must follow):',
    String($('adjust_input').item.json.adjust || '')
  ].join(' '),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

### `save_still_url` — `still_url` from `image_refine` (the corrected still)

### then video poll chain as before
