# Palm Beach Vitality — Grok Video Reels Plan (IG / FB / TikTok)

**Status:** Ready to build  
**Owner:** Sal + cloud agent  
**Hard rule:** Laboratory / in-vitro research materials only. Not for human use. Chemical names only. Mandatory disclaimer on every caption. No disease, structure/function, wellness, dosing, or results claims — on screen, in audio, or in captions.

This plan upgrades the existing still-image spotlight workflow into **daily realistic short-form video** for Instagram Reels, Facebook Reels, and TikTok, while keeping the current Sheets → Grok → Imagine → Buffer stack.

---

## 1) Goal

Same compound for 7 days. **New realistic video every day.** Platforms:

| Platform | Format | Aspect | Length (start) |
|---|---|---|---|
| Instagram | Reel (+ optional Story video later) | **9:16** | **8s** Reel |
| Facebook | Reel / short video | **9:16** | **8s** |
| TikTok | Video / Reel equivalent | **9:16** | **8s** |

Still images can continue for feed/stories on some days; **video is the primary exposure lever**.

### Success criteria
1. One approved research-safe Reel/day lands on IG + FB + TikTok  
2. Looks **photoreal / premium lab catalog** — not cartoon, not synthwave poster loop  
3. On-screen text only from Parse fields (chemical name, class, format, research-use)  
4. Caption ends with full mandatory disclaimer on all three platforms  
5. Sheets writeback stores video URL + Buffer post IDs  

---

## 2) Cross-checks completed

| Check | Result | Plan decision |
|---|---|---|
| xAI video API | `POST /v1/videos/generations` → poll `GET /v1/videos/{request_id}` until `status=done` | Use HTTP Request nodes + Wait/IF poll loop |
| Best model for realism | **`grok-imagine-video-1.5`** = image-to-video, strongest frame fidelity | **Primary path = photoreal still → 1.5 animate** |
| Text-to-video model | `grok-imagine-video` supports T2V + reference-to-video | Use only for rare “wild day” experiments, not default |
| Duration / res | Up to 15s; 720p; 5–8s most stable | Start **8s @ 720p @ 9:16** |
| Native audio | Model can synthesize audio | **Default: ambient lab bed only or silent.** No voiceover claims. No “results” SFX language |
| Existing n8n stack | Sheets → Prep → Grok → Parse → Imagine feed/story → Buffer GraphQL works | Insert video **after** `Save_render_URL`, before/alongside Buffer posts |
| Buffer | GraphQL `createPost` with `assets: [{ video: { url } }]` + `type: reel` | Same HTTP pattern as image posts (native Buffer node stays bypassed) |
| TikTok | Not confirmed connected in Buffer yet | **Gate:** connect TikTok channel in Buffer before wiring `Buffer_TT_Reel` |
| Compliance | Chemical names only; no KLOW/Wolverine/GLOW nicknames; BPC-157 is **not** FDA-approved for human use | Video prompts + captions inherit same denylist |
| Cost | Video billed per second (order of ~$0.08–$0.14/sec at 720p for 1.5-class models; confirm live pricing) | Phase 1 = **1 Reel/day**; add Story video only after cost OK |

---

## 3) Creative north star — “REALISTIC”

Sal requirement: videos must look **real**, not generic AI poster motion.

### Do
- Photoreal **research vial** hero plus lab world: science, chemistry glassware, synthesis benches, engineering / prototype fixtures, assay instruments, sterile health-science atmosphere  
- Slow cinematic camera: push-in, lateral slide, shallow DOF rack  
- Subtle condensation / particle dust / light sweep — physical, not cartoon  
- End hold: chemical name + “For laboratory research use only”  

### Don’t
- **Pens of any kind** (injection pens, autoinjectors, writing pens, pencils, markers)  
- People, faces, hands injecting, needles/syringes in use, clinics, gyms, bathrooms, lifestyle wellness  
- Before/after bodies, weight-loss montage, “results” overlays  
- Nicknames (KLOW, Wolverine, GLOW)  
- Invented purity %, FDA approvals, certifications  
- Loud meme / glitch / cartoon molecule mascots as the default look  

