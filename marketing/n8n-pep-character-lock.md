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
- White label: two even cartoon eyes (white ovals, round black pupils, tiny catchlights, **same lash state as the master**), open smile + pink tongue, rosy cheeks, bold type that is exactly **10ml** (four characters only — no extra letter, no **10mlz**)
- White baseball cap with **Palm Beach Vitality** sunset + palm-tree logo (not molecular)
- Gray tube limbs, white cartoon gloves, rounded white sneakers
- Master file is a planted thumbs-up. Video stills MUST change pose to mid-stride walk (toward camera, slight 3/4, screen-right), mouth open mid-word, no thumbs-up. Face/hat/vial/gloves/sneakers stay identical.
- Clean sticker / 3D-cartoon illustration style with bold outlines

---

## Why Pep was drifting
Text-heavy “create a scene with Pep…” lets Grok **invent a new character**.  
We only allow **EDIT the master** (`/v1/images/edits`) with `<IMAGE_0>` = master.

---

## Path A — LOCKED WORKING EDIT (Sal QC pass)
**Node:** `grok_imagine_reel_still`  
**URL:** `POST https://api.x.ai/v1/images/edits`  
**Timeout:** `300000`  
**Body:** paste **only** the expression in `marketing/n8n-pep-grok-still-body-lock.txt` (no `#` comments in the field)

Working config (do not change without Sal QC):
- model: `grok-imagine-image`
- resolution: `1k`
- shape: singular `image: { url, type: 'image_url' }`
- master default: GitHub raw `marketing/assets/palm-beach-pep-master.jpg`

**Approved still example (Pep likeness pass):**  
https://imgen.x.ai/xai-imgen/xai-tmp-imgen-85b8f792-9b01-9cf8-9f27-b990bda1fd41-4c613761.jpeg

Must be true in request preview:
1. Endpoint is `/images/edits`
2. `image.url` is the master
3. `image.type` is `image_url`
4. Prompt starts with `EDIT THIS IMAGE ONLY` + identity lock

**QC gate:** open still next to master. Face / hat logo / crimp / gloves / sneakers must match. The two cartoon eyes must stay the same ovals (not warped, crossed, or uneven). Copy the master’s lash state from frame one — master currently has none, so the still should have none. Label type must be exactly `10ml` — discard `10mlz` or any extra glyph after the `l`. Pose is standing at ease (not the master thumbs-up). Mouth must be a talking AH/OH, not a wide held grin. If identity drifts, eyes smear, lashes appear that the master does not have, label type is wrong, pose is thumbs-up, or mouth is a grin-hold → rerun. Do not send a bad still into OmniHuman. In the talking clip, those same ovals SHOULD blink and look around. Lashes are OK if they exist from 1s matching the still, or are absent the whole clip. **HARD FAIL mid-clip lash grow-in** (new lashes after the first blink).

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
