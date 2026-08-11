# Palm Beach Pep — Character Lock (#1 PRIORITY)

## #1 RULE (NON-NEGOTIABLE)
**Pep must look EXACTLY like the master every single still, every single time.**  
Zero redesign. Zero “close enough.” Zero new face / hat / vial / gloves / sneakers.

If a still drifts → **discard and reroll**. Never send a drifted still into `ai_vid_generator`.

## Canonical master (LOCKED)
**Public URL:** `https://files.catbox.moe/2yfdbi.jpg`  
**Repo backup:** `marketing/assets/palm-beach-pep-master.jpg`  
**n8n field:** `pep_ref_url` on `Prep_day_variant` (passed through `prep_pep_beats`)

Master identity (must match 1:1):
- Clear glass **10ml** vial + silver aluminum crimp seal
- White label: big cartoon eyes, open smile + pink tongue, rosy cheeks, bold **10ml**
- White baseball cap with **Palm Beach Vitality** sunset + palm-tree logo (not molecular)
- Gray tube limbs, white cartoon gloves, rounded white sneakers
- Thumbs-up pose language allowed only as slight pose — face/hat/body art unchanged
- Clean sticker / 3D-cartoon illustration style with bold outlines

---

## Why Pep was drifting
Text-heavy “create a scene with Pep…” lets Grok **invent a new character**.  
We only allow **EDIT the master** (`/v1/images/edits`) with `<IMAGE_0>` = master.

---

## Path A — Strong EDIT (use now)
**Node:** `grok_imagine_reel_still`  
**URL:** `POST https://api.x.ai/v1/images/edits`  
**Body:** paste `marketing/n8n-pep-grok-still-body-lock.txt`

Must be true in request preview:
1. Endpoint is `/images/edits` (not `/generations`)
2. `images[0].url` is exactly the master URL
3. Prompt starts with `EDIT <IMAGE_0> only` + `PIXEL-IDENTITY locked`
4. Prompt forbids redesign; only background + tiny pose change

**QC gate (manual for now):** open still next to master. Face, hat logo, crimp, 10ml label, gloves, sneakers must match. If not → rerun node.

---

## Path B — 100% lock (true identical pixels)
Grok edits can still morph. For **literally 100%** the same Pep:

1. Keep master Pep as the character layer (same file every time)
2. Generate **background only** (no mascot in the plate)
3. Composite Pep on top (same scale/placement rules)
4. That composite = `reel_still_url` → then fal Kling I2V

Until composite is wired, Path A + hard QC/reroll is required. Do not ship drifted Pep.

---

## Beat images
| Beat | `images` |
|---|---|
| A | `[pep_master]` only |
| B–D | `[pep_master, still_a]` — master always `<IMAGE_0>` |

## Video
I2V (`ai_vid_generator`) must start from a QC-passed still. Bad still → bad video. Character lock is won or lost at the still step.

## Paste files
- Lock still body: `marketing/n8n-pep-grok-still-body-lock.txt`
- Execute: `marketing/n8n-vid-gen-palm-beach-pep-execute.md`