### Brand feel
Palm Beach Vitality = **premium American research catalog film** — clinical, precise, expensive glassware, controlled light. Same world as the vial product stills with electric-blue energy, but motion stays believable. Reels are **vial + lab science**, never pen product shots — even when Sheets `product_form` says Pen.

---

## 4) Content program (what we produce)

### 4.1 Weekly cadence (unchanged compound lock)
- **Mon–Sun:** same `compound_id`  
- **Each day:** new angle + new video treatment + new caption set  
- **Next Monday:** switch compound in Sheets (manual filter for now)

### 4.2 Seven realistic video formats (`daily_video_format`)

| Day | Format | Photoreal scene | Motion | On-screen text (from Parse only) |
|---|---|---|---|---|
| Mon | **Vial Identity Macro** | Hero research vial centered, dark lab void | Slow push-in; soft blue sweep | Chemical name → “Laboratory research material” |
| Tue | **Chemistry Class Spec** | Vial + chemistry glassware; cool HUD-free light | Gentle slide; focus pull to class line | Biochemical class line |
| Wed | **Synthesis Prototype** | Synthesis / prototype engineering bench with vial hero | Orbit setup; calm engineering reveal | “Laboratory research material” |
| Thu | **Assay Engineering Bench** | Assay instruments, vial rack, HPLC-adjacent props (no patient care) | Lateral dolly; subtle instrument LEDs | “In-vitro / analytical research context” |
| Fri | **Lab Catalog Atmosphere** | Vial on acrylic riser with lab props; catalog card motif | Rise + settle; CTA frame | “View laboratory listing” (no spoken URL) |
| Sat | **Research Seal Lab** | Sealed research vial in sterile lab + research-use seal aesthetic | Calm hold; seal fades in last 2s | FAQ: research use only (not human use) |
| Sun | **Precision Glass Close** | Extreme macro vial glass / meniscus; chemistry calm | Micro push; light bloom settle | Quality / documentation neutral close |

### 4.3 Caption package (video days)
Grok still writes captions (existing Parse schema), with video-day tweaks:

1. **IG Reel caption** — short hook (format-led) + 2 research lines + catalog URL + **full disclaimer**  
2. **FB Reel caption** — slightly fuller catalog note + URL + **full disclaimer**  
3. **TikTok caption** — short; hook = chemical name + “research compound”; **full disclaimer**  
4. **IG first comment** (optional) — longer catalog note + disclaimer  

**Mandatory disclaimer (exact, final lines on IG + FB + TikTok):**
```text
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

### 4.4 What never appears in video
- Pens / pen injectors / autoinjectors / writing instruments  
- Voiceover promising outcomes  
- “Healing,” “weight loss,” “anti-aging,” “stack for gains,” etc.  
- Human skin, needles entering bodies, syringes aimed at people  
- Lifestyle beach / party / athlete transformation  

Ambient audio OK: soft lab hum, glass tick, low whoosh — **no spoken medical claims**.

---

## 5) Video generation program (xAI)

### 5.1 Models

| Role | Model | When |
|---|---|---|
| **Primary (realistic)** | `grok-imagine-video-1.5` | Image-to-video from today’s photoreal still |
| Secondary (optional) | `grok-imagine-video` | Text-to-video only if still path fails or Sal wants a wild day |

### 5.2 Default generation settings

```json
{
  "model": "grok-imagine-video-1.5",
  "prompt": "<motion prompt — see 5.4>",
  "image": { "url": "<photoreal_still_url>" },
  "duration": 8,
  "aspect_ratio": "9:16",
  "resolution": "720p"
}
```

Confirm `aspect_ratio` / `resolution` field names against live xAI docs during smoke test (SDK uses them; REST body may use the same keys).

### 5.3 Still source strategy (critical for realism)

Do **not** animate the abstract navy hex poster as the only path if Sal wants realism.

**Preferred still pipeline for video days:**
1. Generate a **photoreal research-vial + lab science still** (chemistry / synthesis / engineering / prototype atmosphere — **never a pen**) via Grok Imagine → `reel_still_url` (9:16)  
2. Animate that still with `grok-imagine-video-1.5`  

**Fallback:** image-to-video from today’s story still (`story_image_url`) if photoreal still node fails.

### 5.4 Motion prompt skeleton (image-to-video)

```text
Animate this photoreal Palm Beach Vitality laboratory science still into an 8-second premium vertical research catalog film.
Keep the research VIAL and lab / chemistry / synthesis / engineering / prototype props exactly as in the source image.
Camera: slow cinematic push-in with subtle parallax. Lighting: cool electric-blue rim light, soft volumetric haze, realistic glass refraction.
Motion: gentle vial settle, light sweep across glassware, faint dust motes — physical and believable.
Keep vial identity, label geometry, and all typography sharp and unchanged.
On-screen text must remain exactly as in the source image — do not invent new words, claims, percentages, or approvals.
HARD BAN — do not add: pens, pen injectors, autoinjectors, writing pens, syringes, needles, injection, people, hands, clinics, gyms, lifestyle, before/after.
Mood: expensive American research catalog, precise, sterile, premium.
End on a clean hold of the compound name with laboratory research-use framing.
Today format: {{ daily_video_format }}. Color accents: {{ daily_color_scheme }}.
```

### 5.5 Async job handling

```text
POST /v1/videos/generations  →  { request_id }
loop:
  Wait 8–12s
  GET /v1/videos/{request_id}
  if status == done → video.url
  if status in failed|expired → error path
