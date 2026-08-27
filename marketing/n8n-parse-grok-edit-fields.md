# Parse Grok with Edit Fields (no Code node)

After the Grok HTTP node succeeds, add another **Edit Fields** node.

## Chain
`Edit Fields (compound) → HTTP Grok → Edit Fields (Parse Grok) → Figma`

## Parse node settings
1. Add **Edit Fields** after Grok
2. Name it `Parse Grok`
3. Mode: **Manual Mapping**
4. **Include Other Input Fields**: OFF
5. Add these fields:

| Name | Type | Value (expression / fx ON) |
|---|---|---|
| `display_name` | String | `={{ JSON.parse($json.choices[0].message.content).display_name }}` |
| `ig_caption_draft` | String | `={{ JSON.parse($json.choices[0].message.content).platform_copy.instagram.caption }}` |
| `ig_first_comment` | String | `={{ JSON.parse($json.choices[0].message.content).platform_copy.instagram.first_comment }}` |
| `fb_caption_draft` | String | `={{ JSON.parse($json.choices[0].message.content).platform_copy.facebook.caption }}` |
| `tiktok_hook` | String | `={{ JSON.parse($json.choices[0].message.content).platform_copy.tiktok.hook }}` |
| `tiktok_script_draft` | String | `={{ JSON.parse($json.choices[0].message.content).platform_copy.tiktok.spoken_script }}` |
| `tiktok_caption` | String | `={{ JSON.parse($json.choices[0].message.content).platform_copy.tiktok.caption }}` |
| `figma_headline` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.headline }}` |
| `figma_subhead` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.subhead }}` |
| `figma_bullet_1` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.bullets[0] }}` |
| `figma_bullet_2` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.bullets[1] }}` |
| `figma_bullet_3` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.bullets[2] }}` |
| `figma_cta` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.cta }}` |
| `figma_template_type` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.figma_template_type }}` |
| `figma_visual_notes` | String | `={{ JSON.parse($json.choices[0].message.content).creative_brief.visual_notes }}` |
| `compliance_ok` | Boolean / String | `={{ JSON.parse($json.choices[0].message.content).compliance_check.ok }}` |
| `canonical_url` | String | `https://www.palmbeach-vitality.store/products/bpc-157-pen` |

For smoke test, hardcode `canonical_url` as above. Later map from Sheets.

## Verify
Execute Parse Grok. You should see flat fields:
- `figma_headline` like `BPC-157 Research Material`
- `ig_caption_draft` ending with the FDA disclaimer
- `compliance_ok` = `true`

Then continue to Figma.
