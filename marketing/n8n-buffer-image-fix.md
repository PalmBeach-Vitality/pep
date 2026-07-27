# Fix: Buffer shows caption but no image

Figma render URLs (`figma-alpha-api.s3...`) often fail in Buffer previews because they are temporary and not always fetchable by Buffer.

## Fix chain
`Figma Export → Download Image (HTTP) → Save fields → Buffer`

---

## 1) HTTP Request — Download Figma Image

Place **after** Figma images API node (or after Save Figma Image if URL is already flat).

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `={{ $json.images["2:51"] }}`  **or** `={{ $json.figma_image_url }}` |
| Response / Response Format | **File** (binary) |
| Put Output in Field | `data` (default) |

Execute and confirm the node output has **binary** `data` (image).

---

## 2) Keep captions available

Because download replaces JSON, map captions again in an Edit Fields after download (or use `$('Save Figma Image')` / `$('Parse_Grok')` in Buffer).

Example Edit Fields **Include Other Input Fields OFF**:

| Name | Value |
|---|---|
| `ig_caption_draft` | `={{ $('Save Figma Image').item.json.ig_caption_draft.replaceAll('\\n', '\n') }}` |
| `figma_image_url` | `={{ $('Save Figma Image').item.json.figma_image_url }}` |

Also pass binary through: in newer n8n, enable **Include Binary Data** if available, or don’t strip binary between nodes.

---

## 3) Buffer node — use binary, not Figma URL

In Buffer Create Post:

- **Text:** `={{ $json.ig_caption_draft }}`
- **Attachment Type:** Image
- Prefer **binary / input binary field** = `data`  
  (not the Figma S3 Image URL)

If the Buffer node only has Image URL:
1. Upload the binary to a stable host first (S3, Cloudinary, Drive public link), **or**
2. Check Buffer node options for “Binary Property” / “Input Data Field Name” = `data`

---

## 4) Caption newlines

Preview showed literal `\n`. Use:

```text
={{ $json.ig_caption_draft.replaceAll('\\n', '\n') }}
```

---

## Verify
- Download node shows binary image
- Buffer preview shows real slide art (not Product/Review placeholder)
- Caption has real line breaks
