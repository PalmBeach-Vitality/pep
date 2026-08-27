# Build the Hero Spotlight slide in Figma (step by step)

File: https://www.figma.com/slides/cVeMEJnU12e8QdjfOystrl  
Target size: **1080 × 1080** (Instagram)  
Working export id after you finish: copy from the URL `node-id=XXXX-Y` → use as `XXXX:Y` in n8n

---

## 0) Open the right place

1. Open the link above and log into Figma.
2. You should be in **Figma Slides** (presentation-style pages on the left).
3. In the left filmstrip, click the slide you want to redesign (or click **+** to add a new blank slide).
4. Click empty space on the slide so the whole page is selected.

---

## 1) Make it square 1080

1. With the slide selected, look at the **right panel**.
2. Set width / height to **1080 × 1080** if you can (or pick a square Instagram slide preset if Slides offers one).
3. If Slides locks size, design within a **1080×1080 Frame** on the slide:
   - Press **F** (Frame)
   - In the right panel choose **Instagram Post 1080×1080**, or type 1080 / 1080
   - Center that frame on the slide — this frame is what n8n will export

---

## 2) Background

1. Select the frame (or slide).
2. Right panel → **Fill** → solid color **`#0A1628`** (navy).
3. Optional soft atmosphere (keep subtle):
   - Press **O** (Ellipse)
   - Draw a large circle top-right
   - Fill `#0D9488`, lower opacity to ~15–25%
   - No stroke
4. Optional grid:
   - Or skip — compound name should stay the visual anchor

---

## 3) Add text layers (top → bottom)

Press **T** for each new text box. After typing, rename the layer in the left layers list (double-click the layer name).

### Layer `brand`
```text
PALM BEACH VITALITY
```
- Size ~28–32 · Color `#F8F4EC` · Top-left · Bold/semibold  
- Letter-spacing slightly open if available

### Layer `eyebrow`
```text
Laboratory research material
```
- Size ~22–24 · Color `#0D9488` · Under brand

### Layer `product_form` (top-right)
```text
PEN
```
- Size ~20–22 · Color `#5B6B7C` · Uppercase · Top-right

### Layer `headline` (hero — biggest thing on the slide)
```text
BPC-157
```
- Size ~90–120 · Color `#FFFFFF` · Bold  
- This must dominate the first glance

### Layer `accent_line`
1. Press **L** (Line) or draw a thin rectangle
2. Under the headline, ~120px wide, 4px tall
3. Color `#0D9488`

### Layer `subhead`
```text
Pentadecapeptide
```
- Size ~32–36 · Color `#F8F4EC`

### Layers `bullet_1` / `bullet_2` / `bullet_3`
```text
Pentadecapeptide molecular class
```
```text
Pre-filled research format
```
```text
Laboratory research use only
```
- Size ~26–28 · Color `#F8F4EC`
- Optional: small teal dots (ellipses) to the left of each line

### Layer `cta`
```text
View laboratory listing
```
- Size ~24–26 · Color `#0D9488`
- Optional: rectangle outline around it, stroke `#0D9488`, no fill

### Layer `disclaimer` (required)
```text
For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.
```
- Size ~14–18 · Color `#5B6B7C` · Bottom of frame

---

## 4) Layout checklist

Top → bottom should read:
1. Brand  
2. Eyebrow (+ PEN top-right)  
3. **Headline** (hero)  
4. Teal rule  
5. Subhead  
6. 3 bullets  
7. CTA  
8. Disclaimer  

Rules:
- One composition — not a dashboard
- No cards, badges, stickers, photos, or emoji
- Brand visible; headline is the only huge text
- Leave breathing room around the compound name

---

## 5) Name layers exactly

Left layers panel, rename to:

```text
bg
brand
eyebrow
product_form
headline
accent_line
subhead
bullet_1
bullet_2
bullet_3
cta
disclaimer
```

Exact names matter later if you bind Variables or clone this into Placid.

---

## 6) Get the node id for n8n

1. Click the **frame** (or slide) you want exported — not a single text box.
2. Look at the browser URL. You’ll see something like:
   `node-id=2020-5`
3. Convert hyphen → colon for the API:
   - `2020-5` → **`2020:5`**
4. Put that in n8n `Figma_export` query `ids`.

---

## 7) Quick visual QA

- [ ] Navy background, teal accents only  
- [ ] Chemical name only (no nicknames)  
- [ ] Disclaimer readable at bottom  
- [ ] Looks like a lab catalog slide, not a wellness ad  
- [ ] Square crop looks good at 1080  

Reference samples in the repo:
- `marketing/generated/tb-500-spotlight.png`
- `marketing/generated/mots-c-spotlight.png`
- `marketing/bpc-157-hero-spotlight.png`

Open one beside Figma and match spacing/hierarchy (doesn’t need to be pixel-identical).

---

## 8) Duplicate for other compounds (manual multi-slide method)

1. In the left filmstrip, right-click your finished slide → **Duplicate**
2. Open the copy
3. Change only:
   - `headline`
   - `subhead`
   - `bullet_1/2/3`
   - `product_form` if needed
4. Copy that slide’s `node-id` for that week’s n8n `ids=`

This is how you stay in Figma without Variables/Enterprise: one slide per compound, swap `ids` (or map later by `compound_id`).

---

## 9) After the slide exists

**Export test in n8n (single item):**
1. Limit = 1  
2. Wait → Figma_export (`ids=YOUR:NODE`) → Resolve_Image → Buffer  

**Or** keep this Figma slide as the master design and recreate the same layers in Htmlcsstoimage/Placid for true auto text each week.

When the slide is done, reply **slide updated** and paste the URL (with `node-id=...`).