```

n8n: HTTP Start → Wait → HTTP Poll → IF (done / failed / pending→loop). Cap loops (e.g. 15) to avoid infinite runs.

### 5.6 Cost control
- Phase 1: **1 × 8s Reel/day @ 720p** (IG + FB + TikTok share the **same file**)  
- Phase 2: optional 6s Story cut (trim or second generation)  
- Log estimated cost in Sheets (`video_seconds`, `video_model`)  

---

## 6) n8n node plan (exact placement)

### 6.1 Target chain

```text
Schedule
  → Sheets Get Row(s)   (compound_id filter)
  → Limit 1
  → Prep_day_variant    (+ daily_video_format, daily_motion_brief)
  → Edit Fields         (system_prompt + user_prompt)
  → GROK_HTTP
  → Parse_Grok
  → GROK_Imagine                  (1:1 feed still — keep)
  → Grok_imagine_story            (9:16 story still — keep)
  → grok_imagine_reel_still       (NEW HTTP Request — 9:16 PHOTOREAL still)
  → Save_render_URL               (extend with reel_still_url)
  → grok_video_start              (NEW HTTP Request — POST video 1.5)
  → wait_video                    (NEW Wait)
  → grok_video_poll               (NEW HTTP Request — GET until done)
  → if_video_ready                (NEW IF)
       ├─ true → save_video_url   (NEW Edit Fields)
       │         → buffer_ig_reel (NEW HTTP Request)
       │         → buffer_fb_reel (NEW HTTP Request)
       │         → buffer_tt_reel (NEW HTTP Request — TikTok later)
       │         → (optional) existing image feed/story posts
       │         → Sheets_writeback
       └─ false → Error_Notify / Sheets flag video_failed
