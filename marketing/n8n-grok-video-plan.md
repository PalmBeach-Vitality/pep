# Tomorrow: Grok video for IG/FB + more creative short-form

Sal feedback: still images/captions feel too samey. Need **creative short videos** for Instagram exposure, plus stronger creative variety — still FDA research-only.

---

## Goal
Daily compound spotlight outputs:
1. Feed image (existing)
2. Story image (existing)
3. **NEW: Feed short video (Reels / FB video)** — 6–12s, 9:16
4. **NEW: Story video** — 5–8s, 9:16 (or animate today’s story still)

Same compound all week; **new creative treatment every day**.

---

## Grok video API (xAI)

| Item | Value |
|---|---|
| Start | `POST https://api.x.ai/v1/videos/generations` |
| Poll | `GET https://api.x.ai/v1/videos/{request_id}` |
| Model | `grok-imagine-video` (or `grok-imagine-video-1.5` if enabled) |
| Duration | 1–15s (start with **8** for Reels, **6** for Stories) |
| Aspect | **`9:16`** for IG/FB Reels & Stories |
| Resolution | `720p` preferred |
| Auth | same xAI Bearer as Imagine images |

### Modes we’ll use
1. **Image-to-video** (best brand control): start from today’s `spotlight_image_url` / `story_image_url`, animate with a motion prompt  
2. **Text-to-video** (more creative / wild): full motion poster from daily creative brief  

Recommend **hybrid**:
- Mon/Wed/Fri → image-to-video (brand-locked still → motion)  
- Tue/Thu/Sat/Sun → text-to-video (fresh creative filmic clip)

---

## n8n chain (add after Save_render_URL images)

```text
Parse_Grok
  → GROK_Imagine (1:1)
  → Grok_imagine_story (9:16)
  → Save_render_URL
  → Grok_Video_Start          (POST /v1/videos/generations)
  → Wait (8–20s)
  → Grok_Video_Poll           (GET /v1/videos/{id} until done)
  → Save_video_URL
  → Buffer_IG_Reel            (instagram type: reel + video url)
  → Buffer_FB_Reel            (facebook type: reel + video url)
  → Buffer_IG_Story_Video     (optional)
  → Buffer_FB_Story_Video     (optional)
  → existing image feed/story posts (or replace some with video-only days)
  → Sheets_writeback
```

### Buffer note
Use `assets: [{ video: { url: ... } }]` and:
- IG: `metadata.instagram.type: 'reel'` or `'story'`
- FB: `metadata.facebook.type: 'reel'` or `'story'`

Do **not** send the same video+caption twice too close (Buffer duplicate guard).

---

## Creative formats (research-safe, high scroll-stop)

Keep chemical names + disclaimer. No human-use / disease / results claims.

### Daily video styles (map in Prep_day_variant)
| Day | Format name | Creative move |
|---|---|---|
| Mon | **Identity Reveal** | Dark lab void → compound name slam + hex bloom |
| Tue | **Class Kinetic** | Molecular lattice assembling around chemical name |
| Wed | **Format Macro** | Abstract pen/vial geometry orbiting; format words punch on |
| Thu | **Assay Pulse** | Radar/sonar rings + assay-plate motif; technical HUD feel |
| Fri | **Catalog Drop** | Blueprint folio unfolds into CTA |
| Sat | **FAQ Glitch** | Clean type → subtle glitch → research-use seal |
| Sun | **Quality Mineral** | Faceted mineral / precision motif; calm premium close |

### Motion prompt rules (always)
- Cinematic lighting, premium brand film, 9:16
- On-screen text ONLY from Parse fields (headline/subhead/disclaimer)
- No people, needles, injections, clinics, gyms, before/after
- End frame holds compound name + “laboratory research use only”
- Include today’s color scheme + pattern + motif from Prep

### Example image-to-video prompt skeleton
```text
Animate this Palm Beach Vitality scientific poster into a premium 8-second vertical brand film.
Slow push-in, subtle particle drift, teal/magenta light sweeps matching the poster palette.
Keep all typography sharp and unchanged.
No new words. No people. No medical procedures.
End on a clean hold of the compound name and research-use disclaimer.
```

---

## Caption creativity upgrade (same day)

Still images felt repetitive because structure was rigid. For video days:
1. Shorter IG caption (hook + 2 lines + link + disclaimer)
2. First comment = longer catalog note + disclaimer
3. Hook line must match today’s video format name (Identity Reveal, Class Kinetic, etc.)

Add Prep field:
`daily_video_format` → Mon–Sun names above

---

## Exposure tactics (still compliant)
- Post **Reels daily** (video), keep 1 static feed optional
- Stories: 1 still + 1 short motion cut of same creative
- Cover/thumbnail = strongest frame from video (or still Imagine)
- Consistent brand wordmark; wild daily color/pattern underneath
- CTA always catalog/research listing — never wellness promises

---

## Build order tomorrow (with Sal)
1. Smoke-test xAI video POST + poll in one HTTP pair  
2. Wire image-to-video from `spotlight_image_url`  
3. Save `video_url`  
4. Buffer IG Reel + FB Reel  
5. Add Prep `daily_video_format` + stronger video prompts  
6. Optional story videos  
7. Decide: video-only feed vs image+video both (cost)

---

## Cost caution
Video is billed per second (roughly cents per second at 720p).  
Start: **1 Reel/day @ 8s** before adding story videos.

---

## FDA hard line (unchanged)
Laboratory / in-vitro research materials only. Not for human use. Chemical names only. Mandatory disclaimer on captions. No disease/structure-function/wellness claims on video text or voiceover ideas.
