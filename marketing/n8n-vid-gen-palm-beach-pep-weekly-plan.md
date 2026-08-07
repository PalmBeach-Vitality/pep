# vid_gen_palm_beach_pep — n8n Automation Plan (Vid Gen + Voiceover)

**Status:** Plan for Sal review (do not build nodes until approved)  
**Owner:** Sal + cloud agent  
**Workflow name (n8n):** `vid_gen_palm_beach_pep`  
**Cadence:** Weekly (or Manual) — Palm Beach Pep breakdown  
**Sheet / CSV:** `150-pb-pep-scenes` / `marketing/sheets/150-pb-pep-scenes.csv`  
**Final cut target:** **1–2 minutes** (sweet spot **~90–110s**; hard band 60–120s)

**HARD RULES**
- Do **not** modify any spreadsheet unless Sal names it by **exact name**.
- Keep this workflow **fully separate** from `vid_gen_landscape_scenes` and the original spotlight workflow.
- New node names: `lower_case_with_underscores`.
- After any CSV/file update, paste the **hard GitHub link** in the same reply.

---

## 0) Duplicate check (from n8n notes)

### What the notes say we can duplicate
From `n8n-video-nodes-step-by-step.md` and `n8n-vig-gen-500-scenes-plan.md`:

| Action | Guidance |
|---|---|
| **Duplicate nodes** | Yes — duplicate working HTTP nodes for Imagine still, video start/poll, Buffer, Save URL |
| **Duplicate whole landscape workflow as a shell** | **Yes, recommended** — copy `vid_gen_landscape_scenes` → rename to `vid_gen_palm_beach_pep`, then rewire (keeps auth/credentials) |
| **Edit original spotlight / landscape in place** | **No** — notes: keep separate; do not change the original image/vig workflow |

### Recommended start method
1. In n8n: **Duplicate** workflow `vid_gen_landscape_scenes`  
2. Rename copy → `vid_gen_palm_beach_pep`  
3. Keep credentialed nodes (Sheets, xAI Bearer, Buffer)  
4. Delete / bypass landscape-only creatives that conflict with Pep  
5. Rebuild Pep beat + TTS + stitch chain using duplicated node patterns  

**Do not** wire Pep into the live landscape rotation sheet.

### Nodes to clone as templates (from working video chain)

| Clone from (landscape / spotlight) | Becomes in Pep workflow |
|---|---|
| Sheets pull / filter / sort / Limit | `pull_pep_sheets` → `limit_one_pep` |
| `Prep_day_variant` / prep code | `prep_pep_breakdown` + `prep_pep_beats` |
| `edit_fields` + `grok_api` + `parse_grok` | `edit_fields_pep_caption` → `parse_pep_caption` |
| `grok_imagine_reel_still` / Imagine HTTP | `grok_pep_still_*` (×8) |
| `grok_video_start` + `wait_video` + `grok_video_poll` + `if_video_ready` | `beat_x_video_start` / wait / poll / if (×8) |
| `save_video_url` | `save_pep_outputs` |
| `buffer_ig_reel` / `buffer_fb_reel` | `buffer_pep_ig` / `buffer_pep_fb` (+ TT if connected) |
| `sheets_update_creation` | `sheets_update_pep` |

**Create from scratch (not in landscape):**
- `tts_pep_voice_over`
- `stitch_pep_master` (ffmpeg / merge service)
- Pep compliance IF + stop nodes
- Optional human-approval Wait/webhook gate

---

## 1) Goal

One weekly **Palm Beach Pep** long-form vertical video with **external voiceover** — a research-safe sales-pitch / breakdown story.

| Spec | Target |
|---|---|
| Final length | **1–2 minutes** (~90–110s preferred) |
| Aspect | **9:16** |
| Resolution | Prefer **1080p** (fallback 720p if model/stability requires) |
| Hero | Palm Beach Pep (10mL crimp-seal vial mascot) |
| Audio | **TTS voiceover** from sheet `voice_over` (+ `pep_script` accent line) |
| Model still | `grok-imagine-image-quality` · 2k |
| Model video | `grok-imagine-video-1.5` (image-to-video, max **15s per call**) |
| Caption LLM | `grok-4.5` (fallback `grok-4.3`) |
| Output | Master MP4 + captions + sheet writeback + Buffer post(s) |

### Why length forces multi-beat
Grok Imagine Video 1.5 hard-caps ~**15s/generation**. Seedance also ~15s.  
A 90–120s Pep pitch = **story-beat assembly** (not one API call).

---

## 2) Creative format — 8-beat Pep breakdown (~90–120s)