```

**Naming rule:** all **new** nodes use `lower_case_with_underscores` only.

### 6.2 New / changed nodes

| Node | n8n type | After | Before | Purpose |
|---|---|---|---|---|
| **Prep_day_variant** fields | Edit Fields (edit) | — | — | Add `daily_video_format`, `daily_motion_brief` |
| **grok_imagine_reel_still** | HTTP Request | `Grok_imagine_story` | `Save_render_URL` | 9:16 photoreal product still |
| **Save_render_URL** | Edit Fields (edit) | — | — | Add `reel_still_url` |
| **grok_video_start** | HTTP Request | `Save_render_URL` | `wait_video` | `POST /v1/videos/generations` |
| **wait_video** | Wait | start | poll | 10s |
| **grok_video_poll** | HTTP Request | `wait_video` | `if_video_ready` | `GET /v1/videos/{id}` |
| **if_video_ready** | IF | poll | save / loop | `status === 'done'` |
| **save_video_url** | Edit Fields | IF true | buffer reels | Map `video_url` + ids |
| **buffer_ig_reel** | HTTP Request | `save_video_url` | `buffer_fb_reel` | IG `type: reel` |
| **buffer_fb_reel** | HTTP Request | IG reel | TT / Sheets | FB `type: reel` |
| **buffer_tt_reel** | HTTP Request | FB reel | Sheets | TikTok (later) |
| **Sheets_writeback** | Google Sheets (edit) | — | — | Video columns + Buffer reel IDs |

Full build steps: `marketing/n8n-video-nodes-step-by-step.md`

### 6.3 Prep_day_variant — new fields

#### `daily_video_format`
```text
{{ ({1:'Vial Identity Macro',2:'Chemistry Class Spec',3:'Synthesis Prototype',4:'Assay Engineering Bench',5:'Lab Catalog Atmosphere',6:'Research Seal Lab',7:'Precision Glass Close'})[$now.weekday] || 'Vial Identity Macro' }}
```

#### `daily_motion_brief`
```text
{{ ({1:'Slow push-in on photoreal research vial; blue rim light sweep; compound name hold',2:'Gentle lateral slide across chemistry glassware; focus pull to class line; refraction',3:'Orbit a synthesis / prototype lab setup with vial hero; engineering calm; no use demo',4:'Bench dolly past assay instruments and vial rack; subtle LED glow; sterile health-science mood',5:'Rise onto acrylic riser with vial + lab props; settle; catalog CTA end card',6:'Calm hold on sealed research vial in lab; research-use seal fades in final 2 seconds',7:'Extreme macro vial glass / meniscus; micro push; premium quiet chemistry close'})[$now.weekday] || 'Slow push-in; photoreal vial lab catalog film' }}
```

### 6.4 Buffer bodies (pattern)

Same GraphQL endpoint as working feed posts: `POST https://api.buffer.com`

**Instagram Reel (fx ON) — sketch:**
```text
{{ JSON.stringify({
  query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }',
  variables: {
    input: {
      text: $('Save_render_URL').item.json.ig_caption_draft,
      channelId: '6a668d534b2d03035f478536',
      schedulingType: 'automatic',
      mode: 'addToQueue',
      metadata: { instagram: { type: 'reel', shouldShareToFeed: true } },
      assets: [{ video: { url: $('Save_video_URL').item.json.video_url } }]
    }
  }
}) }}
```

**Facebook Reel:** same with `channelId: '6a668d6b4b2d03035f478575'` and `metadata.facebook.type: 'reel'`.

**TikTok:** same pattern once `channelId` known. Confirm Buffer’s TikTok metadata field name in a smoke create (often `metadata.tiktok` or service-specific). Differentiate caption slightly (`TT —` prefix or format-led hook) to avoid duplicate-guard collisions when text is too similar across channels.

### 6.5 Sheets columns to add

| Column | Purpose |
|---|---|
| `reel_still_url` | Photoreal 9:16 still used for video |
| `video_url` | Final Grok video URL |
| `video_request_id` | xAI job id |
| `video_model` | e.g. `grok-imagine-video-1.5` |
| `video_seconds` | 8 |
| `buffer_ig_reel_id` | IG Reel post id |
| `buffer_fb_reel_id` | FB Reel post id |
| `buffer_tt_reel_id` | TikTok post id |
| `daily_video_format` | Format name written back for audit |

---

## 7) Compliance gate (video-specific)

Before Buffer nodes, keep / extend Parse `compliance_check.ok`:

1. Display name = chemical names only  
2. No nickname leakage in caption or creative_brief  
3. Disclaimer present at end of IG + FB + TikTok captions  
4. Video motion prompt contains denylist blockers (no people / needles / clinics)  
5. If compliance fails → **do not** call video or Buffer; Sheets flag  

Optional: Code node `Compliance_Video_Guard` that rejects prompts containing banned tokens before `Grok_Video_Start`.

---

## 8) Phased build order (do in this sequence)

### Phase A — Smoke (no Buffer)
1. Manual trigger with known `reel_still_url` (or generate one Imagine 9:16 photoreal)  
2. `Grok_Video_Start` + poll until `done`  
3. Open `video.url` — confirm photoreal motion, readable type, no banned visuals  
4. Pin working model id + JSON body  

