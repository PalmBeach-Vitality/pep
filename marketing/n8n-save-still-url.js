function firstJson(name) {
  try {
    return $(name).first().json || {};
  } catch (e) {
    return {};
  }
}

function pickUrl(obj) {
  if (!obj || typeof obj !== 'object') return '';
  var candidates = [
    obj.data && obj.data[0] && obj.data[0].url,
    obj.data && obj.data[0] && obj.data[0].image_url,
    obj.data && obj.data[0] && obj.data[0].image && obj.data[0].image.url,
    obj.url,
    obj.image_url,
    obj.output && obj.output[0] && obj.output[0].url,
    obj.images && obj.images[0] && obj.images[0].url,
    obj.reel_still_url,
    obj.still_url,
    obj.save_still_url,
  ];
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    if (typeof c === 'string' && /^https:\/\//i.test(c.trim())) return c.trim();
  }
  return '';
}

var input = $json && typeof $json === 'object' ? $json : {};
var stillUrl =
  pickUrl(firstJson('grok_imagine_edit_still')) ||
  pickUrl(firstJson('grok_imagine_reel_still')) ||
  pickUrl(firstJson('GROK_Imagine')) ||
  pickUrl(input);

if (!stillUrl) {
  throw new Error('save_still_url: no https Imagine URL. Run grok_imagine_reel_still first.');
}

var pick = firstJson('pick_creation');

function fromPick(name) {
  var v = input[name];
  if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  if (pick[name] !== undefined && pick[name] !== null && String(pick[name]).trim() !== '') {
    return pick[name];
  }
  return '';
}

return [
  {
    json: Object.assign({}, input, {
      still_url: stillUrl,
      reel_still_url: stillUrl,
      save_still_url: stillUrl,
      creation_id: String(fromPick('creation_id') || ''),
      video_prompt: String(fromPick('video_prompt') || ''),
      video_motion_prompt: String(fromPick('video_motion_prompt') || ''),
      scene_brief: String(fromPick('scene_brief') || ''),
      compound_id: String(fromPick('compound_id') || ''),
      compound_name: String(fromPick('compound_name') || ''),
      model_video: String(fromPick('model_video') || ''),
      duration_seconds: fromPick('duration_seconds'),
      resolution: String(fromPick('resolution') || ''),
      aspect_ratio: fromPick('aspect_ratio'),
      camera_move: String(fromPick('camera_move') || ''),
      shot_family: String(fromPick('shot_family') || ''),
      camera_angle: String(fromPick('camera_angle') || ''),
      camera_direction: String(fromPick('camera_direction') || ''),
      framing: String(fromPick('framing') || ''),
      row_number: Number(pick.row_number || input.row_number || 0) || 0,
      creation_times_used: Number(pick.creation_times_used || pick.times_used || 0) || 0,
    }),
  },
];
