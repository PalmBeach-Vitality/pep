// Node: prep_pep_beats (Code)
// After: if_complaince (true)  — EXACT canvas name
// Next: split_pep_beats
// Uses: Prep_day_variant → Limit (EXACT names)
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }]
// Picks TWO unique body+gesture combos (scene A + scene B).
// 1080p OmniHuman max 30s audio, so two cuts — not four, not one 60s blend.
// Spoken VO is product talk only. Compliance / disclaimer is caption-only.
// Thumbs-up is never allowed.

const row = (() => {
  try { return $('Prep_day_variant').item.json; } catch (e) {}
  try { return $('Limit').item.json; } catch (e) {}
  return $json;
})();

const compound = row.compound_name || 'research compound';
const compoundId = row.compound_id || '';
const surface = row.surface || 'premium research set';
const sceneBrief = row.scene_brief || '';
const lighting = row.lighting || 'bright clean key';
const grade = row.color_grade || 'clean controlled grade';
const hero = row.hero_style || `Palm Beach Pep featuring ${compound}`;
const motion = row.video_motion_prompt || row.camera_move || 'slow push-in';
const voiceOverRaw = String(row.voice_over || '').replace(/\s+/g, ' ').trim();
if (!voiceOverRaw) {
  throw new Error(
    'Missing voice_over from the sheet row. TTS must use tab 150-pb-pep-scenes column voice_over. Check Prep_day_variant.voice_over.'
  );
}
if (voiceOverRaw.includes("$('") || voiceOverRaw.includes('={{')) {
  throw new Error('voice_over looks like an n8n expression, not sheet text.');
}

// Caption-only. Never speak legal/compliance lines. Captions stay on grok_api / caption_lock.
function stripSpokenCompliance(text, disclaimerText) {
  let t = String(text || '').replace(/\s+/g, ' ').trim();
  t = t.replace(/\s*[—–-]\s*research language only\.?/gi, '.');
  const drop = [
    /research language only\.?/gi,
    /for laboratory research use only\.?/gi,
    /not for human use or consumption\.?/gi,
    /not a drug, dietary supplement, or cosmetic\.?/gi,
    /not evaluated by the fda\.?/gi,
    /research use only\.?/gi,
    /no treatment claims\.?/gi,
    /no human-use advice\.?/gi,
    /everything stays in the research and laboratory space\.?/gi,
  ];
  for (const re of drop) t = t.replace(re, ' ');
  const d = String(disclaimerText || '').trim();
  if (d) {
    const esc = d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(esc, 'gi'), ' ');
  }
  return t.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').replace(/^\.\s*/, '').trim();
}

const pepScript = String(row.pep_script || '').trim();
const disclaimer = String(row.disclaimer_short || '').trim();
const voiceOver = stripSpokenCompliance(voiceOverRaw, disclaimer);
if (!voiceOver) {
  throw new Error('Spoken voice_over was empty after stripping caption-only compliance lines.');
}

const PEP_MASTER_DEFAULT = 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/assets/palm-beach-pep-master.jpg';
const pepRefUrl = String(row.pep_ref_url || PEP_MASTER_DEFAULT).trim();
if (!pepRefUrl) {
  throw new Error('Missing pep_ref_url. Canonical Pep master URL is required.');
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function pickUnique(list, n) {
  if (!list.length) {
    throw new Error('Cannot pick blocking — empty pool.');
  }
  const mixed = shuffle(list);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(mixed[i % mixed.length]);
  }
  return out;
}

function angleText(rowOrString) {
  const fallback = 'slight 3/4 screen-right';
  if (rowOrString && typeof rowOrString === 'object') {
    return String(rowOrString.id || rowOrString.brief || fallback);
  }
  return String(rowOrString || fallback);
}

function isActive(v) {
  const s = String(v == null ? 'TRUE' : v).trim().toUpperCase();
  return s !== 'FALSE' && s !== '0' && s !== 'NO' && s !== '';
}

function rowsFromBlockingPool(type) {
  let items = [];
  try {
    items = $('get_blocking_pool').all();
  } catch (e) {
    return [];
  }
  const out = [];
  for (const it of items) {
    const j = it.json || {};
    if (!isActive(j.active)) continue;
    if (String(j.type || '').toLowerCase() !== type) continue;
    const id = String(j.id || '').trim();
    const still = String(j.still || '').trim();
    const motion = String(j.motion || '').trim();
    if (!id || !still) continue;
    out.push({
      id,
      still,
      motion,
      brief: String(j.brief || id.replace(/_/g, ' ')).trim(),
      omni: String(j.omni || motion).trim(),
    });
  }
  return out;
}

