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

var input = ($json && typeof $json === 'object') ? $json : {};
var stillUrl =
  pickUrl(firstJson('grok_imagine_edit_still')) ||
  pickUrl(firstJson('grok_imagine_reel_still')) ||
  pickUrl(firstJson('GROK_Imagine')) ||
  pickUrl(input);

if (!stillUrl) {
  throw new Error('save_still_url: no https Imagine URL. Run grok_imagine_reel_still first.');
}

var pick = firstJson('pick_creation');
var sheet = firstJson('get_reel_creations');

return [{
  json: Object.assign({}, input, {
    still_url: stillUrl,
    reel_still_url: stillUrl,
    save_still_url: stillUrl,
    creation_id: String(input.creation_id || pick.creation_id || sheet.creation_id || ''),
    video_prompt: String(input.video_prompt || pick.video_prompt || sheet.video_prompt || ''),
    video_motion_prompt: String(input.video_motion_prompt || pick.video_motion_prompt || sheet.video_motion_prompt || ''),
    scene_brief: String(input.scene_brief || pick.scene_brief || sheet.scene_brief || ''),
    compound_id: String(input.compound_id || pick.compound_id || sheet.compound_id || ''),
    compound_name: String(input.compound_name || pick.compound_name || sheet.compound_name || ''),
  }),
}];
