# FIX: Figma_export node (exact working config)

File: `cVeMEJnU12e8QdjfOystrl`  
Node: `2020:5` (from Figma link `node-id=2020-5`)

---

## 1) Exact node settings

**Node name:** `Figma_export`  
**Type:** HTTP Request

| Setting | Value |
|---|---|
| Method | `GET` |
| URL | `https://api.figma.com/v1/images/cVeMEJnU12e8QdjfOystrl` |
| Authentication | None |
| Send Headers | ON |
| Send Query Parameters | ON |
| Send Body | **OFF** |

### Header (required)
| Name | Value |
|---|---|
| `X-Figma-Token` | your Figma personal access token |

> Must be exactly `X-Figma-Token` (not Authorization Bearer).

### Query parameters (all Fixed)
| Name | Value |
|---|---|
| `ids` | `2020:5` |
| `format` | `png` |
| `scale` | `2` |

---

## 2) Stop rate-limit lockouts

In `Figma_export` → **Settings** tab:
- **Retry On Fail** → ON
- Max Tries → `3`
- Wait Between Tries → `60000` ms (60 seconds)

Before the node, keep **Wait = 30 seconds** (or 60 if still limited).

**Do not mash Execute.** One run at a time.

---

## 3) Success vs failure output

### Success
```json
{
  "err": null,
  "images": {
    "2020:5": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/...."
  }
}
```

### Still rate limited
Message: `The service is receiving too many requests from you`  
→ Wait 20–30 minutes, zero Figma calls, then one Execute.

### Render failed
```json
"2020:5": null
```
→ Wrong node id. Copy new Figma selection link and update `ids`.

---

## 4) Save_figma_image (next node)

`figma_image_url` expression:

```text
{{ $json.images['2020:5'] }}
```

or safer:

```text
{{ Object.values($json.images)[0] }}
```

Preview must be `https://...` not null/empty.

---

## 5) Create a post Image URL

Connected from Save_figma_image:

```text
{{ $json.figma_image_url }}
```

---

## 6) One-shot test order
1. Wait node  
2. Execute `Figma_export` **once**  
3. Confirm `images['2020:5']` is https  
4. Execute `Save_figma_image`  
5. Execute `Create a post`

If step 2 still says too many requests: stop for 30 minutes. Config is correct; Figma is blocking the token/IP temporarily.