const BODY_ACTIONS = [
  {
    id: 'walking',
    still: 'POSE: mid-stride WALKING toward camera, slight 3/4. One sneaker forward, one sneaker back. This is a walk, not the master planted pose.',
    motion: 'walk toward camera slight 3/4, continuous stride, talking the whole time',
    brief: 'walking mid-stride toward camera',
  },
  {
    id: 'sitting',
    still: 'POSE: SITTING on a set-appropriate perch in this environment (bench, rock, dock edge, stool). Full body visible. Talking. Not the master planted thumbs-up.',
    motion: 'stay seated, shift weight, talk, small upper-body motion',
    brief: 'sitting in the set, talking',
  },
  {
    id: 'standing',
    still: 'POSE: STANDING at ease, weight on both white sneakers, slight 3/4 toward camera. Talking. Not frozen. Not the master thumbs-up.',
    motion: 'stand in place, sway slightly, talk, shift weight sneaker to sneaker',
    brief: 'standing and talking',
  },
  {
    id: 'stopping',
    still: 'POSE: STOPPING mid-walk — one sneaker still forward, body coming to a halt, looking to camera, talking. Not a planted thumbs-up freeze.',
    motion: 'take two steps then stop, hold the stop while talking, maybe start a step again',
    brief: 'stopping mid-walk to talk',
  },
  {
    id: 'turning',
    still: 'POSE: TURNING toward camera from a 3/4, one sneaker pivoting, talking. Not the master thumbs-up.',
    motion: 'turn toward camera, settle, talk, small pivot',
    brief: 'turning toward camera while talking',
  },
];

const GESTURES = [
  {
    id: 'present_label',
    still: 'HANDS: one white glove open-palm presents the 10ml label at chest height. Other glove relaxed at hip. NO thumbs-up.',
    motion: 'open-palm present the 10ml label, then lower the glove',
  },
  {
    id: 'point_10ml',
    still: 'HANDS: one white glove points at the 10ml typography. Other glove at hip. Point stays below the brim. NO thumbs-up. NO raised salute.',
    motion: 'point at the 10ml text, then drop the point',
  },
  {
    id: 'walk_swing',
    still: 'HANDS: both white gloves in a natural walk swing at hip height. Neither hand raised. NO thumbs-up.',
    motion: 'both gloves swing at hip height while talking',
  },
  {
    id: 'hip_rest',
    still: 'HANDS: one white glove rests on a hip, the other hangs relaxed. NO thumbs-up.',
    motion: 'one glove on hip, other glove punctuates speech',
  },
  {
    id: 'count_fingers',
    still: 'HANDS: counting 1-2-3 with white gloves at chest height. NO thumbs-up.',
    motion: 'count on glove fingers while talking, then relax',
  },
  {
    id: 'low_wave',
    still: 'HANDS: a small side wave, glove below the shoulder, not a high wave. NO thumbs-up. NO hat tip.',
    motion: 'small low wave, then gloves back to sides',
  },
  {
    id: 'palms_out',
    still: 'HANDS: both palms out at waist, “here it is” present of the vial body. NO thumbs-up.',
    motion: 'palms-out present, then relax',
  },
  {
    id: 'label_glance',
    still: 'HANDS: one glove taps or frames the 10ml label. Other glove down. NO thumbs-up.',
    motion: 'glance at the 10ml label and tap it once, keep talking',
  },
];

const ANGLES = [
  'slight 3/4 screen-right',
  'slight 3/4 screen-left',
  'eye-level front 3/4',
  'eye-level almost front',
];

const sheetBodies = rowsFromBlockingPool('body');
const sheetGestures = rowsFromBlockingPool('gesture');
const sheetAngles = rowsFromBlockingPool('angle');
const blockingSource = (sheetBodies.length && sheetGestures.length) ? 'pep-blocking-pool' : 'builtin';

const BEAT_IDS = ['a', 'b'];
const bodies = pickUnique(sheetBodies.length ? sheetBodies : BODY_ACTIONS, 2);
const gestures = pickUnique(sheetGestures.length ? sheetGestures : GESTURES, 2);
const anglePool = sheetAngles.length
  ? sheetAngles
  : ANGLES.map((label) => ({ id: label, brief: label }));
const angles = pickUnique(anglePool, 2);

const pepLock = [
  'CHARACTER LOCK — use master Pep reference exactly (https://files.catbox.moe/2yfdbi.jpg).',
  'Anthropomorphic clear 10mL sterile injectable-style glass vial,',
  'rubber stopper + silver aluminum crimp seal only (NOT screw-cap, NOT black twist cap),',
  'white mid-body label with cheerful cartoon face and bold 10ml text,',
  'white baseball cap with Palm Beach Vitality sunset + palm-tree logo,',
  'gray tube limbs, white cartoon gloves, rounded white sneakers,',
  'mouth open mid-word, clean 3D-cartoon / sticker style with bold outlines.',
  'HARD FAIL: thumbs-up. No hat-tip freeze. No extra mascots. No humans. No doctor offices. No hospitals.',
].join(' ');

