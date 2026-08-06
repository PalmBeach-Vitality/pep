# vid_gen_palm_beach_pep — Weekly Breakdown Plan (Option 2)

**Status:** Plan for Sal review (do not build nodes until approved)  
**Owner:** Sal + cloud agent  
**Workflow name (n8n):** `vid_gen_palm_beach_pep`  
**Cadence:** **Once per week** (Cron or Manual)  
**Approach:** Option 2 — **story-beat assembly** (quality / likeability / compliance first)  
**Sheet / CSV:** `50_palm_beach_pep_reel_scenes` / `marketing/sheets/50_palm_beach_pep_reel_scenes.csv`  
**Current batch:** 20 scenes drafted (target 50 after Sal approves tone)

**HARD RULES**
- Do **not** modify any spreadsheet unless Sal names it by **exact name**.
- Keep this workflow **fully separate** from `vid_gen_landscape_scenes` and the original spotlight workflow.
- New node names: `lower_case_with_underscores`.
- After any CSV/file update, paste the **hard GitHub link** in the same reply (`marketing/AGENT_RULEBOOK.md`).

---

## 1) Goal

Produce one **Palm Beach Pep weekly breakdown** video — a short, likeable research-catalog “sales pitch” story starring Pep — then post + write back.

| Spec | Target |
|---|---|
| Final length | **~45 seconds** (acceptable band 40–55s; stretch to ~60s only if beats hold quality) |
| Aspect | **9:16** |
| Resolution | Prefer **1080p** where model allows; fallback **720p** if needed for stability |
| Hero | **Palm Beach Pep** (10mL crimp-seal vial mascot) |
| Audio | **External TTS voice-over** from sheet `voice_over` (+ short `pep_script` moment) — not model-native speech claims |
| Output | 1 weekly Reel-ready MP4 + caption package + sheet writeback |

### Success criteria
1. Pep is clearly recognizable and consistent across all beats  
2. Story feels like a friendly mini pitch (hook → product → moment → CTA), not a random loop  
3. VO + captions are simple and **FDA / research-use compliant**  
4. No doctor offices, hospitals, clinical exam rooms, human injection, disease/treatment claims  
5. One Active unused scene is consumed and written back each successful weekly run  

---

## 2) Why Option 2 (confirmed)

| Option | Decision |
|---|---|
| Grok single 15s | Too short for a pitch story |
| Grok Extend-only chain | Possible, but Pep drift risk rises; weaker “scene change” storytelling |
| Seedance as “longer clip API” | **No** — also ~15s hard cap |
| **Option 2: 3–4 story beats + stitch + TTS** | **Chosen** — best control for quality, likeability, compliance |

**Important lane split**
- Photoreal catalog reels (`vid_gen_landscape_scenes` / product stills) = no mascot, stricter “no gym / no VO claims” catalog film.
- **Pep weekly breakdown** = separate creative lane. Fitness / landscape / clean lab OK. Friendly VO OK **only** with research-use language.

---

## 3) Creative format — “Weekly Pep Breakdown”

### 3.1 Four-beat story structure (~45s)

| Beat | Time | Job | Visual intent | VO intent |
|---|---|---|---|---|
| **A — Hook** | ~0–12s | Meet Pep + setting | Pep enters / holds in scene; thumbs-up energy | Warm hello + compound name |
| **B — Product** | ~12–24s | What it is | Cleaner product-focus moment (Pep + label/product clarity) | Simple product description; research format |
| **C — World** | ~24–36s | Setting moment | Environment motion (lab / fitness / landscape from row) | One likeable research-safe line; no claims |
| **D — CTA close** | ~36–45s | Close + compliance | Pep thumbs-up hold; calm end card energy | CTA to catalog URL + **full disclaimer** |

Total target: **~45s**. If a beat fails quality, regenerate that beat only — do not accept a bad Pep face just to finish the run.

### 3.2 Character lock (every still + video prompt)

Palm Beach Pep must remain:
- Clear **10mL** sterile injectable-style glass vial  
- Rubber stopper + **silver aluminum crimp** only  
- White label face (big eyes, smile, pink tongue, rosy cheeks) + bold `10ml`  
- White baseball cap with **blue molecular** pattern  
- Gray tube limbs, white gloves, white sneakers  
- Optimistic thumbs-up personality  
- Clean sticker / clip-art style with thick outlines  

**Forbidden visual**
- Black twist caps, screw caps, droppers  
- Humans / doctors / nurses / patients  
- Hospitals, doctor offices, exam rooms  
- Needles entering bodies, injection demos  
- Hazard / biohazard / caution signage or alert words  
- Nickname overlays (no KLOW / Wolverine / GLOW on screen)  
- Before/after bodies, disease claims, “results” graphics  

