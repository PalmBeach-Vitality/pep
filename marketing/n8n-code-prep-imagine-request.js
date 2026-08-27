// n8n Code node: prep_imagine_request
// Workflow: image_generation_buffer -3-image-scenes-150
// Mode: Run Once for All Items
// After: Wait (captions already parsed)  Before: GROK_Imagine
//
// lab_scene + vial_10ml_scene: catalog 10mL vial (same as Vid_gen_lab_scenes)
// plus PALM BEACH VITALITY overlay type. pen_3ml_scene keeps sheet still_prompt.
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

function isoDate() {
  try {
    return $now.toISODate();
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

function vialCatalogLock(name) {
  name = String(name || '').trim() || 'the compound';
  return (
    'HARD OUTPUT LOCK (READ FIRST): Match Vid_gen_lab_scenes / Palm Beach Vitality catalog 10mL vial packaging exactly. ' +
    'Exactly ONE upright 10mL multi-use injection vial in the frame. Clear transparent glass. ' +
    'Bright BLUE plastic flip-off cap seated on a brushed-silver aluminum crimp seal over a rubber septum — show the blue cap + silver crimp stack clearly. The blue flip-off cap is MANDATORY. ' +
    'Never a bare silver crimp. Never gold. Never black twist. Never screw-cap. ' +
    'LABEL: clean white wrap-around. Logo ABOVE the name: crimson red DNA double-helix icon only — no hands, no palms. ' +
    "Compound name '" +
    name +
    "' in large bold crimson red / dark maroon sans-serif, printed once. " +
    "Solid dark maroon / crimson red rectangle badge with white text exactly '10mg'. " +
    "Small black footer text exactly '10ml Sterile Multi-Use Vial'. " +
    'Vial stands vertical on its base, pre-filled with settled crystal-clear colorless liquid at a stable level. ' +
    'FORBIDDEN: silver-only cap with no blue flip-off, amber glass, gold caps, twist/screw caps, blank unbranded pharmacy vials, second vial, pens, people, needles, syringes. ' +
    'Ignore any scene_brief that describes a bare aluminum crimp without the blue flip-cap, or a two-line black-only sticker with no helix. Catalog vial wins.'
  );
}

function overlayText(src, name) {
  var headline = firstFilled(src, ['figma_headline']) || name;
  var subhead =
    firstFilled(src, ['figma_subhead']) || name + ' research material.';
  var bullets = [src.figma_bullet_1, src.figma_bullet_2, src.figma_bullet_3]
    .map(function (b) {
      return String(b || '').trim();
    })
    .filter(Boolean)
    .join(' | ');
  if (!bullets) {
    bullets =
      name +
      ' | 10mL catalog research vial | For laboratory research use only';
  }
  var cta = firstFilled(src, ['figma_cta']) || 'View laboratory listing';
  return (
    ' OVERLAY TEXT (required, sharp, perfectly spelled) as clean premium type over the photoreal pharma lab photo — do not replace the photo with a flat poster: ' +
    'Exact brand wordmark: PALM BEACH VITALITY. Exact headline: ' +
    headline +
    '. Exact subhead: ' +
    subhead +
    '. Exact bullets only: ' +
    bullets +
    '. Exact CTA: ' +
    String(cta).toUpperCase() +
    '. Exact footer: FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE. Tiny date: ' +
    isoDate() +
    '. Text stays in safe margins; the pharmaceutical cleanroom and the catalog vial must remain clearly visible.'
  );
}

var row = ($input.first() && $input.first().json) || {};
var prep = {};
try {
  prep = $('Prep_day_variant').first().json || {};
} catch (e) {
  prep = {};
}
var parsed = {};
try {
  parsed = $('Parse_Grok').first().json || {};
} catch (e) {
  parsed = {};
}

var src = Object.assign({}, prep, row, parsed);
var cat = firstFilled(src, ['scene_category']);
var name = firstFilled(src, ['compound_name']) || 'research material';
var base = firstFilled(src, ['still_prompt', 'scene_brief']);
if (!base) {
  throw new Error(
    'prep_imagine_request: empty still_prompt and scene_brief on ' +
      String(src.scene_id || name || '?')
  );
}

var prompt = base;
if (cat === 'vial_10ml_scene' || cat === 'lab_scene') {
  prompt = vialCatalogLock(name) + ' SCENE BRIEF: ' + base + overlayText(src, name);
}

prompt = capPrompt(prompt);

var model = firstFilled(src, ['model_still']) || 'grok-imagine-image-2.0';
var aspect = firstFilled(src, ['aspect_ratio']) || '9:16';
var resolution = firstFilled(src, ['still_resolution']) || '2k';
var n = Number(src.still_n);
if (!n) n = 1;

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