### Phase B — Wire into daily flow
1. Add Prep video fields  
2. Add `Grok_Imagine_Reel_Still` photoreal prompt  
3. Extend `Save_render_URL`  
4. Video start/poll/save  
5. Buffer IG Reel + FB Reel only  

### Phase C — TikTok
1. Connect TikTok in Buffer; capture `channelId`  
2. Smoke one `Buffer_TT_Reel`  
3. Add to chain + Sheets column  

### Phase D — Harden
1. Poll loop + failure path  
2. Compliance guard  
3. Decide image-feed keep vs video-only days (cost)  
4. Optional Story video (6s) from story still  

---

## 9) Realistic still prompt (for `Grok_Imagine_Reel_Still`)

Use a dedicated Imagine body (9:16), separate from the abstract hex poster:

```text
Photoreal vertical 9:16 laboratory science catalog still for Palm Beach Vitality.
HERO SUBJECT (required): a clear research vial of {{ chemical_name }} as laboratory research material.
SCENE WORLD (required): science lab, chemistry glassware, synthesis bench, engineering / prototype fixtures, assay instruments, sterile health-science research atmosphere, vial racks, flasks, beakers, acrylic risers.
Environment: dark premium American research lab, cool electric-blue rim lighting, soft haze, realistic glass refraction, shallow depth of field.
Typography on image (exact, no extras):
- Headline: {{ figma_headline }}
- Subhead: {{ figma_subhead }}
- Small footer: For laboratory research use only. Not for human use.
HARD BAN — never depict: pens, pen injectors, autoinjectors, writing pens, pencils, markers, syringes in use, needles, injection acts, people, hands, clinics, gyms, lifestyle.
Ignore product_form if it says Pen — always show a research VIAL, never a pen.
No nicknames. No purity percentages unless provided in input. No FDA approval claims.
Look like a high-end laboratory science / chemistry / engineering catalog photo, not an illustration.
```

---

## 10) Risks & mitigations

| Risk | Mitigation |
|---|---|
| AI video invents benefit text | Lock typography to source still; motion prompt “no new words”; prefer 1.5 I2V |
| Unrealistic / cartoon motion | Photoreal still source + realism motion prompt; reject T2V as default |
| Buffer duplicate guard | Slightly different captions per channel; stagger or share one asset with unique text |
| TikTok channel missing | Phase C gate — do not block IG/FB |
| Poll timeout | Max iterations + Sheets `video_failed` + continue with image posts optional |
| Cost overrun | 1×8s/day; review bill after 7 days before Story videos |
| Nickname / claim leakage | Compliance_Video_Guard + existing Parse flags |
| Audio says something risky | Prefer silent or ambient-only prompt line: “no voiceover, no spoken words” |

---

## 11) Definition of done (first production week)

- [ ] Daily run produces `video_url` for week’s compound  
- [ ] IG Reel + FB Reel queued via Buffer with research-safe captions + disclaimer  
- [ ] TikTok Reel queued (once channel connected)  
- [ ] Videos look photoreal (Sal visual QA on 3 consecutive days)  
- [ ] Sheets writeback includes video + Buffer reel IDs  
- [ ] Zero posts with human-use / nickname / missing disclaimer  

---

## 12) Immediate next actions (when Sal says go)

1. Confirm Buffer **TikTok** connected (or defer TT)  
2. Smoke-test xAI `grok-imagine-video-1.5` I2V with one PBV product still  
3. Build `Grok_Imagine_Reel_Still` + video start/poll in n8n  
4. Buffer IG + FB Reels  
5. Sal visual QA → then enable Schedule  

---

## Appendix — constants (current)

| Item | Value |
|---|---|
| Buffer GraphQL | `POST https://api.buffer.com` |
| IG channel | `6a668d534b2d03035f478536` |
| FB channel | `6a668d6b4b2d03035f478575` |
| TT channel | **TBD** |
| xAI video start | `POST https://api.x.ai/v1/videos/generations` |
| xAI video poll | `GET https://api.x.ai/v1/videos/{request_id}` |
| Primary video model | `grok-imagine-video-1.5` |
| Default duration | `8` |
| Aspect | `9:16` |
| Resolution | `720p` |
