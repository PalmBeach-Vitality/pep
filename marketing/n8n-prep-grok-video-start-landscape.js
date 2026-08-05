// Node: prep_grok_video_start (Code)
// After: grok_imagine_reel_still  (or grok_imagine_reel_still_url)
// Mode: Run Once for Each Item

const pick = $('pick_creation').item.json;
const parsed = $('Parse_Grok').item.json;

// Support either Imagine node name
let stillUrl = '';
try {
  stillUrl = $('grok_imagine_reel_still').item.json.data?.[0]?.url || '';
} catch (e) {}
if (!stillUrl) {
  try {
    stillUrl = $('grok_imagine_reel_still_url').item.json.data?.[0]?.url || '';
  } catch (e) {}
}
if (!stillUrl) {
  stillUrl = $json.data?.[0]?.url || $json.reel_still_url || '';
}

const displayName = parsed.display_name || parsed.figma_headline || pick.compound_name || 'research compound';
const motion = pick.video_motion_prompt || pick.camera_move || 'gentle environmental motion, slow push-in';
const videoPrompt = [
  'Animate this photoreal Palm Beach Vitality 9:16 still into a 15-second premium vertical catalog film.',
  'Follow source scene and keep product identity unchanged.',
  'Scene brief: ' + String(pick.scene_brief || ''),
  'Source video prompt: ' + String(pick.video_prompt || ''),
  'Motion: ' + String(motion),
  'Camera: ' + String(pick.camera_move || 'slow cinematic push-in with subtle parallax'),
  'Lighting continuity: ' + String(pick.lighting || ''),
  'Color grade continuity: ' + String(pick.color_grade || ''),
  'Product lock: ' + String(displayName) + ' (' + String(pick.compound_id || '') + ').',
  'If a vial is visible: keep 10mL sterile aluminum crimp + rubber stopper only. No twist/screw caps.',
  'SIGNAGE RULE: no safety placards, no alert graphics, no danger banners, no alert words.',
  'No people, no hands, no needles, no injection, no clinic, no gym, no lifestyle, no before/after.',
  'No new on-screen text. No voiceover.',
  'Mood: expensive research catalog / cinematic environment, precise, premium.',
].join(' ');

const videoRequestBody = {
  model: 'grok-imagine-video-1.5',
  prompt: videoPrompt,
  image: { url: String(stillUrl) },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '720p',
};

return [{
  json: {
    ...pick,
    scene_id: pick.scene_id || pick.creation_id || '',
    creation_id: pick.creation_id || pick.scene_id || '',
    compound_id: pick.compound_id || '',
    compound_name: pick.compound_name || displayName,
    reel_still_url: stillUrl,
    video_prompt: videoPrompt,
    video_motion_prompt: motion,
    aspect_ratio: '9:16',
    duration_seconds: 15,
    resolution: '720p',
    model_video: 'grok-imagine-video-1.5',
    video_request_body: videoRequestBody,
    video_request_body_string: JSON.stringify(videoRequestBody),
  }
}];
