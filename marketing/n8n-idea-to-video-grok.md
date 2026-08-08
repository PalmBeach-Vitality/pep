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
  → review_input            Edit Fields   ← adjust field (empty = approve, filled = fix)
  → if_adjust_empty         IF            review_input.adjust is empty
       true  (empty)  → save_still_url ─────────────────┐
       false (has text) → adjust_prompt → image_refine ─┼→ save_still_url
                                                        → grok_video_start
                                                        → wait_video
                                                        → grok_video_poll
                                                        → if_video_ready
                                                             false → wait_video
                                                             true  → save_video_url
```

**True (adjust empty):** no changes — save first still → video  
**False (adjust has text):** run second prompt → regenerate → save refined still → video  
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
| `adjust` | String | leave **empty** to approve; paste corrections to refine |

No `decision` field — emptiness of `adjust` is the switch.

### `if_adjust_empty` (IF)

| Side | Value |
|---|---|
| Left (field) | `{{ $json.adjust }}` (fx ON) |
| Operator | **is empty** |
| Right | *(none — is empty has no second value)* |

- **True** (`adjust` empty) → `save_still_url`  
- **False** (`adjust` has text) → `adjust_prompt` → `image_refine` → `save_still_url`

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
={{ (() => {
  try { return $('image_refine').item.json.data[0].url; } catch (e) {}
  return $('image_gen').item.json.data[0].url;
})() }}
```

Use that for `still_url` so Approve uses first still, Change uses refined still.

### `save_video_url` — include `created_at`

| Field | Value (fx ON) |
|---|---|
| `created_at` | `{{ $now.toISO() }}` |
| `run_id` | `{{ $now.toISO() + '-' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0') }}` |
| `video_url` | `{{ $('grok_video_poll').item.json.video.url }}` |
| `still_url` | `{{ $('save_still_url').item.json.still_url }}` |
| `idea` | `{{ $('idea_input').item.json.idea }}` |
| `adjust` | `{{ $('review_input').item.json.adjust || '' }}` |
| `video_request_id` | `{{ $('grok_video_start').item.json.request_id }}` |
| `duration_seconds` | `15` |
| `aspect_ratio` | `9:16` |
| `resolution` | `1080p` |
| `model_video` | `grok-imagine-video-1.5` |
| `status` | `done` |

### Spreadsheet — `idea_to_video_runs`

CSV: `marketing/sheets/idea_to_video_runs.csv`  
Tab name (exact): **`idea_to_video_runs`**

Columns: `run_id`, `created_at`, `idea`, `adjust`, `still_url`, `video_url`, `video_request_id`, `duration_seconds`, `aspect_ratio`, `resolution`, `model_video`, `status`

After every successful run: Google Sheets **Append** via `sheets_append_run`.