### 3.3 Voice-over / compliance north star

VO source of truth = sheet columns:
- `voice_over` (main 45s script; rewrite later to beat timings)
- `pep_script` (short character line, optional mid/end)
- `product_description`
- `disclaimer_short`
- `caption_lock`
- `canonical_url`

**Mandatory spoken + caption closer (exact):**
```text
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```

**VO may say**
- chemical / peptide name  
- “research peptide” / “laboratory research material”  
- “research use only” / “not for human use”  
- format facts (10mL vial, crimp-seal, catalog listing)  

**VO must never say**
- treat / heal / cure / recover / anti-aging results  
- fat loss / weight loss / gains / performance outcomes  
- dosing, protocols, “stack for…” human use  
- FDA approved / clinic recommended / doctor recommended  

Likeability rule: friendly and simple > hype. Pep sounds like a helpful lab buddy, not a medical salesman.

---

## 4) Sheet / CSV plan

### 4.1 Current file
- `marketing/sheets/50_palm_beach_pep_reel_scenes.csv`
- Same base columns as `500_peptide_wellness_reel_scenes`
- Extra: `voice_over`, `pep_script`, `product_description`, `disclaimer_short`
- `workflow` = `vid_gen_palm_beach_pep`
- Batch 1 = 20 rows (Sal reviewing)

### 4.2 Recommended column additions (after Sal approves plan)

Do **not** edit the sheet until Sal says yes. Proposed adds:

| Column | Purpose |
|---|---|
| `target_duration_seconds` | Final cut target (`45`) |
| `beat_count` | `4` |
| `beat_a_brief` | Hook visual brief |
| `beat_b_brief` | Product visual brief |
| `beat_c_brief` | World / setting brief |
| `beat_d_brief` | CTA close brief |
| `vo_beat_a` / `vo_beat_b` / `vo_beat_c` / `vo_beat_d` | Timed VO segments for cleaner mux |
| `final_video_url` | Writeback for stitched master |
| `beat_a_video_url` … `beat_d_video_url` | Optional per-beat writebacks for reruns |
| `tts_audio_url` | Writeback for generated VO audio |
| `caption_ig` / `caption_fb` / `caption_tt` | Optional parsed caption writebacks |

Until those exist, Phase 1 can derive beats in `prep_pep_beats` from `scene_brief` + `voice_over`.

### 4.3 Spreadsheet touch rule
Only touch a sheet Sal names exactly. Candidate tab name when imported: **`50_palm_beach_pep_reel_scenes`**.

---

## 5) Full node sequence (quality-first, ~28–32 nodes)

Exact names below are the build contract.

```text
schedule_weekly
  → pull_pep_sheets
  → filter_pep_active
  → sort_pep_rotation
  → limit_one_pep
  → prep_pep_breakdown
  → prep_pep_beats
  → edit_fields_pep_caption
  → grok_pep_caption
  → parse_pep_caption
  → if_pep_compliance
       ├─ false → stop_compliance_fail
       └─ true  → grok_pep_still_a
                    → grok_pep_still_b
                    → grok_pep_still_c
                    → grok_pep_still_d
                    → if_pep_still_qc
                         ├─ false → stop_still_fail   (or manual rerun path)
                         └─ true  → beat_a_video_start
                                      → wait_beat_a
                                      → beat_a_video_poll
                                      → if_beat_a_ready
                                      → beat_b_video_start
                                      → wait_beat_b
                                      → beat_b_video_poll
                                      → if_beat_b_ready
                                      → beat_c_video_start
                                      → wait_beat_c
                                      → beat_c_video_poll
                                      → if_beat_c_ready
                                      → beat_d_video_start
                                      → wait_beat_d
                                      → beat_d_video_poll
                                      → if_beat_d_ready
                                      → tts_pep_voice_over
                                      → stitch_pep_master
                                      → if_master_ready
                                      → save_pep_outputs
                                      → buffer_pep_ig
                                      → buffer_pep_fb
                                      → buffer_pep_tt          (gate: only if TikTok connected)
                                      → sheets_update_pep
```

### Node count
- **Core happy path:** ~28 nodes  
- **With explicit fail stops + TikTok:** ~30–32 nodes  
- Intentionally **not** compacted into one loop — Sal preferred full sequence for quality control and easier smoke tests.

---

## 6) Node-by-node build plan

### Phase A — Weekly pick (1 scene)

| Node | Type | Purpose |
|---|---|---|
| `schedule_weekly` | Schedule Trigger | Cron weekly (e.g. Monday 10:00 local). Also keep Manual Trigger sibling for smoke tests. |
| `pull_pep_sheets` | Google Sheets | Read tab Sal names (`50_palm_beach_pep_reel_scenes` when ready) |
| `filter_pep_active` | Filter | `status = Active` |
| `sort_pep_rotation` | Sort | `last_used_at` ASC → `times_used` ASC → `rank` ASC |
| `limit_one_pep` | Limit | Max items = **1** |

