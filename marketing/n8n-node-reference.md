# n8n node reference (locked for Pep)

Official catalog: https://docs.n8n.io/integrations/  
Core: https://docs.n8n.io/integrations/builtin/core-nodes.md  
Apps: https://docs.n8n.io/integrations/builtin/app-nodes.md  
Triggers: https://docs.n8n.io/integrations/builtin/trigger-nodes.md  
AI / cluster: https://docs.n8n.io/integrations/builtin/cluster-nodes.md  
HTTP (last resort): https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest.md

n8n ships **400+ built-in nodes** (core + apps + triggers + AI cluster). Community / partner nodes add more (ElevenLabs, fal.ai). This file is the working map. Search the **+** panel by product name before proposing HTTP.

## Hard rule

**Always use a predefined node (built-in, verified partner, or already-installed community) before HTTP Request.**

1. Search **+** for the product (`ElevenLabs`, `fal.ai`, `Google Sheets`, `xAI`, `Grok`).
2. If a node exists, use it. Read its Resource / Operation dropdowns. Do not rebuild that API as HTTP.
3. If the node exists but is missing one operation, still use that node’s credential on HTTP via **Authentication → Predefined Credential Type**. Do not invent Header Auth.
4. HTTP Request is last resort: no node, and no predefined credential. Say that out loud before adding HTTP.

Do **not** add HTTP for Sheets, Filter, Sort, Limit, IF, Wait, Loop, Edit Fields, Code, Merge, fal Generate Media, or ElevenLabs TTS.

---

## Node kinds

| Kind | What it is | Search for |
|---|---|---|
| **Trigger** | Starts a run (bolt icon) | Schedule Trigger, Manual Trigger, Webhook, Google Sheets Trigger |
| **Core** | Logic / data / generic I/O | Code, Edit Fields, IF, Filter, Sort, Limit, Loop Over Items, Wait, Merge, HTTP Request |
| **App** | One product’s API, Resource + Operation | Google Sheets, Gmail, Slack, OpenAI |
| **Cluster / AI** | Root + sub-nodes (chat models, agents) | xAI Grok Chat Model, OpenAI Chat Model, AI Agent |
| **Community / partner** | Install once, then same as App | fal.ai, ElevenLabs |

---

## Core nodes (what each does)

Use these instead of Code/HTTP when they fit.

### Start the workflow
| Node | Does |
|---|---|
| Manual Trigger | Run from the editor |
| Schedule Trigger | Cron / interval |
| Webhook | HTTP in |
| Chat Trigger | Chat UI start |
| Error Trigger | Fires when another workflow errors |
| n8n Trigger / n8n Form / Execute Sub-workflow Trigger | n8n-internal starts |
| Evaluation Trigger | Eval runs |
| Email Trigger (IMAP) | New mail |
| Local File Trigger | Disk change (self-host) |
| RSS Feed Trigger | New RSS item |
| SSE Trigger | Server-sent events |
| Activation Trigger | Workflow activated |
| Workflow Trigger | Another workflow called this one |

### Flow
| Node | Does |
|---|---|
| If | True / false |
| Switch | Many branches |
| Filter | Keep / drop items |
| Limit | First N items |
| Sort | Order items |
| Loop Over Items (Split in Batches) | `loop` + `done`. Batch Size 1 = one item at a time |
| Wait | Pause (seconds or webhook resume) |
| Merge | Combine branches |
| Split Out | Array field → many items |
| Aggregate | Many items → one |
| Compare Datasets | Diff two lists |
| Remove Duplicates | Unique rows |
| Stop And Error | Fail on purpose |
| No Operation, do nothing | Dead-end / placeholder |
| Execute Sub-workflow | Call another workflow |
| Wait / Respond to Webhook | Hold or reply to the inbound webhook |

### Data
| Node | Does |
|---|---|
| Edit Fields (Set) | Add / overwrite fields. Pep: `save_still_url`, `save_lipsync_video_url`, `Prep_day_variant` |
| Code | JS when no core node fits. Pep: `prep_pep_beats`, `split_pep_beats`, `gather_pep_clips` |
| Rename Keys | Rename fields |
| Date & Time | Parse / format dates |
| Summarize | Counts / sums |
| AI Transform | LLM rewrite of items |
| Execution Data | Tag the run |
| Debug Helper | Inspect |

### Files / binary
| Node | Does |
|---|---|
| Convert to File | JSON → binary file |
| Extract From File | Binary → text/JSON |
| Compression | Zip / unzip |
| Read/Write Files from Disk | Self-host disk |
| Edit Image | Crop / resize / overlay (not Pep character lock) |
| HTML / Markdown / XML | Format convert |
| Crypto / JWT / TOTP | Hash, tokens, 2FA |

### Generic I/O (only if no app node)
| Node | Does |
|---|---|
| HTTP Request | Any REST API. **Last resort.** Prefer Predefined Credential Type |
| GraphQL | GraphQL APIs |
| FTP / SSH / Git / LDAP | Infra |
| Send Email | SMTP out |
| RSS Read | Pull a feed |
| MCP Client / MCP Server Trigger | MCP tools |
| Data Table | n8n-native table (not Google Sheets) |

