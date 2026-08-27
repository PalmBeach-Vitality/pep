# HARD RULE — video generation parameters come from the sheet

**Every video generation parameter must come from the Google Sheet row.**  
n8n nodes must **not invent, default, append, truncate, or override** them.

This is why every reel was collapsing to the same forward push-in: `prep_grok_video_start` hardcoded `Slow cinematic push-in` / `duration: 15` / `9:16` / `1080p`, truncated motion to 700 characters, and (landscape) read `get_reel_creations` **row 1** when pick fields were missing. `pick_creation` (lab) also invented motion with `slow straight push-in` and banned orbits.

## Sheet-owned fields (pass through only)

| Field | Goes to Grok video how |
|---|---|
| `video_motion_prompt` | `prompt` |
| `camera_move` | must be present on the row; described inside `video_motion_prompt` |
| `camera_angle` | sheet / pick only |
| `camera_direction` | sheet / pick only |
| `shot_family` | sheet / pick only |
| `framing` | sheet / pick only |
| `model_video` | `model` |
| `duration_seconds` | `duration` |
| `resolution` | `resolution` |
| `aspect_ratio` | `aspect_ratio` (store as text `9:16`, not a time) |

If any of those are empty, **throw**. Do not fill in a push-in, 15s, 1080p, 9:16, or a model name.

## Nodes must not

- Build a motion prompt when the sheet field is empty
- Default `camera_move` to push-in
- Ban orbits (`never travel around the subject`)
- Append vial-label lock onto `video_motion_prompt` (put that text **on the sheet**)
- Truncate motion to 700 characters
- Read `get_reel_creations.first()` for motion (that is the first sheet row, not the picked row)
- Hardcode `model` / `duration` / `aspect_ratio` / `resolution` in `prep_grok_video_start`

## Allowed outside the sheet

- `still_url` from Imagine / `save_still_url` (the still is generated, then animated)
- Image-still hardening on `video_prompt` (that is image gen, not video gen)

## Import

Sal imports the CSVs with **File → Import → Replace current sheet**. Do not create a new spreadsheet.
