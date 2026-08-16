// n8n Code node name: prep_imagine_request
// Include Other Input Fields = ON
// No IF node. This picks generations vs edits, then GROK_Imagine posts it.

const BLUE_IDS = new Set(['P-SEM-001', 'P-TIR-001', 'P-RET-001']);
const BLUE_NAMES = new Set(['semaglutide', 'tirzepatide', 'retatrutide']);
const BLUE_TEMPLATE = 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/assets/pbv-research-pen-template-blue.png';
const RED_TEMPLATE = 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/imagine-2-0-7786/marketing/assets/pbv-research-pen-template-red.png';

const prep = $('Prep_day_variant').item.json || {};
const grok = $('Parse_Grok').item.json || {};
const sceneCategory = String(prep.scene_category || '');
const name = String(grok.display_name || prep.compound_name || '');
const id = String(prep.compound_id || '');
const isPen = sceneCategory === 'pen_3ml_scene';
const isBlue = BLUE_IDS.has(id) || BLUE_NAMES.has(name.trim().toLowerCase());
const accent = isBlue ? 'bright cobalt blue' : 'bright crimson red';
const accentShort = isBlue ? 'blue' : 'red';
const colorRule = isBlue
  ? 'ACCENT COLOR LOCK: BLUE — this is Semaglutide, Tirzepatide, or Retatrutide.'
  : 'ACCENT COLOR LOCK: RED — this peptide is NOT Semaglutide/Tirzepatide/Retatrutide; do not use blue accents.';
const today = (typeof $now !== 'undefined' && $now.toISODate)
  ? $now.toISODate()
  : new Date().toISOString().slice(0, 10);
const bullets = [grok.figma_bullet_1, grok.figma_bullet_2, grok.figma_bullet_3].filter(Boolean).join(' | ');
const headline = String(grok.figma_headline || grok.display_name || prep.compound_name || '');
const subhead = String(grok.figma_subhead || '');

const overlay = [
  'OVERLAY TEXT (required, sharp, perfectly spelled) as clean premium type over the photoreal pharma lab photo — do not replace the photo with a flat poster:',
  'Exact brand wordmark: PALM BEACH VITALITY',
  'Exact headline: ' + headline + '.',
  'Exact subhead: ' + subhead + '.',
  'Exact bullets only: ' + bullets + '.',
  'Exact CTA: VIEW LABORATORY LISTING',
  'Exact footer: FOR LABORATORY RESEARCH USE ONLY. NOT FOR HUMAN USE.',
  'Tiny date: ' + today + '.',
  'Text stays in safe margins; pharmaceutical cleanroom must remain clearly visible.',
  'HARD BAN: people, faces, hands, needles in use, clinics, gyms, lifestyle spa marble, cartoon hazard posters, biohazard trefoils as decor, striped danger tape as decoration.',
  'Style: luxury pharmaceutical manufacturing catalog photography, sterile, precise, expensive, photoreal, sharp.',
].join(' ');

let imagineUrl;
let imagineBody;

if (isPen) {
  imagineUrl = 'https://api.x.ai/v1/images/edits';
  imagineBody = {
    model: 'grok-imagine-image-2.0',
    aspect_ratio: '1:1',
    resolution: '2k',
    n: 1,
    image: {
      url: isBlue ? BLUE_TEMPLATE : RED_TEMPLATE,
      type: 'image_url',
    },
    prompt: [
      'EDIT the reference image. PRESERVE this sleek luxury research pen HARDWARE exactly, including the elongated slimmer 3mL barrel: matte pearl-gray medical plastic (not chrome), clear glass-like left tip-cap with NO pocket clip, ' + accent + ' precision mid accent ring, white wrap label with refined ' + accentShort + ' DNA double-helix graphic on the left of the label, ' + accent + ' finely ribbed dose dial on the right end.',
      'Keep the premium catalog look — expensive, refined, photoreal. Do not redesign the pen. Do not shorten the barrel. Do not add a pocket clip. Do not change proportions, cap style, or dial style. Keep accent color exactly ' + accentShort + '.',
      colorRule,
      'ONLY change the label text to this compound name in large ' + accentShort + ' sans-serif: ' + name + '.',
      'Secondary label line in smaller ' + accentShort + ' text: 3ml pen.',
      'Place that same locked longer pen mid-ground inside a photoreal pharmaceutical manufacturing cleanroom (GMP fill-finish / aseptic suite). NOT the template gray studio void. NOT a spa, bathroom, marble lifestyle set.',
      'FOLLOW THIS SCENE BRIEF EXACTLY: ' + String(prep.scene_brief || '') + '.',
      'scene_id=' + String(prep.scene_id || '') + '; scene_category=pen_3ml_scene.',
      'Wide environmental FULL PHARMA LAB SCENE. Deep focus. Architecture + process equipment readable. Pen stays readable but not an extreme macro.',
      overlay,
    ].join(' '),
  };
} else {
  imagineUrl = 'https://api.x.ai/v1/images/generations';
  imagineBody = {
    model: 'grok-imagine-image-2.0',
    aspect_ratio: '1:1',
    resolution: '2k',
    n: 1,
    prompt: [
      'Photoreal photograph of a REAL PHARMACEUTICAL MANUFACTURING CLEANROOM that produces sterile injectables / peptide pharmaceuticals.',
      'Look like GMP fill-finish / aseptic processing: ISO-classified suite, HEPA ceiling terminals, flush cleanroom walls, conductive flooring, stainless sanitary equipment, RABS/isolators, validated process equipment.',
      'NOT a sci-fi neon biotech set. NOT a university teaching lab. NOT a chemistry classroom. NOT a generic startup loft lab. NOT a graphic poster background.',
      'Wide environmental FULL PHARMA LAB SCENE showing the whole cleanroom volume. Deep focus. Architecture + process equipment readable.',
      'FOLLOW THIS SCENE BRIEF EXACTLY: ' + String(prep.scene_brief || '') + '.',
      'scene_id=' + String(prep.scene_id || '') + '; scene_category=' + sceneCategory + '.',
      'Product lock: ' + String(prep.compound_id || '') + ' / ' + name + '.',
      'Form detail: ' + String(prep.product_form_detail || '') + '.',
      'If scene_category is vial_10ml_scene: one 10mL sterile injectable clear glass vial with rubber stopper + aluminum crimp seal only (NO black twist/screw caps), small mid-ground on a clean pharma bench inside the cleanroom.',
      'If scene_category is lab_scene: pure pharmaceutical cleanroom; optional distant labeled 10mL crimp-seal vial only; never a close-up.',
      overlay,
    ].join(' '),
  };
}

return [{
  json: {
    ...($json || {}),
    imagine_mode: isPen ? (isBlue ? 'pen_edit_blue' : 'pen_edit_red') : 'lab_or_vial_generate',
    imagine_url: imagineUrl,
    imagine_body: imagineBody,
    imagine_body_string: JSON.stringify(imagineBody),
  },
}];
