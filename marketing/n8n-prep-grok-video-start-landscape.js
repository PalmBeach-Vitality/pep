// n8n Code node name: prep_grok_video_start
// Workflow: Vid_gen_landscape_scenes
// Mode: Run Once for All Items
function firstJson(name) {
  try {
    return $(name).first().json || {};
  } catch (e) {
    return {};
  }
}

function val(obj, names, fallback) {
  if (fallback === undefined) fallback = '';
  for (var i = 0; i < names.length; i++) {
    var n = names[i];
    if (obj && obj[n] !== undefined && obj[n] !== null && String(obj[n]).trim() !== '') {
      return obj[n];
    }
  }
  return fallback;
}

function pickHttpsUrl(list) {
  for (var i = 0; i < list.length; i++) {
    var s = String(list[i] || '').trim();
    if (/^https:\/\//i.test(s)) return s;
  }
  return '';
}

var input = ($input.first() && $input.first().json) || {};
var sheet = firstJson('get_reel_creations');
var stillNode = firstJson('save_still_url');
var editHttp = firstJson('grok_imagine_edit_still');
var editInstructions = firstJson('still_edit_instructions');

var stillResolved = pickHttpsUrl([
  val(input, ['still_url', 'source_still_url', 'edited_still_url']),
  input.data && input.data[0] && input.data[0].url,
  val(stillNode, ['still_url']),
  editHttp.data && editHttp.data[0] && editHttp.data[0].url,
]);

var motion = String(
  val(input, ['video_motion_prompt']) ||
    val(stillNode, ['video_motion_prompt']) ||
    val(sheet, ['video_motion_prompt'], '')
).trim();

var modelVideo = String(
  val(input, ['model_video']) ||
    val(stillNode, ['model_video']) ||
    val(sheet, ['model_video'], 'grok-imagine-video-1.5')
).trim() || 'grok-imagine-video-1.5';

var duration = Number(
  val(input, ['duration_seconds', 'duration']) ||
    val(stillNode, ['duration_seconds']) ||
    val(sheet, ['duration_seconds'], 15)
) || 15;

var resolution = String(
  val(input, ['resolution']) ||
    val(stillNode, ['resolution']) ||
    val(sheet, ['resolution'], '1080p')
).trim() || '1080p';

if (!stillResolved) {
  throw new Error('prep_grok_video_start: still_url missing from save_still_url');
}
if (!motion) {
  throw new Error('prep_grok_video_start: video_motion_prompt missing');
}

var VIAL_LABEL_LOCK =
  'VIAL LABEL LOCK (MANDATORY): If a vial is visible, keep or set the vial label to peptide name + 10ml only. FORBIDDEN on the vial: mg, mg/ml, mg/mL, mcg, IU, concentration, dosage.';
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
  model: modelVideo,
  prompt: motion,
  image: { url: stillResolved },
  duration: duration,
  resolution: resolution,
};

return [{
  json: {
    still_url: stillResolved,
    video_motion_prompt: motion,
    model_video: modelVideo,
    duration_seconds: duration,
    resolution: resolution,
    creation_id: String(
      val(input, ['creation_id']) ||
        val(stillNode, ['creation_id']) ||
        val(sheet, ['creation_id'], '')
    ),
    still_edit_prompt: String(val(editInstructions, ['still_edit_prompt'], '')),
    grok_video_body_json: JSON.stringify(body),
  }
}];