# Image quality upgrade — 2K Grok Imagine Quality

Stay on **image-only** workflow. Goal: sharpest possible feed + story posters as **full lab scenes** (no product close-ups).  
Scene library + caption matching: `marketing/n8n-scene-caption-matching.md` + `marketing/sheets/3-image-scenes-150.csv`.

## API upgrades (both Imagine nodes)

| Setting | Value |
|---|---|
| Model | `grok-imagine-image-quality` |
| Resolution | **`2k`** (was default 1k) |
| Feed aspect | `1:1` |
| Story aspect | `9:16` |

Bodies to paste:
- Feed → `marketing/n8n-grok-imagine-body-feed.txt`
- Story → `marketing/n8n-grok-imagine-body-story.txt`

Raw links (this branch after push):
- https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/image-quality-upgrade-7786/marketing/n8n-grok-imagine-body-feed.txt
- https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/image-quality-upgrade-7786/marketing/n8n-grok-imagine-body-story.txt

---

## STEP 1 — Node `GROK_Imagine`

1. Open **`GROK_Imagine`**
2. Body → ƒx **ON**
3. Replace entire body with contents of `n8n-grok-imagine-body-feed.txt`
4. Confirm JSON includes `"resolution": "2k"`
5. Execute **`GROK_Imagine`** once
6. Open image URL — check: sharp type, today’s compound name, premium look

If API errors on `resolution`, tell me the exact error (we’ll fall back to 1k).

---

## STEP 2 — Node `Grok_imagine_story`

1. Open **`Grok_imagine_story`**
2. Body → ƒx **ON**
3. Replace entire body with contents of `n8n-grok-imagine-body-story.txt`
4. Confirm `"aspect_ratio": "9:16"` and `"resolution": "2k"`
5. Execute once and QA

---

## STEP 3 — Node `Prep_day_variant` (premium variables)

Add these fields (Include Other Input Fields = **ON**). New names = lowercase style for any *new* fields you create; existing `Prep_day_variant` name stays.

### `daily_image_type`
```text
{{ ({1:'premium catalog hero poster',2:'editorial research cover',3:'purity / quality seal card',4:'biochemical class spec sheet',5:'laboratory documentation frame',6:'research-use FAQ card',7:'precision close catalog end card'})[$now.weekday] || 'premium catalog hero poster' }}
```

### `daily_text_density`
```text
{{ ({1:'minimal — huge name, little body text',2:'editorial — strong headline + airy whitespace',3:'medium — name, subhead, three short bullets',4:'spec-dense — tight catalog labels, still readable',5:'banner-led — top bar + clean center name',6:'split — name one side, short copy other side',7:'card — frosted center panel with concise type'})[$now.weekday] || 'medium — name, subhead, three short bullets' }}
```

### Replace `daily_pattern` (less clutter = higher perceived quality)
```text
{{ ({1:'ultra-fine blueprint grid, 8% opacity',2:'soft paper grain + thin hairline rules',3:'faint isometric molecular wireframe',4:'subtle micro-dot matrix',5:'soft concentric sonar rings, very low contrast',6:'vertical hairline columns like a catalog folio',7:'polished dark glass reflection with sparse geometry'})[$now.weekday] || 'ultra-fine blueprint grid, 8% opacity' }}
```

### Replace `daily_visual_motif` (no pen/capsule)
```text
{{ ({1:'crystalline molecular lattice, glass refraction',2:'oversized compound-name as elegant typographic form',3:'research vial silhouette in frosted glass (no injector)',4:'translucent assay-well circles',5:'folded catalog folio ribbon',6:'minimal research-use seal emboss',7:'faceted mineral shard + clean specular highlight'})[$now.weekday] || 'crystalline molecular lattice' }}
```

Keep existing: `daily_color_scheme`, `daily_image_brief`, `daily_scene_seed` (if present).

---

## Quality checklist (after one run)

- [ ] Image is clearly sharper than previous 1k posts  
- [ ] Headline spelling matches Parse exactly  
- [ ] Today’s compound only (not yesterday’s)  
- [ ] No pens / injectors / people  
- [ ] Colors follow `daily_color_scheme`  
- [ ] Looks expensive, not busy collage  

---

## Cost note
`grok-imagine-image-quality` at **2k** costs more per image than 1k. Feed + story = 2 images/day.
