// Node name (exact): prep_grok_video_start
// Next node on canvas: ai_vid_generator → Wait2 → Wait → grok_video_poll
// Duplicates later: prep_grok_video_start_b / _c / _d
// Mode: Run Once for Each Item
// Do not return [{ json: ... }] — that errors with A 'json' property isn't an object.
// IMPORTANT: change BEAT to 'a' | 'b' | 'c' | 'd' in each duplicated node
// Kling hard limit: prompt max 2500 characters

const BEAT = 'a'; // ← change per node: a, b, c, or d
const PROMPT_MAX = 2500;

const beats = ['a', 'b', 'c', 'd'];
if (!beats.includes(BEAT)) {
  throw new Error(`BEAT must be one of ${beats.join(', ')}`);
}

function clip(str, max) {
  const s = String(str || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trim() + '…';
}

const prep = (() => {
  try { return $('prep_pep_beats').item.json; } catch (e) { return $json; }
})();

function stillUrlFor(beat) {
  const saveName = beat === 'a' ? 'save_still_url' : `save_still_url_${beat}`;
  const stillName = beat === 'a' ? 'grok_imagine_reel_still' : `grok_imagine_reel_still_${beat}`;

  try {
    const j = $(saveName).item.json;
    const u = j.reel_still_url || j[`reel_still_url_${beat}`] || j.data?.[0]?.url || '';
    if (u) return String(u);
  } catch (e) {}

  try {
    const j = $(stillName).item.json;
    const u = j.data?.[0]?.url || j.reel_still_url || '';
    if (u) return String(u);
  } catch (e) {}

  try {
    const u = prep[`reel_still_url_${beat}`] || '';
    if (u) return String(u);
  } catch (e) {}

  if (beat === BEAT) {
    return String($json.reel_still_url || $json.data?.[0]?.url || '');
  }
  return '';
}

const NEXT_BEAT = { a: 'b', b: 'c', c: 'd' }[BEAT] || '';

const stillUrl = stillUrlFor(BEAT);
if (!stillUrl) {
  throw new Error(
    `Missing Pep still URL for beat ${BEAT}. Check save_still_url / grok_imagine_reel_still.`
  );
}

// Next-beat still → Kling end_image_url so this clip lands on the next shot (match-cut / dissolve).
const endImageUrl = NEXT_BEAT ? stillUrlFor(NEXT_BEAT) : '';

const compound = clip(prep.compound_name || 'research compound', 80);
const compoundId = clip(prep.compound_id || '', 40);
const motion = clip(prep[`beat_${BEAT}_motion`] || prep.video_motion_prompt || 'slow push-in', 180);
const lighting = clip(prep.lighting || '', 80);
const grade = clip(prep.color_grade || '', 80);
const surface = clip(prep.surface || prep.material_detail || '', 120);

const videoPrompt = clip([
  'PRIMARY ACTION: walking AND talking at the same time for the entire 15 seconds. Both never stop.',
  'STITCH LOCK: This clip must dissolve into the next 15s shot. Same walk the whole time.',
  'Start already mid-stride at 0.00 seconds — first frame is a walking pose, not a planted still. Talking immediately. Do not wait. Do not start at 3 seconds.',
  'End still mid-stride at 15.00 seconds — last frame is a walking pose, mouth open mid-speech. Do not plant feet. Do not freeze. Do not pose for a cut.',
  'WALK DIRECTION (every beat): walk toward camera on a slight 3/4, screen-right bias, mid-ground. Same direction every clip so A→B→C→D can cross-dissolve. Gray tube legs and white sneakers in a continuous cartoon walk. Does not walk out of frame. Arms swing with the walk.',
  'TALK: the cartoon mouth printed on the white 10ml label opens and closes continuously from 0.00s through 15.00s WHILE he walks. Mouth never rests closed. Mouth never holds a smile. No grin-and-hold. No talk-stop-smile-talk.',
  'NO pose beats. NO thumbs-up. NO hat tip. NO pause-to-smile. NO stop-to-talk. NO freeze on first or last frame.',
  'Eyes blink. Hands stay in a walk swing, not posing.',
  'CHARACTER LOCK: Palm Beach Pep identical — 10mL crimp-seal glass vial mascot, Palm Beach Vitality sunset palm logo on white baseball cap, face on white 10ml label, gray limbs, white gloves and sneakers. No morphing.',
  `Product: ${compound} (${compoundId}). Beat ${BEAT.toUpperCase()}.`,
  `Set: ${surface}.`,
  'CAMERA: track with Pep as he walks; keep him mid-ground in 9:16; soft parallax; environment moves (waves/breeze/light). Do not lose him. Do not crop to a void. Camera move stays consistent across beats for dissolves.',
  `Lighting: ${lighting}. Grade: ${grade}.`,
  'ONLY Pep — no extra vials/bottles/pens/syringes. Crimp seal only. No humans, hospital, on-screen text. Silent. Keep scene depth.',
].filter(Boolean).join(' '), PROMPT_MAX);

const negativePrompt = clip([
  'delayed start, waits 3 seconds, starts talking late, standing still, planted feet, idle stance,',
  'freeze on first frame, freeze on last frame, pose for cut, stop at the end,',
  'stops walking, walks out of frame, moonwalk, sliding without steps, frozen legs,',
  'walks the opposite direction, sudden turn, jump cut pose,',
  'pause, stop talking, smile hold, frozen grin, closed mouth, closed-mouth smile,',
  'thumbs up, hat tip, pose and hold, talk then stop, idle, silent gap,',
  'static face, mouth not moving, mouth closed, rest face,',
  'blur, distort, morphing, deformed vial, idle freeze,',
  'extra vials, extra bottles, pens, syringes, humans, hospital, on-screen text, watermarks',
].join(' '), 800);

const MODEL_VIDEO = 'fal-kling-v3-pro-i2v';
const FAL_ENDPOINT = 'fal-ai/kling-video/v3/pro/image-to-video';
const FAL_NODE = 'ai_vid_generator';

// Kling I2V accepts ONLY these top-level fields (no frontal_image_url at root —
// that belongs inside elements[] only and causes 400 Bad Request if sent at root).
const videoRequestBody = {
  prompt: videoPrompt,
  start_image_url: stillUrl,
  duration: '15',
  generate_audio: false,
  negative_prompt: negativePrompt,
  cfg_scale: 0.7,
};
if (endImageUrl) {
  videoRequestBody.end_image_url = endImageUrl;
}

return {
  ...prep,
  beat: BEAT,
  fal_node: FAL_NODE,
  reel_still_url: stillUrl,
  [`reel_still_url_${BEAT}`]: stillUrl,
  prompt: videoPrompt,
  video_prompt: videoPrompt,
  prompt_char_count: videoPrompt.length,
  start_image_url: stillUrl,
  end_image_url: endImageUrl || '',
  next_beat: NEXT_BEAT || '',
  negative_prompt: negativePrompt,
  video_motion_prompt: motion,
  duration: '15',
  duration_seconds: 15,
  generate_audio: false,
  aspect_ratio: '9:16',
  resolution: '1080p',
  model_video: MODEL_VIDEO,
  fal_endpoint: FAL_ENDPOINT,
  fal_submit_url: `https://queue.fal.run/${FAL_ENDPOINT}`,
  video_request_body: videoRequestBody,
  video_request_body_string: JSON.stringify(videoRequestBody),
};
