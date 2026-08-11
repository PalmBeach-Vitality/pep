// Node for Beat A: use EXACT canvas name prep_grok_video_start
// Duplicates later: prep_grok_video_start_b / _c / _d
// Mode: Run Once for Each Item
// IMPORTANT: change BEAT to 'a' | 'b' | 'c' | 'd' in each duplicated node
//
// Video provider (locked): fal Kling v3 Pro I2V — cartoon-friendly path
// matching ElevenLabs Image & Video model family (Flows API not public yet).
// See marketing/n8n-pep-elevenlabs-video.md

const BEAT = 'a'; // ← change per node: a, b, c, or d

const beats = ['a', 'b', 'c', 'd'];
if (!beats.includes(BEAT)) {
  throw new Error(`BEAT must be one of ${beats.join(', ')}`);
}

const prep = (() => {
  try { return $('prep_pep_beats').item.json; } catch (e) { return $json; }
})();

// Exact canvas still save for A = save_still_url; B/C/D = save_still_url_b/c/d
function stillUrlFor(beat) {
  const nodeName = beat === 'a' ? 'save_still_url' : `save_still_url_${beat}`;
  try {
    const j = $(nodeName).item.json;
    return (
      j.reel_still_url ||
      j[`reel_still_url_${beat}`] ||
      j.data?.[0]?.url ||
      ''
    );
  } catch (e) {
    return '';
  }
}

const stillUrl = stillUrlFor(BEAT);
if (!stillUrl) {
  const expect = BEAT === 'a' ? 'save_still_url' : `save_still_url_${BEAT}`;
  throw new Error(`Missing still URL for beat ${BEAT}. Check ${expect}.`);
}

const compound = prep.compound_name || 'research compound';
const brief = prep[`beat_${BEAT}_brief`] || prep.scene_brief || '';
const motion = prep[`beat_${BEAT}_motion`] || prep.video_motion_prompt || 'slow push-in';
const lighting = prep.lighting || '';
const grade = prep.color_grade || '';

const videoPrompt = [
  'Animate this 9:16 vertical still into a polished cartoon-style 15-second film beat.',
  'Character lock: Palm Beach Pep stays identical — anthropomorphic 10mL crimp-seal glass vial mascot, Palm Beach Vitality sunset palm-tree logo on white baseball cap, face on white 10ml label, gray limbs, white gloves and sneakers.',
  'Style: friendly cartoon motion, clean stylized animation, stable character proportions, no morphing Pep into a different bottle or human.',
  `Product lock: ${compound} (${prep.compound_id || ''}).`,
  `Beat ${BEAT.toUpperCase()} intent: ${brief}`,
  `Motion: ${motion}.`,
  `Lighting continuity: ${lighting}.`,
  `Color grade continuity: ${grade}.`,
  'VIAL SPEC: rubber stopper + aluminum crimp only. FORBIDDEN: black twist caps, screw caps, droppers.',
  'SIGNAGE RULE: no safety placards, no alert graphics, no danger banners, no alert words.',
  'LOCATION RULE: no doctor offices, no hospitals, no clinical exam rooms.',
  'No humans. No new on-screen text. Silent clip (no spoken model audio) — voiceover is added later.',
  'Keep full environmental scene depth. Not extreme macro. Not a void packshot.',
].join(' ');

const negativePrompt = [
  'blur, distort, low quality, morphing, deformed vial,',
  'human people, faces of people, hospital, doctor office, clinic exam room,',
  'black twist cap, screw cap, dropper, on-screen text, captions, watermarks,',
  'safety placard, danger banner, alert graphics',
].join(' ');

// fal Kling v3 Pro I2V — duration is a string enum "3"…"15"
const videoRequestBody = {
  prompt: videoPrompt,
  start_image_url: String(stillUrl),
  duration: '15',
  generate_audio: false,
  negative_prompt: negativePrompt,
  cfg_scale: 0.5,
};

const MODEL_VIDEO = 'fal-kling-v3-pro-i2v';
const FAL_ENDPOINT = 'fal-ai/kling-video/v3/pro/image-to-video';

return [{
  json: {
    ...prep,
    beat: BEAT,
    reel_still_url: stillUrl,
    [`reel_still_url_${BEAT}`]: stillUrl,
    video_prompt: videoPrompt,
    video_motion_prompt: motion,
    duration_seconds: 15,
    aspect_ratio: '9:16',
    resolution: '1080p',
    model_video: MODEL_VIDEO,
    fal_endpoint: FAL_ENDPOINT,
    fal_submit_url: `https://queue.fal.run/${FAL_ENDPOINT}`,
    video_request_body: videoRequestBody,
    video_request_body_string: JSON.stringify(videoRequestBody),
  }
}];