---

## AI cluster (chat only unless noted)

These are **not** Imagine Image / OmniHuman.

| Node | Use |
|---|---|
| xAI Grok Chat Model | Grok **text** (captions). Not `/v1/images/edits` |
| OpenAI / Anthropic / Gemini / Groq / … Chat Model | Other LLMs |
| AI Agent + tools | Tool-calling agents |
| Basic LLM Chain / Q&A / Summarization | Simple chains |
| Embeddings + Vector Store | RAG |
| Structured Output Parser | Force JSON |

**No official n8n node for xAI Imagine Image / Image Edits.** Pep stills stay HTTP `POST https://api.x.ai/v1/images/edits` until xAI ships that operation on a node.

---

## Partner / community (Pep stack)

Search **+** for these names. Prefer them over HTTP.

| Search | Package / source | Use on Pep |
|---|---|---|
| **fal.ai** | `@fal-ai/n8n-nodes-fal` (already on canvas as `pep_lipsync_fal`) | Resource **Model** → **Generate Media**. OmniHuman, Kling, other fal models. Wait for Completion ON |
| **ElevenLabs** | Verified partner node (n8n.io/integrations/elevenlabs) | Resource **Text to Speech** → Converts text into speech. Prefer this over `tts_pep_voice_over` HTTP |
| **Google Sheets** | Built-in `n8n-nodes-base.googleSheets` | Get Row(s), Update Row, Append or Update Row. Already `get_rows_in_sheet` / `sheets_update_creation` |

fal.ai operations on that node: Generate Media, Get Model Info, Get Analytics, Get Pricing, Get Usage, List Requests. Use **Generate Media** for talking clips. Do not rebuild queue.fal.run as HTTP when this node can wait.

ElevenLabs operations: Voice (Get / Get Many / Create Clone / Delete), **Text to Speech**, Speech to Text, Speech to Speech, Custom API Call.

---

## Built-in app nodes (search these; do not HTTP them)

Action Network, ActiveCampaign, Airtable, Asana, AWS (S3, Lambda, SES, SQS, …), Box, ClickUp, Discord, Dropbox, Facebook Graph API, Gmail, GitHub, GitLab, Google Ads / Analytics / BigQuery / Calendar / Chat / Docs / Drive / **Sheets** / Slides / Tasks / Translate / YouTube, HubSpot, Intercom, Jira, Linear, LinkedIn, Mailchimp, Microsoft (Excel, Outlook, OneDrive, Teams, SQL), MongoDB, MySQL, Notion, OpenAI, Postgres, Redis, Salesforce, Shopify, Slack, Stripe, Supabase, Telegram, Trello, Twilio, WhatsApp Business Cloud, WooCommerce, WordPress, X (Twitter), Zendesk, Zoom, plus ~200 more in the official app list.

Full official list: https://docs.n8n.io/integrations/builtin/app-nodes.md

If the product is in that list, use the app node.

---

## Pep canvas — already the right kind

| Canvas name | Kind | Keep |
|---|---|---|
| Schedule Trigger | Core trigger | Yes |
| `get_rows_in_sheet` / `sheets_update_creation` | Google Sheets | Yes |
| `filter_active` | Filter | Yes |
| `sort_rotation1` | Sort | Yes |
| `Limit` | Limit | Yes |
| `Prep_day_variant` / `save_still_url` / `save_lipsync_video_url` | Edit Fields | Yes |
| `if_complaince` | If | Yes |
| `prep_pep_beats` / `split_pep_beats` / `parse_grok` / `merge_tts_binary` / `gather_pep_clips` | Code | Yes (no core node writes this JS) |
| `loop_pep_beats` | Loop Over Items | Yes |
| `Wait` / `Wait2` / `Wait3` | Wait | Yes |
| `pep_lipsync_fal` | fal.ai Generate Media | Yes. Never replace with HTTP |

## Pep canvas — HTTP only if no node

| Canvas name | Today | Rule |
|---|---|---|
| `tts_pep_voice_over` | HTTP → ElevenLabs | **Prefer ElevenLabs node** (Text to Speech) on the next TTS change. Do not add a second HTTP TTS |
| `fal_upload_tts_initiate` / `fal_upload_tts_put` | HTTP fal storage | Keep until fal node exposes upload. Then switch |
| `grok_api` | HTTP chat | Prefer **xAI Grok Chat Model** if we retouch captions |
| `grok_imagine_reel_still` | HTTP `/v1/images/edits` | **Stay HTTP.** No Imagine Image node |
| `ai_vid_generator` / Kling poll | HTTP or fal | Prefer **fal.ai Generate Media** (already the talking path). Do not add new Kling HTTP |

---

## How to pick a node (every time)

1. What product? Search **+** for that name.
2. What verb? Read Resource + Operation (Get Row(s), Generate Media, Text to Speech).
3. No match? Search again for the parent brand (Google, Microsoft, AWS, fal).
4. Still no match? HTTP + **Predefined Credential Type** if n8n has credentials for that brand.
5. Still no match? HTTP + generic auth. Document why.

Pin / unpin and exact canvas names still follow `marketing/AGENT_RULEBOOK.md`.
