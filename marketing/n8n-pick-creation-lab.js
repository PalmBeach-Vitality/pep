// n8n Code node name: pick_creation
// Workflow: Vid_gen_lab_scenes -9-lab-items-creations-500
// Mode: Run Once for All Items
// After: get_reel_creations / filter Active on 9-lab-item-creations-500
// Before: grok_imagine_reel_still
//
// HARD RULE: every video generation parameter comes from the sheet row.
// This node must not invent camera, motion, model_video, duration, aspect_ratio, or resolution.
// Least-used rotation + skip same category AND same shot_family as last used.

const creations = $input.all().map((i) => i.json);

if (!creations.length) {
  throw new Error(
    'No reel creations returned. Check get_reel_creations Document/Sheet and filter status=Active.'
  );
}

function val(obj, names, fallback = '') {
  for (const n of names) {
    if (obj[n] !== undefined && obj[n] !== null && String(obj[n]).trim() !== '') {
      return obj[n];
    }
  }
  const keys = Object.keys(obj || {});
  for (const want of names) {
    const normWant = want.toLowerCase().replace(/\s+/g, '_');
    const found = keys.find((k) => k.toLowerCase().replace(/\s+/g, '_') === normWant);
    if (found && String(obj[found]).trim() !== '') return obj[found];
  }
  return fallback;
}

function isActive(status) {
  const s = String(status || '').trim().toLowerCase();
  return !s || s === 'active' || s === 'true' || s === '1' || s === 'yes';
}

const scored = creations
  .map((c) => {
    const rankNum = Number(val(c, ['rank', 'creation_rank'], 0));
    const fromSheet = String(val(c, ['creation_id', 'creationId', 'Creation_ID'], '')).trim();
    const creation_id =
      fromSheet ||
      (rankNum > 0 ? `PBVita-Lab-${String(rankNum).padStart(3, '0')}` : '');

    return {
      raw: c,
      creation_id,
      rank: rankNum,
      row_number:
        Number(val(c, ['row_number', 'rowNumber'], 0)) ||
        (rankNum > 0 ? rankNum + 1 : 0),
      lab_item_id: val(c, ['lab_item_id', 'labItemId']),
      lab_item: val(c, ['lab_item', 'labItem', 'item_name']),
      compound_name: val(c, ['compound_name', 'compoundName', 'label_compound']),
      shot_family: val(c, ['shot_family', 'shotFamily']),
      camera_angle: val(c, ['camera_angle', 'cameraAngle']),
      camera_direction: val(c, ['camera_direction', 'cameraDirection']),
      framing: val(c, ['framing']),
      scene_id: val(c, ['scene_id', 'sceneId']),
      category: val(c, ['category', 'scene_category']),
      scene_brief: val(c, ['scene_brief', 'sceneBrief']),
      quality_suffix: val(c, ['quality_suffix', 'qualitySuffix']),
      quality_var_count: val(c, ['quality_var_count', 'qualityVarCount'], 12),
      aspect_ratio: val(c, ['aspect_ratio', 'aspectRatio']),
      duration_seconds: val(c, ['duration_seconds', 'durationSeconds', 'duration']),
      resolution: val(c, ['resolution']),
      model_still: val(c, ['model_still', 'modelStill']),
      model_video: val(c, ['model_video', 'modelVideo']),
      still_resolution: val(c, ['still_resolution', 'stillResolution']),
      video_prompt: val(c, ['video_prompt', 'videoPrompt']),
      video_motion_prompt: String(
        val(c, ['video_motion_prompt', 'videoMotionPrompt', 'motion_prompt'], '')
      ).trim(),
      surface: val(c, ['surface']),
      lighting: val(c, ['lighting']),
      camera_move: val(c, ['camera_move', 'cameraMove', 'camera']),
      color_grade: val(c, ['color_grade', 'colorGrade']),
      hero_style: val(c, ['hero_style', 'heroStyle']),
      status: val(c, ['status', 'creation_status'], 'Active'),
      times_used: Number(val(c, ['times_used', 'creation_times_used'], 0)) || 0,
      last_used_at: String(val(c, ['last_used_at', 'lastUsedAt', 'last_reel_at'], '')),
    };
  })
  .filter(
    (c) =>
      c.creation_id &&
      c.video_prompt &&
      c.video_motion_prompt &&
      c.camera_move &&
      c.model_video &&
      c.duration_seconds &&
      c.resolution &&
      c.aspect_ratio
  )
  .filter((c) => isActive(c.status))
  .sort((a, b) => {
    if (a.times_used !== b.times_used) return a.times_used - b.times_used;
    if (a.last_used_at !== b.last_used_at) {
      return String(a.last_used_at).localeCompare(String(b.last_used_at));
    }
    return Number(a.rank) - Number(b.rank);
  });

