# Absolute beginner: redesign your Figma slide (BPC-157)

You’re editing this file:
https://www.figma.com/slides/cVeMEJnU12e8QdjfOystrl/Untitled?node-id=2-51

Goal: replace the “Product Review / Feature Name” placeholder with real BPC-157 research catalog content.

---

## Part 1 — Open the right slide

1. Open the link above in Chrome.
2. If Figma asks you to log in, log in.
3. You should see a slide canvas (like a presentation page).
4. On the left, click the slide that shows the placeholder (“Product Review…”).
5. Click once on empty space on that slide so the whole slide is active.

---

## Part 2 — Delete the placeholder content

1. Click the big placeholder text (“Product”, “Review”, etc.).
2. Press **Delete** (or Backspace).
3. Repeat until the slide is mostly empty.
4. If something won’t delete:
   - Click it
   - Look at the right panel
   - Press Delete again
5. Leave the slide background if you like; we’ll change color next.

---

## Part 3 — Set the slide size / background

### Background color
1. Click empty area of the slide (not a text box).
2. On the right panel, find **Fill** / background color.
3. Set it to: `#0A1628` (dark navy).
4. If you can’t find Fill:
   - With slide selected, look for a paint-bucket / color square on the right.

---

## Part 4 — Add text (one piece at a time)

### A) Brand
1. Click **Text** tool in the toolbar (letter **T**), or press **T**.
2. Click near the top of the slide.
3. Type:

```text
Palm Beach Vitality
```

4. Select that text.
5. Right panel:
   - Font size: about **28–36**
   - Color: `#2DD4BF` or `#0D9488` (teal)
   - Center align if you want

### B) Eyebrow
1. Press **T**, click below the brand.
2. Type:

```text
Laboratory research material
```

3. Size: about **20–24**
4. Color: light gray/white (`#E8EEF5` or white)

### C) Big compound name (most important)
1. Press **T**, click center of slide.
2. Type:

```text
BPC-157
```

3. Size: about **96–140** (large)
4. Color: white
5. Make it bold if available
6. This should be the biggest text on the slide

### D) Subhead
1. Press **T** under BPC-157.
2. Type:

```text
Pentadecapeptide
```

3. Size: about **32–40**
4. Color: teal `#2DD4BF`

### E) Three research notes
Add three separate text boxes:

```text
Pentadecapeptide molecular class
```

```text
Pre-filled research format
```

```text
Laboratory research use only
```

- Size: about **24–28**
- Color: white / light gray
- Stack them vertically with space between

### F) CTA
1. Press **T** near lower area.
2. Type:

```text
View laboratory listing
```

3. Size: about **24**
4. Color: teal

### G) Disclaimer (required)
1. Press **T** near the bottom.
2. Type exactly:

```text
For laboratory research use only. Not for human use or consumption.
```

3. Size: about **14–18**
4. Color: muted gray
5. Keep it readable but smaller than everything else

---

## Part 5 — Align it so it looks clean

1. Select each text box and drag to center.
2. Leave breathing room around **BPC-157**.
3. Keep order top → bottom:
   - Brand  
   - Laboratory research material  
   - BPC-157  
   - Pentadecapeptide  
   - 3 notes  
   - View laboratory listing  
   - Disclaimer  
4. Don’t add photos, icons, stickers, or extra boxes.

Optional accent line:
1. Find **Line** / shape tool
2. Draw a short horizontal line under **BPC-157**
3. Color: `#0D9488`

---

## Part 6 — Use the reference image (optional but helpful)

Reference file in your repo:
`marketing/bpc-157-hero-spotlight.png`

To view it while designing:
1. Open that PNG on your computer
2. Put it on a second monitor / split screen
3. Match the layout roughly (doesn’t need to be identical)

To place it in Figma temporarily as a guide:
1. Drag the PNG into the Figma slide
2. Lower opacity if possible
3. Build text on top
4. Delete the guide image when finished

---

## Part 7 — Save / confirm

Figma usually auto-saves.
1. Make sure your slide no longer says “Product Review…”
2. You should clearly see **BPC-157** as the main title
3. Disclaimer is visible at the bottom

---

## Part 8 — Re-run n8n so Buffer gets the new art

In n8n, execute from Figma export onward:

1. Figma HTTP export (`ids=2:51`)
2. Save Figma Image
3. Buffer Create Post

Then check Buffer preview — it should show the new BPC-157 slide, not the old placeholder.

---

## If you get stuck

Common issues:
- **Can’t type:** press **T** first, then click the slide
- **Text too small/large:** select text → change font size on right panel
- **Wrong slide:** click the correct thumbnail on the left
- **Still seeing placeholder:** you may be on a different slide; delete placeholder on the active one

When done, tell me “slide updated” and we’ll re-test Figma → Buffer.