function packBlocking(body, gesture, angleRow) {
  const angle = angleText(angleRow);
  const poseStill = [body.still, gesture.still, `ANGLE: ${angle}.`, 'MOUTH OPEN mid-word (OmniHuman start frame).'].join(' ');
  const poseMotion = `${body.motion}; ${gesture.motion}; ${angle}; talking mouth the whole clip`;
  const omnihuman_prompt = [
    'Palm Beach Pep, anthropomorphic 10ml crimp-seal glass vial mascot,',
    'talking with the audio. Mouth on the white 10ml label moves with speech.',
    (body.omni || body.motion) + '.',
    (gesture.omni || gesture.motion) + '.',
    angle + '.',
    'No thumbs-up. No hat-tip freeze.',
  ].join(' ');
  return { body, gesture, angle, poseStill, poseMotion, omnihuman_prompt };
}

const packs = BEAT_IDS.map((id, i) => packBlocking(bodies[i], gestures[i], angles[i]));
const body = packs[0].body;
const gesture = packs[0].gesture;
const angle = packs[0].angle;
const poseStill = packs[0].poseStill;
const poseMotion = packs[0].poseMotion;

const beatMeta = {
  a: { name: 'scene_a', window: '0–30s', extra: `${motion}; preserve Pep identity; no thumbs-up; no new text` },
  b: { name: 'scene_b', window: '30–60s', extra: 'new blocking in the same set; preserve Pep identity; no thumbs-up; no new text' },
};

const beats = {};
for (let i = 0; i < BEAT_IDS.length; i++) {
  const id = BEAT_IDS[i];
  const p = packs[i];
  const meta = beatMeta[id];
  const gestureLabel = String(p.gesture.id || '').replace(/_/g, ' ');
  beats[id] = {
    name: meta.name,
    brief: `Scene ${id.toUpperCase()} ${meta.name.toUpperCase()}: Palm Beach Pep mid-ground in this unique set: ${surface}. Blocking this cut: ${p.body.brief}, ${gestureLabel}. ${p.poseStill} ${pepLock} Product lock: ${compound} (${compoundId}). Lighting: ${lighting}. Grade: ${grade}. Hero: ${hero}. Full environment, not void packshot.`,
    motion: `${p.poseMotion}; ${meta.window}; ${meta.extra}`,
  };
}

function splitVoice(text) {
  const sentences = String(text || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length >= 2) {
    const n = Math.ceil(sentences.length / 2);
    return {
      a: sentences.slice(0, n).join(' ').trim(),
      b: sentences.slice(n).join(' ').trim(),
    };
  }
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const n = Math.max(1, Math.ceil(words.length / 2));
  return {
    a: words.slice(0, n).join(' ').trim(),
    b: words.slice(n).join(' ').trim(),
  };
}

const vo = splitVoice(voiceOver);
for (const id of BEAT_IDS) {
  if (!String(vo[id] || '').trim()) {
    throw new Error(`Empty vo_beat_${id}. Sheet voice_over is too short to split into two 1080p clips.`);
  }
}

const omnihuman_prompt = packs[0].omnihuman_prompt;

const beat_items = BEAT_IDS.map((id, i) => {
  const p = packs[i];
  return {
    beat: id,
    tts_text: vo[id],
    pep_body_action: p.body.id,
    pep_hand_gesture: p.gesture.id,
    pep_angle: p.angle,
    pose_still: p.poseStill,
    pose_motion: p.poseMotion,
    omnihuman_prompt: p.omnihuman_prompt,
    beat_brief: beats[id].brief,
    beat_motion: beats[id].motion,
  };
});

const uniqueBodies = new Set(beat_items.map((b) => b.pep_body_action));
if (uniqueBodies.size < 2) {
  throw new Error('Need at least two different body actions across beats so Pep does not drift on one pose.');
}

return {
  ...row,
  creation_id: row.creation_id || '',
  compound_id: compoundId,
  compound_name: compound,
  pep_ref_url: pepRefUrl,
  target_duration_seconds: 60,
  beat_count: 2,
  pep_body_action: body.id,
  pep_hand_gesture: gesture.id,
  pep_angle: angle,
  pep_body_action_a: packs[0].body.id,
  pep_body_action_b: packs[1].body.id,
  pep_hand_gesture_a: packs[0].gesture.id,
  pep_hand_gesture_b: packs[1].gesture.id,
  blocking_source: blockingSource,
  pose_still: poseStill,
  pose_still_a: packs[0].poseStill,
  pose_still_b: packs[1].poseStill,
  pose_motion: poseMotion,
  omnihuman_prompt: omnihuman_prompt,
  omnihuman_prompt_a: packs[0].omnihuman_prompt,
  omnihuman_prompt_b: packs[1].omnihuman_prompt,
  beat_items: beat_items,
  beat_a_brief: beats.a.brief,
  beat_b_brief: beats.b.brief,
  beat_a_motion: beats.a.motion,
  beat_b_motion: beats.b.motion,
  vo_beat_a: vo.a,
  vo_beat_b: vo.b,
  tts_text: vo.a,
  vo_source: 'sheet',
  voice_over: voiceOver,
  pep_script: pepScript,
  disclaimer_short: disclaimer,
  aspect_ratio: '9:16',
  resolution: '1080p',
  model_still: 'grok-imagine-image',
  model_video: 'fal-omnihuman-v1.5',
};
