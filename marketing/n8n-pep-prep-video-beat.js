// Node for Beat A: use EXACT canvas name prep_grok_video_start
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
  'Animate this 9:16 vertical still of Palm Beach Pep into a 15-second vertical film beat.',
  'Character: Palm Beach Pep must stay consistent (10mL crimp-seal vial mascot, Palm Beach Vitality hat, white gloves/sneakers).',
  `Product lock: ${compound} (${prep.compound_id || ''}).`,
  `Beat ${BEAT.toUpperCase()} intent: ${brief}`,
  `Motion: ${motion}.`,
  `Lighting continuity: ${lighting}.`,
  `Color grade continuity: ${grade}.`,
  'VIAL SPEC: rubber stopper + aluminum crimp only. FORBIDDEN: black twist caps, screw caps, droppers.',
  'SIGNAGE RULE: no safety placards, no alert graphics, no danger banners, no alert words.',
  'LOCATION RULE: no doctor offices, no hospitals, no clinical exam rooms.',
  'No humans. No new on-screen text. No spoken voiceover in the model audio (silent or soft ambient only).',
  'Keep full environmental scene depth. Not extreme macro. Not a void packshot.',
].join(' ');

const videoRequestBody = {
  model: 'grok-imagine-video-1.5',
  prompt: videoPrompt,
  image: { url: String(stillUrl) },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '1080p',
};

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
    model_video: 'grok-imagine-video-1.5',
    video_request_body: videoRequestBody,
    video_request_body_string: JSON.stringify(videoRequestBody),
  }
}];
