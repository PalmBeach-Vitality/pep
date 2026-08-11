# Palm Beach Pep — Character Lock (exact likeness)

## Canonical master (LOCKED)
**Public URL:** `https://files.catbox.moe/2yfdbi.jpg`  
**Repo backup:** `marketing/assets/palm-beach-pep-master.jpg`  
**n8n field:** `pep_ref_url` on exact node `Prep_day_variant` / passed through exact node `prep_pep_beats`

This file is the single source of truth for Pep’s face, hat, body, gloves, and sneakers.

## What the master looks like (for prompts)
- Clear glass **10ml** vial body with silver aluminum crimp seal
- White wrap label: big cartoon eyes, open smile + pink tongue, rosy cheeks, bold **10ml**
- White baseball cap with **Palm Beach Vitality** sunset + palm-tree logo (not molecular)
- Gray tube limbs, white cartoon gloves, rounded white sneakers
- Thumbs-up pose on neutral gray background
- Clean sticker / 3D-cartoon illustration style with bold outlines

## Method (required)
Every still uses Grok **image edits** with this master as `<IMAGE_0>`:

```text
POST https://api.x.ai/v1/images/edits
model: grok-imagine-image-quality
images[0] = https://files.catbox.moe/2yfdbi.jpg
prompt    = EDIT <IMAGE_0> only. Keep character PIXEL-IDENTITY locked…
aspect_ratio: 9:16
resolution: 2k
```

**Prompt framing matters:** say **EDIT `<IMAGE_0>`** / keep identity locked — not “create a cartoon vial mascot.” Text-only generation will invent a new Pep.

Locked paste body: `marketing/n8n-pep-grok-still-body-lock.txt`

| Beat | `images` |
|---|---|
| A | `[pep_master]` |
| B–D | `[pep_master, still_a]` |

## QC checklist (before video)
1. URL is `/v1/images/edits` (not `/generations`)
2. Request body includes `images[0].url` = master (open the HTTP request preview and confirm)
3. Prompt starts with `EDIT <IMAGE_0> only`
4. Side-by-side Pep vs master: face, hat logo, crimp, gloves, sneakers match
5. Reroll drifted stills — do not animate a bad still
6. If catbox flakes, re-host master and update `pep_ref_url`

## Rules
- Do **not** redesign Pep from text alone
- Preserve hat logo, face, 10ml label, crimp seal, gloves, sneakers exactly
- Only change: slight pose + background/environment
- No humans, hospitals, doctor offices
- QC stills A–D before video; reroll drifted stills only