**Smoke A:** returns one `creation_id`, compound, setting surface.

### Phase B — Prep + compliance captions

| Node | Type | Purpose |
|---|---|---|
| `prep_pep_breakdown` | Set / Code | Lock row fields: ids, URLs, Pep character lock, disclaimer, target 45s |
| `prep_pep_beats` | Code | Build `beat_a/b/c/d` briefs + motion prompts + VO segments from sheet (or dedicated beat cols later) |
| `edit_fields_pep_caption` | Set | System/user prompts for IG/FB/TT captions; force `caption_lock` + disclaimer |
| `grok_pep_caption` | HTTP | `grok-4.5` (fallback `grok-4.3`) caption package |
| `parse_pep_caption` | Code | Parse JSON captions; strip banned claim words |
| `if_pep_compliance` | IF | Fail if missing disclaimer, wrong compound, banned phrases, nickname leakage |
| `stop_compliance_fail` | Stop / NoOp | End run; do not generate media |

**Smoke B:** captions mention only locked compound + research-use closer.

### Phase C — Four Pep stills (consistency first)

| Node | Type | Purpose |
|---|---|---|
| `grok_pep_still_a` | HTTP Imagine | Hook still from beat A brief + character lock |
| `grok_pep_still_b` | HTTP Imagine | Product still |
| `grok_pep_still_c` | HTTP Imagine | World / setting still |
| `grok_pep_still_d` | HTTP Imagine | CTA close still |
| `if_pep_still_qc` | IF | Basic checks: URL present for all 4; optional later: vision QC |
| `stop_still_fail` | Stop / NoOp | Stop before expensive video if stills incomplete |

**Still model:** `grok-imagine-image-quality`  
**Aspect:** `9:16` · **still_resolution:** `2k`

**Consistency tactic**
- Same character-lock paragraph in every still prompt  
- Same wardrobe / vial spec every time  
- Beat prompts change **pose + environment action**, not Pep’s identity  
- Optional later upgrade: feed still A as reference into B/C/D if multi-image edit proves more stable

**Smoke C:** Sal reviews 4 stills before enabling auto video (first 2–3 weeks recommended).

### Phase D — Four image-to-video beats (full sequence)

For each beat `a/b/c/d`:

| Node | Type | Purpose |
|---|---|---|
| `beat_x_video_start` | HTTP | `POST /v1/videos/generations` · model `grok-imagine-video-1.5` · image = that beat’s still · duration **12** (or 10–15) · `9:16` |
| `wait_beat_x` | Wait | 20–30s |
| `beat_x_video_poll` | HTTP | `GET /v1/videos/{request_id}` |
| `if_beat_x_ready` | IF | `done` → continue · `pending` → loop wait · `failed/expired` → stop |

**Video prompt rules**
- Animate the provided still only  
- Preserve Pep identity + product lock  
- No new on-screen text  
- No humans  
- Silent or ambient-only from model — **final spoken VO comes from TTS**  
- Motion matched to beat (hook settle / product push-in / world drift / CTA hold)

**Why 4 separate still→video beats instead of Extend-only**
- Cleaner storyboard control  
- Easier per-beat rerolls when Pep face/hat drifts  
- Better likeability for a pitch structure  
- Extend can be a **fallback** later if stitch seams feel worse than extend seams

**Smoke D:** each beat alone looks good; Pep recognizable in all four.

### Phase E — Voice-over + master stitch

| Node | Type | Purpose |
|---|---|---|
| `tts_pep_voice_over` | HTTP | Generate VO from approved script (ElevenLabs or OpenAI TTS — Sal chooses voice) |
| `stitch_pep_master` | HTTP / Code / Execute Command | Concat beats A→D, mux TTS, light ducking if needed, export 9:16 MP4 |
| `if_master_ready` | IF | Master URL/file exists and duration in band |
| `save_pep_outputs` | Set | Collect `reel_still_url` (still A or contact sheet), beat URLs, `final_video_url`, `tts_audio_url`, captions |

**Stitch notes**
- Prefer hard cuts on Pep hold frames (less morphy than forced continuous extend)  
- Optional 6–10 frame crossfade only if cuts feel abrupt  
- Burned-in text: **avoid** in v1 (compliance safer in caption/VO). End-card text only if using approved exact strings  
- Normalize audio; keep VO clear over soft bed if any  

**Smoke E:** 40–55s master plays with VO ending on exact disclaimer.

### Phase F — Post + writeback