| Beat | Time (approx) | Job | Visual | VO job |
|---|---|---|---|---|
| **A** | 0–15s | Hook | Pep enters unique set, thumbs-up energy | Hello + compound name |
| **B** | 15–30s | What it is | Cleaner product / label clarity moment | Simple product description |
| **C** | 30–45s | Research angle | Lab / documentation cue in-scene | Research-context science line |
| **D** | 45–60s | World moment | Environment motion (landscape / fitness / lab from row) | Likeable research-safe beat |
| **E** | 60–75s | Quality / trust | QC / packaging / clean catalog vibe | Purity / documentation / catalog trust |
| **F** | 75–90s | Pep personality | Pep gesture / hat tip / settle | Short `pep_script` moment |
| **G** | 90–105s | CTA | Pep hold + catalog intent | Soft CTA + URL spoken carefully or on-caption |
| **H** | 105–120s | Compliance close | Calm end hold | **Full disclaimer** (exact) |

**Sweet spot:** often end after beat G (~90–105s) if VO finishes cleanly; use H when script needs the full minute+.

### Character lock (every still + video prompt)
- Clear **10mL** sterile injectable-style glass vial  
- Rubber stopper + **silver aluminum crimp** only  
- White label face + bold `10ml`  
- White baseball cap with blue molecular pattern  
- Gray tube limbs, white gloves/sneakers, thumbs-up  
- Clean sticker / clip-art style  

**Forbidden:** black twist/screw caps; humans; hospitals/doctor offices/exam rooms; injection demos; hazard signage; nickname overlays (no KLOW / Wolverine / GLOW); disease/results claims.

### Voiceover / compliance
Source columns: `voice_over`, `pep_script`, `product_description`, `disclaimer_short`, `caption_lock`, `canonical_url`.

**Mandatory closer (exact):**
```text
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

**VO may:** chemical names, “research peptide / laboratory research material”, format facts, documentation/purity language.  
**VO must never:** treat/heal/cure, fat-loss/gains outcomes, dosing protocols, “FDA approved”, doctor-recommended.

Native model audio: **off / ambient only**. Spoken pitch = TTS we control.

---

## 3) Sheet plan

### Current
- File: `marketing/sheets/150-pb-pep-scenes.csv`  
- 150 unique Active rows  
- 9-lab / high-quality vid-gen columns + Pep VO fields  
- `duration_seconds` currently `70` → update to **`120`** (or `90`) after Sal confirms target  
- VO cells are **single-line / tight** for Sheets readability  

### Recommended column adds (only after Sal names the sheet)
| Column | Purpose |
|---|---|
| `target_duration_seconds` | `90` or `120` |
| `beat_count` | `8` |
| `beat_a_brief` … `beat_h_brief` | Per-beat visual briefs |
| `vo_beat_a` … `vo_beat_h` | Timed VO segments for cleaner mux |
| `final_video_url` | Master writeback |
| `beat_a_video_url` … `beat_h_video_url` | Optional per-beat reruns |
| `tts_audio_url` | TTS writeback |
| `caption_ig` / `caption_fb` / `caption_tt` | Optional |

Until added: `prep_pep_beats` derives 8 beats from `scene_brief` + `surface` + `voice_over`.

**Spreadsheet touch:** only when Sal names exact tab (candidate: `150-pb-pep-scenes`).

---

## 4) Full node sequence (~40–48 nodes, quality-first)

```text
schedule_weekly                    # or manual_trigger for smokes
  → pull_pep_sheets
  → filter_pep_active
  → sort_pep_rotation
  → limit_one_pep
  → prep_pep_breakdown
  → prep_pep_beats                 # builds 8 beat briefs + VO segments
  → edit_fields_pep_caption
  → grok_pep_caption
  → parse_pep_caption
  → if_pep_compliance
       ├─ false → stop_compliance_fail
       └─ true  → grok_pep_still_a … grok_pep_still_h
                    → if_pep_still_qc
                         ├─ false → stop_still_fail
                         └─ true  → [for each beat A–H]:
                                      beat_x_video_start
                                      → wait_beat_x
                                      → beat_x_video_poll
                                      → if_beat_x_ready
                                    → tts_pep_voice_over
                                    → stitch_pep_master
                                    → if_master_ready
                                    → save_pep_outputs
                                    → buffer_pep_ig
                                    → buffer_pep_fb
                                    → buffer_pep_tt          # gated
                                    → sheets_update_pep
