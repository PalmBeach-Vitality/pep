# Buffer Stories (Instagram + Facebook)

Feed posts already work. Stories use the same Buffer GraphQL endpoint with `metadata.*.type = story`.

## Aspect ratio
Stories should be **9:16**. Add a second Imagine node (don’t reuse the 1:1 feed image).

```text
Parse_Grok
  → Grok_Imagine          (1:1 feed)
  → Grok_Imagine_Story    (9:16 story)
  → Save_render_URL       (both URLs + captions)
  → Buffer_post           (IG feed)
  → Buffer_post_FB        (FB feed)
  → Buffer_IG_Story
  → Buffer_FB_Story
  → Sheets_writeback
```

---

## 1) Add `Grok_Imagine_Story`

**After:** `Grok_Imagine`  
**Before:** `Save_render_URL`

Duplicate `Grok_Imagine`. Change body `aspect_ratio` to **`9:16`**.  
Keep the same premium navy/hex brand prompt + Parse_Grok fields.

---

## 2) Extend `Save_render_URL`

Add fields:

| Name | Value |
|---|---|
| `spotlight_image_url` | `{{ $('Grok_Imagine').item.json.data[0].url }}` |
| `story_image_url` | `{{ $('Grok_Imagine_Story').item.json.data[0].url }}` |
| `ig_caption_draft` | (existing) |
| `fb_caption_draft` | (existing) |

If Save sits after Story Imagine, `story_image_url` can be `{{ $json.data[0].url }}` and feed URL must use `$('Grok_Imagine')...`.

---

## 3) Add `Buffer_IG_Story`

**After:** `Buffer_post_FB` (or after feed posts)  
**Before:** `Buffer_FB_Story`

Same HTTP setup as feed (`POST https://api.buffer.com`, JSON body, Buffer auth).

**Body (fx ON)** — channel = Instagram, type = story:

```text
{{ JSON.stringify({ query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }', variables: { input: { text: $('Save_render_URL').item.json.ig_caption_draft, channelId: '6a668d534b2d03035f478536', schedulingType: 'automatic', mode: 'addToQueue', metadata: { instagram: { type: 'story', shouldShareToFeed: false } }, assets: [{ image: { url: $('Save_render_URL').item.json.story_image_url } }] } } }) }}
```

---

## 4) Add `Buffer_FB_Story`

**After:** `Buffer_IG_Story`  
**Before:** Sheets writeback

**Body (fx ON)** — channel = Facebook, type = story:

```text
{{ JSON.stringify({ query: 'mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id text dueAt } } ... on MutationError { message } } }', variables: { input: { text: $('Save_render_URL').item.json.fb_caption_draft, channelId: '6a668d6b4b2d03035f478575', schedulingType: 'automatic', mode: 'addToQueue', metadata: { facebook: { type: 'story' } }, assets: [{ image: { url: $('Save_render_URL').item.json.story_image_url } }] } } }) }}
```

---

## Channel IDs (confirmed)
| Channel | ID |
|---|---|
| Instagram | `6a668d534b2d03035f478536` |
| Facebook | `6a668d6b4b2d03035f478575` |

---

## Notes
- Stories may expire / schedule differently in Buffer; `dueAt` still returns.
- Keep captions research-only + disclaimer (same FDA rules).
- If Story create fails on image size, confirm Imagine `aspect_ratio: '9:16'`.
- Optional Sheets columns: `buffer_ig_story_id`, `buffer_fb_story_id`.
