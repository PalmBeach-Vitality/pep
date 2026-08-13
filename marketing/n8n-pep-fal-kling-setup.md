# SETUP — fal.ai + Kling I2V for Pep (n8n)

Get fal billing + API key live, then wire Beat A video.  
**Preferred:** official fal community node (`@fal-ai/n8n-nodes-fal`).  
**Fallback:** HTTP Request queue submit/poll (appendix).

Keep **exact** canvas names: `prep_grok_video_start` → **`kling_video_request`** → `Wait` → `grok_video_poll` → `kling_video_result` → `save_video_url`.

**Model:** Kling Video v3 Pro · image-to-video  
**Endpoint id:** `fal-ai/kling-video/v3/pro/image-to-video`

---

## Part 1 — fal.ai account (5 minutes)

1. Go to [https://fal.ai](https://fal.ai) → **Sign up** / Log in.
2. Open the dashboard: [https://fal.ai/dashboard](https://fal.ai/dashboard).
3. **Add billing / credits**  
   - Dashboard → **Billing**  
   - Add a payment method and buy a small credit pack for smoke tests.
4. **Create an API key**  
   - [https://fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)  
   - **Create key** → copy once.

---

## Part 2 — Install the fal n8n node

1. n8n → **Settings** → **Community Nodes** → **Install**.
2. Package: `@fal-ai/n8n-nodes-fal`
3. Install → refresh the editor.
4. Credentials → add **fal.ai API** (credential type from that package) → paste your API key.

Self-hosted manual install (if needed):

```bash
cd ~/.n8n/nodes
npm install @fal-ai/n8n-nodes-fal
```

---

## Part 3 — Prep code node (Beat A)

Node name (exact): **`prep_grok_video_start`**

1. Paste [`marketing/n8n-pep-prep-video-beat.js`](./n8n-pep-prep-video-beat.js)
2. Leave `const BEAT = 'a';`
3. Mode: **Run Once for Each Item**
4. Wire: `save_still_url` → `prep_grok_video_start`

**Smoke:** output has `video_request_body.start_image_url`, `video_prompt`, `model_video` = `fal-kling-v3-pro-i2v`.

---

## Part 4 — fal node as `grok_video_start` (preferred)

1. Open (or replace the HTTP type of) node **`grok_video_start`** with the **fal.ai** node.  
   - Keep the **exact name** `grok_video_start`.
2. Credential: fal.ai API key from Part 2.
3. Operation: **Generate Media** (or **Image to Video → Generate**, depending on package UI).
4. Model / endpoint: `fal-ai/kling-video/v3/pro/image-to-video`
5. Map fields from prep:

| fal field | Expression |
|---|---|
| Prompt | `{{ $json.video_request_body.prompt }}` or `{{ $json.video_prompt }}` |
| Start image URL | `{{ $json.video_request_body.start_image_url }}` |
| Duration | `15` (or `{{ $json.video_request_body.duration }}`) |
| Generate audio | `false` |
| Negative prompt | `{{ $json.video_request_body.negative_prompt }}` |

6. If the node offers queue / wait options: prefer **wait for completion** so you don’t need a manual poll loop.  
   - If it only submits: keep `grok_video_poll` for status (Part 5).  
   - If it waits and returns the file: you can no-op or thin out `grok_video_poll` but **keep the node name** in the chain for expressions.

Wire: `prep_grok_video_start` → `grok_video_start` → (`grok_video_poll` if needed) → `save_video_url`.

**Tip:** Use **Get Model Info** once on that endpoint to see the exact parameter names your installed node version expects.

---

## Part 5 — Poll only if the fal node doesn’t wait

If Generate Media already returns `video.url`, skip to Part 6.

Otherwise keep **`grok_video_poll`** (Wait + status/result) using the `request_id` from `grok_video_start`, same as the HTTP appendix below.

---

## Part 6 — Save URL

Node name (exact): **`save_video_url`**

| Field | Value |
|---|---|
| `video_url` | `{{ $json.video.url }}` (or whatever path the fal node returns — check one successful run) |
| `creation_id` | `{{ $('prep_pep_beats').item.json.creation_id \|\| $('Limit').item.json.creation_id }}` |
| `model_video` | `fal-kling-v3-pro-i2v` |

Then → `sheets_update_creation`.

---

## Part 7 — Beat A smoke checklist

- [ ] fal account has credits
- [ ] `@fal-ai/n8n-nodes-fal` installed
- [ ] fal API credential saved
- [ ] Pep still public URL on `save_still_url`
- [ ] `prep_grok_video_start` builds the I2V body
- [ ] `grok_video_start` (fal node) completes with a playable URL
- [ ] ~15s clip, Pep recognizable, no Kling speech fighting VO

If Pep morphs: fix still lock first, then re-run I2V.

---

## Cost / practical notes

- Use duration `5` for a cheap likeness smoke; production prep uses `15`.
- Still URL must be publicly fetchable by fal.
- Do **not** rename canvas nodes. Duplicate `_b` / `_c` / `_d` only after Beat A works.

---

## Appendix — HTTP Request: `kling_video_request` (full parameters)

Wire: `prep_grok_video_start` → **`kling_video_request`** → `Wait` → `grok_video_poll`

| Parameter | fx | Value |
|---|---|---|
| Node type | — | HTTP Request |
| Exact name | — | `kling_video_request` |
| Method | OFF | `POST` |
| URL | OFF | `https://queue.fal.run/fal-ai/kling-video/v3/pro/image-to-video` |
| Authentication | — | Generic Credential Type |
| Generic Auth Type | — | Header Auth |
| Header Auth → Name | OFF | `Authorization` |
| Header Auth → Value | OFF | `Key YOUR_FAL_KEY` |
| Send Query Parameters | — | OFF |
| Send Headers | — | ON |
| Header 1 Name | OFF | `Content-Type` |
| Header 1 Value | OFF | `application/json` |
| Header 2 Name | OFF | `Accept` |
| Header 2 Value | OFF | `application/json` |
| Send Body | — | ON |
| Body Content Type | — | JSON |
| Specify Body | — | Using JSON |
| JSON | ON | `={{ $json.video_request_body }}` |
| Options → Timeout | OFF | `300000` |
| Options → Response → Response Format | — | JSON |
| Options → Never Error | — | OFF |

Fallback JSON (fx ON) if the object expression fails: `={{ JSON.parse($json.video_request_body_string) }}`

Do **not** add `frontal_image_url` at root. Do **not** use the fal community node / fal.ai credential on this HTTP node (it sets `User-Agent: n8n-nodes-fal/1.0.1` and can break later GETs).

**`grok_video_poll`**
1. Wait 90–120s  
2. GET `={{ $('kling_video_request').item.json.status_url }}`  
3. Loop until `COMPLETED`  
4. GET `={{ $('kling_video_request').item.json.response_url }}` on **`kling_video_result`** (too early → 400 `"Request is still in progress"`)  
5. `save_video_url`: `={{ $json.video.url }}`

Optional curl key smoke:

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

---

## Links

- fal keys: https://fal.ai/dashboard/keys  
- fal n8n node: https://www.npmjs.com/package/@fal-ai/n8n-nodes-fal  
- Kling v3 Pro I2V: https://fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video  
- Pep video stack: `marketing/n8n-pep-elevenlabs-video.md`  
- Execute guide: `marketing/n8n-vid-gen-palm-beach-pep-execute.md`  
- Prep code: `marketing/n8n-pep-prep-video-beat.js`