```

### Node count estimate
| Build | Nodes |
|---|---|
| Core happy path (8 beats fully expanded) | **~42–48** |
| If beat video trio is looped via SplitInBatches | **~28–34** (fewer canvas nodes, harder debugging) |

**Recommendation:** full expanded beat sequence for first month (quality / likeability / easier smoke). Compact to a loop later if Sal wants a cleaner canvas.

---

## 5) Phase build order (no rush)

| Phase | What | Done when |
|---|---|---|
| **0** | Duplicate `vid_gen_landscape_scenes` → rename `vid_gen_palm_beach_pep` | Empty Pep workflow exists with working credentials |
| **A** | Pick one Active Pep row from `150-pb-pep-scenes` | Returns `creation_id` + compound + surface |
| **B** | Captions + compliance IF | Captions lock compound; fail path stops run |
| **C** | 8 Pep stills (or start with 4, then scale) | Sal likes Pep likeness on sample scene |
| **D** | Beat A video only (15s I2V) | One good Pep motion clip |
| **E** | Beats B–H | All beats pass likeness; regenerate bad beats only |
| **F** | TTS + stitch to 90–120s master | VO ends on exact disclaimer; cut feels like a pitch |
| **G** | Buffer + sheet writeback | Post lands; next weekly run advances rotation |

**Do not wire Buffer until Sal approves a master cut.**

---

## 6) Technical notes (length + quality)

### Video generation
- Per beat: `POST /v1/videos/generations` · `grok-imagine-video-1.5` · duration **12–15** · image = that beat’s still · `9:16`
- Poll pattern: duplicate landscape `wait_video` / `grok_video_poll` / `if_video_ready`
- **Primary path = 8 still→video beats + stitch** (best story control for Pep)
- **Fallback:** Grok `/v1/videos/extensions` if a seam looks worse than extend continuity
- Reroll single beats when Pep face/hat drifts — don’t accept a bad beat to “finish”

### Stitch + VO
- Concat A→H (or A→G) with ffmpeg / merge API  
- Prefer hard cuts on Pep hold frames  
- Mux TTS over silent/ambient visuals  
- Normalize loudness; keep VO clear  
- Burned-in text v1: avoid (compliance safer in caption/VO)

### TTS
- ElevenLabs or OpenAI — Sal chooses house voice  
- Script from sheet; split to `vo_beat_*` when columns exist  
- Target speaking pace for **~90–110s** finished VO

### Cost / runtime (rough, weekly)
- 8 stills + ~8×15s video ≈ heavy vs daily 15s reels, but **weekly once** is fine  
- Wall clock often **30–90+ minutes** with polling  
- Confirm live xAI + TTS pricing before unattended runs  

---

## 7) Lane split (do not mix)

| Lane | Workflow | VO | Settings |
|---|---|---|---|
| Photoreal catalog | `vid_gen_landscape_scenes` | No spoken claims (ambient/silent) | Catalog film rules |
| **Pep breakdown** | **`vid_gen_palm_beach_pep`** | **Yes — controlled TTS** | Landscape / clean lab / fitness OK; no hospitals/clinics |

---

## 8) Open decisions for Sal

1. **Length lock:** prefer **~90s** or full **~120s**?  
2. **Start method confirm:** Duplicate landscape workflow as shell — yes/no?  
3. **TTS vendor/voice:** ElevenLabs vs OpenAI (any house voice)?  
4. **Human gate:** stills / master-before-Buffer / fully auto?  
5. **Channels:** IG only, IG+FB, or IG+FB+TT?  
6. **Exact sheet tab name** when imported: `150-pb-pep-scenes`?  
7. **Add beat columns now** before node build, or derive in Code for v1?  
8. Your message cut off at **“i need to”** — anything else to bake into this plan?

---

## 9) Double-check log

| Check | Result |
|---|---|
| Can we duplicate a current workflow? | **Yes as a shell** — duplicate `vid_gen_landscape_scenes`, rename, rewire. Duplicate individual video/Buffer nodes per notes. |
| Edit landscape/original in place? | **No** |
| Native 1–2 min in one Grok call? | **No** (~15s cap) → 8-beat stitch + TTS |
| Seedance as longer-clip shortcut? | **No** (~15s) |
| Sheet ready? | `150-pb-pep-scenes.csv` exists (150 unique rows, tight cells) |
| Prior 45s plan? | Superseded by this 1–2 min plan |
| Compliance closer | Exact disclaimer required |
| Node naming | `lower_case_with_underscores` |

---

## 10) Next actions after approval
1. Capture Section 8 answers (including unfinished “i need to…”)  
2. Duplicate landscape workflow → `vid_gen_palm_beach_pep`  
3. If Sal names the sheet: update `duration_seconds` / add beat columns + send hard CSV link  
4. Build Phase A pick chain and smoke one row  
5. Hero smoke scene: Sal picks favorite `PEP-###` (default suggestion `PEP-001`)