if (!scored.length) {
  const sampleKeys = Object.keys(creations[0] || {}).join(', ');
  throw new Error(
    'No valid creations (need creation_id + video_prompt + video_motion_prompt + camera_move + model_video + duration_seconds + resolution + aspect_ratio from the sheet). First row keys: ' +
      sampleKeys
  );
}

const previouslyUsed = scored
  .filter((c) => c.times_used > 0 || (c.last_used_at && c.last_used_at.trim()))
  .slice()
  .sort((a, b) => String(b.last_used_at).localeCompare(String(a.last_used_at)));

// Diversify against the last N runs (not just the single previous row)
const RECENT_N = 8;
const recent = previouslyUsed.slice(0, RECENT_N);
const last = recent[0] || null;
const lastId = last?.creation_id || '';
const recentFamilies = new Set(recent.map((c) => c.shot_family).filter(Boolean));
const recentCameras = new Set(recent.map((c) => c.camera_move).filter(Boolean));
const recentAngles = new Set(recent.map((c) => c.camera_angle).filter(Boolean));
const recentDirections = new Set(recent.map((c) => c.camera_direction).filter(Boolean));
const recentFramings = new Set(recent.map((c) => c.framing).filter(Boolean));
const recentCategories = new Set(recent.map((c) => c.category).filter(Boolean));

function scorePick(c) {
  let penalty = 0;
  if (lastId && c.creation_id === lastId) penalty += 1000;
  if (c.shot_family && recentFamilies.has(c.shot_family)) penalty += 120;
  if (c.camera_move && recentCameras.has(c.camera_move)) penalty += 140;
  if (c.camera_angle && recentAngles.has(c.camera_angle)) penalty += 50;
  if (c.camera_direction && recentDirections.has(c.camera_direction)) penalty += 50;
  if (c.framing && recentFramings.has(c.framing)) penalty += 60;
  if (c.category && recentCategories.has(c.category)) penalty += 40;
  // Extra weight against the immediate previous family/camera
  if (last?.shot_family && c.shot_family === last.shot_family) penalty += 40;
  if (last?.camera_move && c.camera_move === last.camera_move) penalty += 40;
  return penalty;
}

const diversified = scored
  .slice()
  .sort((a, b) => {
    const pa = scorePick(a);
    const pb = scorePick(b);
    if (pa !== pb) return pa - pb;
    if (a.times_used !== b.times_used) return a.times_used - b.times_used;
    if (a.last_used_at !== b.last_used_at) {
      return String(a.last_used_at).localeCompare(String(b.last_used_at));
    }
    return Number(a.rank) - Number(b.rank);
  });
const pick = diversified[0];

if (!pick.model_video) {
  throw new Error('HARD RULE: sheet row missing model_video for ' + pick.creation_id);
}
if (!pick.duration_seconds) {
  throw new Error('HARD RULE: sheet row missing duration_seconds for ' + pick.creation_id);
}
if (!pick.resolution) {
  throw new Error('HARD RULE: sheet row missing resolution for ' + pick.creation_id);
}
if (!pick.aspect_ratio) {
  throw new Error('HARD RULE: sheet row missing aspect_ratio for ' + pick.creation_id);
}
if (!pick.camera_move) {
  throw new Error('HARD RULE: sheet row missing camera_move for ' + pick.creation_id);
}
if (!pick.video_motion_prompt) {
  throw new Error('HARD RULE: sheet row missing video_motion_prompt for ' + pick.creation_id);
}