| Node | Type | Purpose |
|---|---|---|
| `buffer_pep_ig` | HTTP | IG Reel from master URL + compliant caption |
| `buffer_pep_fb` | HTTP | FB Reel |
| `buffer_pep_tt` | HTTP | TikTok **only if** Buffer channel connected |
| `sheets_update_pep` | Google Sheets | Match `creation_id` · set `last_used_at`, `times_used+1`, URLs |

**Smoke F:** sheet shows writeback; next weekly run picks a different `creation_id`.

---

## 7) Suggested build order (no rush)

Build and smoke **one phase at a time**. Do not wire Buffer until Sal likes the master cut.

| Step | Phase | Done when |
|---|---|---|
| 1 | A pick | One Active Pep row returns |
| 2 | B captions/compliance | Compliant caption JSON; fail path works |
| 3 | C stills | Sal approves Pep likeness on 1 sample scene |
| 4 | D beat A only | One good 10–15s Pep motion clip |
| 5 | D beats B–D | All four beats pass likeness check |
| 6 | E TTS + stitch | 45s master feels like a mini pitch |
| 7 | F Buffer + writeback | Weekly post lands; rotation advances |

---

## 8) Weekly operating model

1. Monday (or chosen day): workflow runs once  
2. Picks next unused Active Pep scene  
3. Builds 4-beat breakdown + VO  
4. Posts to selected channels  
5. Writes back usage + URLs  
6. Sal spot-checks first few weeks; pause/rerun individual beats if Pep drifts  

Optional human gate (recommended for first month):
- Stop after `if_pep_still_qc` for Sal still approval  
- Or stop after `stitch_pep_master` for Sal master approval before Buffer

---

## 9) Cost / runtime expectations (rough)

Weekly once = low ops burden.

| Piece | Rough expectation |
|---|---|
| 4× quality stills | 4 Imagine image calls |
| 4× ~12s I2V | ~48s generated video |
| 1× TTS | one ~45s narration |
| Stitch | local/ffmpeg or merge API |
| Runtime | often 15–40+ minutes wall clock with polling |

Exact $ depends on live xAI / TTS pricing; confirm before scale. Because this is weekly, cost is secondary to quality.

---

## 10) Open decisions for Sal (review tomorrow)

Please mark yes/no or choose:

1. **Final length target:** lock **45s**? or prefer **60s** (adds drift/cost risk)?  
2. **TTS vendor/voice:** ElevenLabs vs OpenAI — any house voice already?  
3. **Human approval gate:** stills only / master before posting / fully automatic?  
4. **Channels at launch:** IG only, IG+FB, or IG+FB+TT?  
5. **Sheet name when imported:** confirm exact tab name `50_palm_beach_pep_reel_scenes`?  
6. **CSV beat columns now?** add beat/VO split columns before scenes 21–50, or derive in Code for batch 1?  
7. **Pep visual style:** keep sticker/cartoon mascot (current) — confirm not pivoting to photoreal vial-only for this workflow.

---

## 11) Double-check log (agent)

| Check | Result |
|---|---|
| Grok Imagine Video 1.5 single-call max | **15s** — cannot native 45s |
| Grok Video Extension API | Exists (`/v1/videos/extensions`); useful fallback, not primary for Option 2 |
| Seedance longer than 15s? | **No** — not a long-clip shortcut |
| Option 2 still valid for weekly pitch | **Yes** — 4 beats + TTS + stitch |
| Conflicts with photoreal “no gym / no VO” catalog rules | **Resolved by separate workflow lane**; Pep allows fitness/landscape + compliant VO |
| Pep CSV columns available for v1 | Yes for scripts; beat-split cols proposed, not yet written |
| Spreadsheet permission | Plan only — no sheet edits until Sal names exact sheet |
| Node naming | `lower_case_with_underscores` throughout |
| Separation from other workflows | Explicit — do not edit landscape/original chains |
| Compliance closer | Exact disclaimer required in VO + captions |
| Forbidden locations | No hospitals / doctor offices / exam rooms |
| Weekly cadence fit | Full ~30-node sequence OK because run frequency is low |

---

## 12) Out of scope for this plan
- Building the n8n nodes yet  
- Editing Google Sheets yet  
- Expanding to scenes 21–50 before Sal approves batch-1 tone  
- Switching to Seedance/Kling as primary (revisit only if Pep motion quality disappoints on Grok)

---

## 13) Next actions after Sal review
1. Capture answers to Section 10  
2. If approved: add beat columns to Pep CSV (and send hard link)  
3. Rewrite batch-1 `voice_over` into timed `vo_beat_*` segments  
4. Begin Phase A node build in empty `vid_gen_palm_beach_pep` workflow  
5. Smoke one hero scene end-to-end (recommend `PEP-001` or Sal’s favorite)
