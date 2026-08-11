// Node name (exact): prep_grok_video_start
// Next node on canvas: ai_vid_generator (fal.ai · Kling v3 Pro I2V)
// Duplicates later: prep_grok_video_start_b / _c / _d
// Mode: Run Once for Each Item
// IMPORTANT: change BEAT to 'a' | 'b' | 'c' | 'd' in each duplicated node

const BEAT = 'a'; // ← change per node: a, b, c, or d

const beats = ['a', 'b', 'c', 'd'];
if (!beats.includes(BEAT)) {
  throw new Error(`BEAT must be one of ${beats.join(', ')}`);
}

const prep = (() => {
  try { return $('prep_pep_beats').item.json; } catch (e) { return $json; }
})();

// Still A: save_still_url → grok_imagine_reel_still → incoming json
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

  return String($json.reel_still_url || $json.data?.[0]?.url || '');
}

const stillUrl = stillUrlFor(BEAT);
if (!stillUrl) {
  throw new Error(
    `Missing Pep still URL for beat ${BEAT}. Check save_still_url / grok_imagine_reel_still.`
  );
}

const compound = prep.compound_name || 'research compound';
const brief = prep[`beat_${BEAT}_brief`] || prep.scene_brief || '';
const motion = prep[`beat_${BEAT}_motion`] || prep.video_motion_prompt || 'slow push-in';
const lighting = prep.lighting || '';
const grade = prep.color_grade || '';

const videoPrompt = [
  'Animate this 9:16 vertical still into a lively cartoon-style 15-second film beat.',
  'Character lock: Palm Beach Pep stays identical — anthropomorphic 10mL crimp-seal glass vial mascot, Palm Beach Vitality sunset palm-tree logo on white baseball cap, face on white 10ml label, gray limbs, white gloves and sneakers.',
  'Style: friendly cartoon motion, clean stylized animation, stable character proportions, no morphing Pep into a different bottle or human.',
  `Product lock: ${compound} (${prep.compound_id || ''}).`,
  `Beat ${BEAT.toUpperCase()} intent: ${brief}`,
  `Motion: ${motion}.`,
  'ACTION (must be visible, not idle): Pep gives a clear thumbs-up, tip/adjusts his Palm Beach Vitality hat once, shifts weight, and does a small cheerful body bounce. Eyes blink naturally. Keep continuous micro-performance the whole 15s — not frozen standing.',
  'CAMERA: slow push-in then slight parallax drift; environment has soft live motion (waves/breeze/light) matching the set.',
  `Lighting continuity: ${lighting}.`,
  `Color grade continuity: ${grade}.`,
  'ONLY ONE CHARACTER: Palm Beach Pep alone. Do NOT add any other vials, bottles, pens, insulin pens, syringes, injectors, droppers, ampoules, or medical devices in the scene.',
  'VIAL SPEC for Pep only: rubber stopper + aluminum crimp only. FORBIDDEN: black twist caps, screw caps, droppers.',
  'SIGNAGE RULE: no safety placards, no alert graphics, no danger banners, no alert words.',
  'LOCATION RULE: no doctor offices, no hospitals, no clinical exam rooms.',
  'No humans. No new on-screen text. Silent clip (no spoken model audio) — voiceover is added later.',
  'Keep full environmental scene depth. Not extreme macro. Not a void packshot.',
].join(' ');

const negativePrompt = [
  'blur, distort, low quality, morphing, deformed vial, static idle freeze, no movement, closed frozen mouth, no talking,',
  'extra vials, extra bottles, pens, insulin pens, syringes, injectors, needles, droppers, ampoules, medical devices,',
  'human people, faces of people, hospital, doctor office, clinic exam room,',
  'black twist cap, screw cap, on-screen text, captions, watermarks,',
  'safety placard, danger banner, alert graphics',
].join(' ');



const MODEL_VIDEO = 'fal-kling-v3-pro-i2v';
const FAL_ENDPOINT = 'fal-ai/kling-video/v3/pro/image-to-video';
const FAL_NODE = 'ai_vid_generator';

// Body for fal Kling (+ aliases the fal n8n UI may ask for)
const videoRequestBody = {
  prompt: videoPrompt,
  start_image_url: stillUrl,
  frontal_image_url: stillUrl,
  duration: '15',
  generate_audio: false,
  negative_prompt: negativePrompt,
  cfg_scale: 0.5,
};

return [{
  json: {
    ...prep,
    beat: BEAT,
    fal_node: FAL_NODE,
    reel_still_url: stillUrl,
    [`reel_still_url_${BEAT}`]: stillUrl,
    // flat aliases for ai_vid_generator parameter mapping
    prompt: videoPrompt,
    video_prompt: videoPrompt,
    start_image_url: stillUrl,
    frontal_image_url: stillUrl,
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
  }
}];
