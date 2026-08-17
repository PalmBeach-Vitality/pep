// n8n Code node name: prep_grok_video_start
// Mode: Run Once for All Items

function firstJson(name) {
  try { return $(name).first().json || {}; } catch (e) { return {}; }
}
function pickUrl(obj) {
  if (!obj || typeof obj !== 'object') return '';
  var candidates = [
    obj.still_url, obj.reel_still_url, obj.save_still_url,
    obj.data && obj.data[0] && obj.data[0].url, obj.url
  ];
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    if (typeof c === 'string' && /^https:\/\//i.test(c.trim())) return c.trim();
  }
  return '';
}

var VIAL_LABEL_LOCK =
  'VIAL LABEL LOCK (MANDATORY): If a vial is visible, keep the vial sticker at two lines only: peptide name, then 10ml. ' +
  'Do not add milligram marks, per-milliliter marks, or extra numbers on the vial.';

var input = $json || {};
var stillUrl =
  pickUrl(input) ||
  pickUrl(firstJson('save_still_url')) ||
  pickUrl(firstJson('merge_still_and_camera')) ||
  pickUrl(firstJson('grok_imagine_edit_still')) ||
  pickUrl(firstJson('grok_imagine_reel_still'));
if (!stillUrl) {
  throw new Error('prep_grok_video_start: still_url missing — run save_still_url first');
}
var pick = firstJson('pick_creation');
var merge = firstJson('merge_still_and_camera');
var motion = String(
  input.video_motion_prompt || pick.video_motion_prompt || merge.video_motion_prompt ||
  'Slow cinematic push-in. Keep the exact same scene, materials, and lighting. No people, hands, needles, or new text.'
).trim();
if (!/VIAL LABEL LOCK/i.test(motion)) {
  motion = (motion + ' ' + VIAL_LABEL_LOCK).trim();
}
if (motion.length > 700) {
  var lockIdx = motion.indexOf('VIAL LABEL LOCK');
  var lock = lockIdx >= 0 ? ' ' + motion.slice(lockIdx) : ' ' + VIAL_LABEL_LOCK;
  var keep = Math.max(0, 697 - lock.length);
  motion = motion.slice(0, keep).replace(/\s+\S*$/, '') + '.' + lock;
}
var body = {
  model: 'grok-imagine-video-1.5',
  prompt: motion,
  image: { url: stillUrl },
  duration: 15,
  aspect_ratio: '9:16',
  resolution: '1080p'
};
return [{ json: Object.assign({}, input, {
  still_url: stillUrl,
  reel_still_url: stillUrl,
  video_motion_prompt: motion,
  grok_video_body_json: JSON.stringify(body)
})}];
