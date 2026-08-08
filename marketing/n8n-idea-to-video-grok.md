# Idea → Image → IF adjust → 15s Video (Grok)

**Status:** Ready to build node-by-node  
**Branch:** `cursor/idea-to-video-nodes-0b73`

1. Paste detailed image description  
2. Create still  
3. Review still URL  
4. Set **Approve** or **Change**  
5. IF Change → second prompt → refine still  
6. Both paths → save still → 15s video  

---

## Chain

```text
manual_start
  → idea_input              Edit Fields   ← first prompt (idea)
  → image_gen               HTTP Request  first still
  → review_input            Edit Fields   ← decision = Approve | Change  (+ adjust text if Change)
  → if_change               IF            decision Equal Change
       true  → adjust_prompt → image_refine ──┐
       false ─────────────────────────────────┼→ save_still_url
                                              → grok_video_start
                                              → wait_video
                                              → grok_video_poll
                                              → if_video_ready
                                                   false → wait_video
                                                   true  → save_video_url
```

**True path (Change):** write corrections → regenerate still → save → video  
**False path (Approve):** skip refine → save first still → video  
**Both paths end at:** `save_still_url` → video chain

---

## House conventions

- Node names: `lower_case_with_underscores`
- One node at a time; handoff = **type → all parameters → why**
- Still: `grok-imagine-image-quality`, `2k`, `9:16`
- Video: `grok-imagine-video-1.5`, `15`, `1080p`, `9:16`
- Auth: same xAI Header Auth as `GROK_Imagine`
- HTTP bodies: Raw + `application/json` + `={{ JSON.stringify(...) }}`
- Edit Fields: **Manual Mapping**, String fields

---

## Key node settings

### `review_input` (Edit Fields)

| Field | Type | Value |
|---|---|---|
| `decision` | String | `Approve` or `Change` |
| `adjust` | String | corrections if Change; leave empty if Approve |

### `if_change` (IF)

| | |
|---|---|
| Value 1 | `{{ $json.decision }}` |
| Operation | Equal |
| Value 2 | `Change` |

- **True** → `adjust_prompt` → `image_refine` → `save_still_url`  
- **False** → `save_still_url`

### `adjust_prompt` (Edit Fields)

Pass-through / normalize adjust text for refine:

| Field | Value |
|---|---|
| `adjust` | `{{ $json.adjust }}` |
| `idea` | `{{ $('idea_input').item.json.idea }}` |

### `image_refine` (HTTP Request)

Same as `image_gen`, body prompt = idea + corrections:

```text
={{ JSON.stringify({
  model: 'grok-imagine-image-quality',
  prompt: [
    String($('idea_input').item.json.idea || ''),
    'CRITICAL CORRECTIONS (must follow):',
    String($('adjust_prompt').item.json.adjust || $('review_input').item.json.adjust || '')
  ].join(' '),
  aspect_ratio: '9:16',
  resolution: '2k',
  n: 1
}) }}
```

### `save_still_url` (Edit Fields) — merge node

```text
still_url = {{ $json.data?.[0]?.url || $('image_refine').item.json.data?.[0]?.url || $('image_gen').item.json.data[0].url }}
```

Safer explicit version:

```text
={{ (() => {
  try { return $('image_refine').item.json.data[0].url; } catch (e) {}
  return $('image_gen').item.json.data[0].url;
})() }}
```

Use that for `still_url` so Approve uses first still, Change uses refined still.