function peptideNameForVial(raw) {
  return String(raw || '')
    .replace(/\d+(?:\.\d+)?\s*(mg|mcg|µg|ug|iu)\s*\/\s*m[lL]/gi, '')
    .replace(/\d+(?:\.\d+)?\s*(mg|mcg|µg|ug|iu)\b/gi, '')
    .replace(/\b\d+(?:\.\d+)?\s*m[lL]\b/gi, '')
    .replace(/\b(vial|pen|sterile|multi-?use)\b/gi, '')
    .replace(/[/|,]+/g, ' / ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s\-–:/]+|[\s\-–:/]+$/g, '')
    .trim();
}

/** Hard rule for Grok: injection vials = aluminum crimp + rubber septum only */
const VIAL_CLOSURE_RULE =
  "VIAL CLOSURE RULE (MANDATORY): Every vial must be a pharmaceutical injection vial with an " +
  "aluminum crimped seal over a rubber septum stopper. Show the crimped metal collar and rubber " +
  "center clearly when a vial is visible. NO twist-off caps, NO screw-top vials, NO child-resistant " +
  "twist lids, NO plastic twist closures — crimped metal + rubber only.";

const VIAL_LABEL_LOCK =
  "VIAL LABEL LOCK (MANDATORY): If a vial is visible, the vial sticker has exactly two lines: peptide name, then 10ml. " +
  "No milligram marks, no per-milliliter marks, no extra numbers on glass, cap, or carton.";

function withVialRules(prompt, peptide) {
  const p = String(prompt || '').trim();
  if (!p) return p;
  let out = p;
  if (!/VIAL CLOSURE RULE/i.test(out)) out += ' ' + VIAL_CLOSURE_RULE;
  if (!/VIAL LABEL LOCK/i.test(out)) {
    const nameBit = peptide ? ` Print exactly "${peptide}" and "10ml".` : '';
    out += ' ' + VIAL_LABEL_LOCK + nameBit;
  }
  return out;
}

let compound = {};
try {
  compound = $('Parse_Grok').item?.json || {};
} catch (e) {
  compound = {};
}
if (!Object.keys(compound).length) {
  try {
    compound = $('if_compliance').item?.json || {};
  } catch (e) {
    compound = {};
  }
}

let template_id = compound.template_id || '';
if (!template_id) {
  try {
    template_id = $('Prep_day_variant').item?.json?.template_id || '';
  } catch (e) {
    template_id = '';
  }
}

return [
  {
    json: {
      ...compound,

      creation_id: pick.creation_id,
      creation_rank: pick.rank,
      row_number: pick.row_number,
      lab_item_id: pick.lab_item_id,
      lab_item: pick.lab_item,
      compound_name: pick.compound_name || '',
      shot_family: pick.shot_family,
      camera_angle: pick.camera_angle,
      camera_direction: pick.camera_direction,
      framing: pick.framing,
      scene_id: pick.scene_id,
      scene_category: pick.category,
      scene_brief: pick.scene_brief,
      quality_suffix: pick.quality_suffix,
      quality_var_count: pick.quality_var_count,
      aspect_ratio: pick.aspect_ratio,
      duration_seconds: Number(pick.duration_seconds),
      resolution: pick.resolution,
      model_still: pick.model_still,
      model_video: pick.model_video,
      still_resolution: pick.still_resolution,
      video_prompt: withVialRules(pick.video_prompt, peptideNameForVial(pick.compound_name)),
      video_motion_prompt: pick.video_motion_prompt,
      surface: pick.surface,
      lighting: pick.lighting,
      camera_move: pick.camera_move,
      color_grade: pick.color_grade,
      hero_style: pick.hero_style,
      creation_status: pick.status,
      creation_times_used: pick.times_used,
      creation_last_used_at: pick.last_used_at,

      // Creatomate overlay copy lives on Sheet 10 (pick_text) — not on Sheet 9

      template_id,
    },
  },
];
