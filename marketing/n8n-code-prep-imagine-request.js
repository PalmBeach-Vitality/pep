// n8n Code node: prep_imagine_request
// Workflow: image_generation_buffer -3-image-scenes-150
// Mode: Run Once for All Items
// After: Wait (captions already parsed)  Before: GROK_Imagine
//
// Image still mapper for lab_scene, vial_10ml_scene, and pen_3ml_scene.
// Prompt: still_prompt if the row has one (catalog-pen overlay), else scene_brief.
// model / aspect / resolution / n: sheet when filled, else the same Imagine
// defaults already on pen rows (image params may live in this node).
// GROK_Imagine posts $json.imagine_body_string to $json.imagine_url.

function firstFilled(obj, names) {
  for (var i = 0; i < names.length; i++) {
    var n = names[i];
    if (obj[n] !== undefined && obj[n] !== null && String(obj[n]).trim() !== '') {
      return String(obj[n]).trim();
    }
  }
  return '';
}

function capPrompt(text) {
  var t = String(text || '');
  while (t.indexOf('  ') !== -1) t = t.split('  ').join(' ');
  t = t.trim();
  if (t.length > 7900) t = t.slice(0, 7900);
  return t;
}

function modeFor(cat) {
  if (cat === 'pen_3ml_scene') return 'pen_generate';
  if (cat === 'vial_10ml_scene') return 'vial_generate';
  return 'lab_generate';
}

var row = ($input.first() && $input.first().json) || {};
var prep = {};
try {
  prep = $('Prep_day_variant').first().json || {};
} catch (e) {
  prep = {};
}

var src = Object.assign({}, prep, row);
var prompt = capPrompt(firstFilled(src, ['still_prompt', 'scene_brief']));
if (!prompt) {
  throw new Error(
    'prep_imagine_request: empty still_prompt and scene_brief on ' +
      String(src.scene_id || src.compound_name || '?')
  );
}

var model = firstFilled(src, ['model_still']) || 'grok-imagine-image-2.0';
var aspect = firstFilled(src, ['aspect_ratio']) || '9:16';
var resolution = firstFilled(src, ['still_resolution']) || '2k';
var n = Number(src.still_n);
if (!n) n = 1;

var cat = firstFilled(src, ['scene_category']);
var imagineUrl = 'https://api.x.ai/v1/images/generations';
var imagineBody = {
  model: model,
  prompt: prompt,
  n: n,
  aspect_ratio: aspect,
  resolution: resolution,
};

return [
  {
    json: Object.assign({}, src, {
      imagine_mode: modeFor(cat),
      imagine_url: imagineUrl,
      imagine_body: imagineBody,
      imagine_body_string: JSON.stringify(imagineBody),
    }),
  },
];
