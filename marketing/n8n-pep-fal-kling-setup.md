# SETUP — fal.ai + Kling I2V for Pep (n8n)

Get fal billing + API key live, then wire Beat A video nodes.  
Keep **exact** canvas names: `prep_grok_video_start` → `grok_video_start` → `grok_video_poll` → `save_video_url`.

**Model:** Kling Video v3 Pro · image-to-video  
**Endpoint id:** `fal-ai/kling-video/v3/pro/image-to-video`

---

## Part 1 — fal.ai account (5 minutes)

1. Go to [https://fal.ai](https://fal.ai) → **Sign up** / Log in.
2. Open the dashboard: [https://fal.ai/dashboard](https://fal.ai/dashboard).
3. **Add billing / credits**  
   - Dashboard → **Billing** (or Account → Billing)  
   - Add a payment method and buy credits (Kling Pro I2V burns credits per ~15s clip — start with a small top-up for smoke tests).
4. **Create an API key**  
   - [https://fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)  
   - **Create key** → copy it once (looks like a long secret string).  
   - Store it somewhere safe. You will paste it into n8n as `Key <paste>`.

Smoke-check the key works (optional, from any terminal):

```bash
curl -s -X POST "https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video" \
  -H "Authorization: Key YOUR_FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "gentle camera push-in, soft breeze, cartoon character stays identical",
    "start_image_url": "https://files.catbox.moe/2yfdbi.jpg",
    "duration": "5",
    "generate_audio": false
  }'
```

You should get JSON with a `request_id`. If you get `401` / `403`, the key or billing is wrong.

---

## Part 2 — n8n credential

1. In n8n → **Credentials** → **Add credential**.
2. Choose **Header Auth**.
3. Set:
   - **Name** (credential label): `fal.ai Header Auth` (or similar)
   - **Header Name:** `Authorization`
   - **Header Value:** `Key YOUR_FAL_KEY`  
     (literal word `Key`, then a space, then the key — example: `Key fal_…`)
4. Save.

---

## Part 3 — Prep code node (Beat A)

Node name (exact): **`prep_grok_video_start`**

1. Open the Code node (or create it if missing).
2. Paste the full file from the repo:  
   [`marketing/n8n-pep-prep-video-beat.js`](./n8n-pep-prep-video-beat.js)
3. Leave `const BEAT = 'a';` for Beat A.
4. Mode: **Run Once for Each Item**.
5. Wire: `save_still_url` → `prep_grok_video_start`.

This node builds `video_request_body` with:
- `start_image_url` = Pep still from `save_still_url`
- `duration` = `"15"`
- `generate_audio` = `false` (VO comes from ElevenLabs later)
- cartoon-safe prompt + negative prompt

**Smoke:** Manual run through a successful still → prep. Confirm output has:
- `fal_submit_url`
- `video_request_body.start_image_url` (https URL)
- `model_video` = `fal-kling-v3-pro-i2v`

---

## Part 4 — Start job node

Node name (exact): **`grok_video_start`** (HTTP Request)

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video` |
| Authentication | Generic Credential Type → **Header Auth** → your fal credential |
| Send Body | ON |
| Body Content Type | JSON |
| Specify Body | Using JSON |

**JSON body** (pick one):

```text
={{ $json.video_request_body }}
```

or, if your n8n build wants a string:

```text
={{ $json.video_request_body_string }}
```

Wire: `prep_grok_video_start` → `grok_video_start`.

**Smoke:** Run once. Output must include `request_id`. Copy it if you need to debug.

---

## Part 5 — Poll until done

fal jobs are async. Use a small loop: Wait → status → IF complete → get result.

### 5a. Wait
Add a **Wait** node after `grok_video_start` (e.g. 20–30 seconds first pass).

### 5b. Status check — can stay on node name `grok_video_poll` for Beat A

HTTP Request:

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video/requests/{{ $('grok_video_start').item.json.request_id }}/status` |
| Authentication | Same fal Header Auth |

### 5c. IF node
- If `{{ $json.status }}` equals `COMPLETED` → go to **result** request (below).
- Else → back to Wait (loop). Also fail/branch on `FAILED`.

Typical statuses: `IN_QUEUE`, `IN_PROGRESS`, `COMPLETED`, `FAILED`.

### 5d. Result fetch
HTTP Request (can be a second request inside the poll path, or reuse `grok_video_poll` after status is complete):

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video/requests/{{ $('grok_video_start').item.json.request_id }}` |
| Authentication | Same fal Header Auth |

Video URL path:

```text
{{ $json.video.url }}
```

---

## Part 6 — Save URL

Node name (exact): **`save_video_url`** (Set / Edit Fields)

| Field | Value |
|---|---|
| `video_url` | `{{ $json.video.url }}` |
| `creation_id` | `{{ $('prep_pep_beats').item.json.creation_id \|\| $('Limit').item.json.creation_id }}` |
| `model_video` | `fal-kling-v3-pro-i2v` |

Then → `sheets_update_creation` as already documented.

---

## Part 7 — Beat A smoke checklist

- [ ] fal account has credits
- [ ] Header Auth credential = `Key …` (word Key + space + secret)
- [ ] Pep still exists on `save_still_url` (public https URL)
- [ ] `prep_grok_video_start` outputs `video_request_body`
- [ ] `grok_video_start` returns `request_id`
- [ ] Poll reaches `COMPLETED`
- [ ] `video.url` plays as ~15s 9:16 clip with Pep recognizable
- [ ] No Kling speech (audio off) — silent/ambient only

If Pep morphs badly: still lock first (master edits), then re-run I2V. Kling can only hold what the still already shows.

---

## Cost / practical notes

- Pro I2V at 15s costs more than a 5s smoke — use `"duration": "5"` in a one-off test body if you want a cheap likeness check, then switch back to `"15"` from the prep code for production beats.
- Still URL must be publicly fetchable by fal (catbox / CDN / signed URL that doesn’t expire mid-job).
- Do **not** rename canvas nodes. Duplicate `_b` / `_c` / `_d` only after Beat A works.

---

## Links

- fal keys: https://fal.ai/dashboard/keys  
- Kling v3 Pro I2V model page: https://fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video  
- Pep video stack: `marketing/n8n-pep-elevenlabs-video.md`  
- Execute guide: `marketing/n8n-vid-gen-palm-beach-pep-execute.md`  
- Prep code: `marketing/n8n-pep-prep-video-beat.js`
