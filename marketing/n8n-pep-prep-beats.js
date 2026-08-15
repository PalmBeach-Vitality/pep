// Node: prep_pep_beats (Code)
// After: if_complaince (true)  — EXACT canvas name
// Next: split_pep_beats
// Uses: Prep_day_variant → Limit (EXACT names)
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }]
// Four unique poses. EVERY clip speaks the SAME ~55–60s product pitch.
// Easy upbeat wellness pitch. Intro + product + studies line + store CTA.
// 720p OmniHuman (60s audio). 1080p cannot hold 55–60s.

function nodeJson(name) {
  try {
    return $(name).item.json || {};
  } catch (e) {
    return {};
  }
}

function firstText(obj, keys) {
  for (const k of keys) {
    const v = String(obj?.[k] ?? '').replace(/\s+/g, ' ').trim();
    if (v) return v;
  }
  return '';
}

const fromPrep = nodeJson('Prep_day_variant');
const fromLimit = nodeJson('Limit');
const fromInput = $json || {};
const row = Object.assign({}, fromLimit, fromPrep, fromInput);

const compound = row.compound_name || 'research compound';
const compoundId = row.compound_id || '';
const surface = row.surface || 'premium research set';
const sceneBrief = row.scene_brief || '';
const lighting = row.lighting || 'bright clean key';
const grade = row.color_grade || 'clean controlled grade';
const hero = row.hero_style || `Palm Beach Pep featuring ${compound}`;
const motion = row.video_motion_prompt || row.camera_move || 'slow push-in';
const VO_KEYS = ['voice_over', 'Voice_Over', 'voiceOver', 'Voice Over'];
const voiceOverRaw =
  firstText(fromInput, VO_KEYS) ||
  firstText(fromPrep, VO_KEYS) ||
  firstText(fromLimit, VO_KEYS);
if (!voiceOverRaw) {
  throw new Error(
    'Missing voice_over. Open Limit OUTPUT — that field must be the sheet pitch. On Prep_day_variant set Include Other Input Fields ON, or add voice_over = {{ $json.voice_over }}. Unpin Prep_day_variant if it is an old pin without voice_over. Re-import tab 150-pb-pep-scenes if the live sheet column is empty.'
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
const PITCH_CTA = 'Visit us at palmbeach-vitality.store.';

function wordsOf(text) {
  return String(text || '').split(/\s+/).filter(Boolean);
}

function extractProductPitch(raw, disclaimerText) {
  let t = String(raw || '').replace(/\s+/g, ' ').trim();
  const cuts = [
    /\s*Today['’]s unique set:.*/i,
    /\s*Everything stays in the research and laboratory space.*/i,
    /\s*Palm Beach Vitality focuses on documentation.*/i,
  ];
  for (const re of cuts) {
    const idx = t.search(re);
    if (idx > 20) t = t.slice(0, idx).trim();
  }
  t = stripSpokenCompliance(t, disclaimerText);
  t = t.replace(/\s*Visit us at palmbeach-vitality\.store\.?\s*$/i, '').trim();
  if (t && !/[.!?]$/.test(t)) t += '.';
  t = (t + ' ' + PITCH_CTA).replace(/\s+/g, ' ').trim();
  const low = t.toLowerCase();
  const banned = [
    "today's unique set",
    'for laboratory research use only',
    'not evaluated by the fda',
    'everything stays in the research',
    'palm beach vitality focuses on documentation',
    'not for human use or consumption',
    'no treatment claims',
    'research use only',
  ];
  for (const b of banned) {
    if (low.includes(b)) {
      throw new Error(`Product pitch still contains sheet-list/compliance: ${b}`);
    }
  }
  if (!/palm beach pep/i.test(t)) {
    throw new Error('Product sales pitch must start with Pep introducing himself.');
  }
  if (!t.endsWith(PITCH_CTA)) {
    throw new Error('Product sales pitch must end with: Visit us at palmbeach-vitality.store.');
  }
  if (!/studies have shown/i.test(t) || !/beneficial to/i.test(t) || !/recent research studies/i.test(t)) {
    throw new Error('Product pitch must include: Studies have shown X has been beneficial to X in recent research studies.');
  }
  const n = wordsOf(t).length;
  if (n < 142 || n > 150) {
    throw new Error(`Spoken VO is ${n} words (~${(n / 2.51).toFixed(1)}s). Need 142–150 words (55–60s at Pep TTS rate). Re-import 150-pb-pep-scenes.`);
  }
  return t;
}

const voiceOver = extractProductPitch(voiceOverRaw, disclaimer);

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
    still: 'POSE: mid-stride WALKING toward camera, slight 3/4. One white sneaker stepping forward, one sneaker back. BOTH sneakers firmly on the ground of this set with contact shadows. HARD FAIL: hovering, floating, sneakers in mid-air. This is a walk, not the master thumbs-up freeze.',
    motion: 'walk toward camera slight 3/4, each step plants on the ground, talking the whole time',
    brief: 'walking mid-stride toward camera, sneakers on the ground',
  },
  {
    id: 'sitting',
    still: 'POSE: SITTING on a set-appropriate perch in this environment (bench, rock, dock edge, stool). Seat and sneakers contact the set. Full body visible. Talking. Not the master thumbs-up freeze. HARD FAIL: hovering.',
    motion: 'stay seated on the perch, sneakers on the set, shift weight, talk',
    brief: 'sitting in the set, talking',
  },
  {
    id: 'standing',
    still: 'POSE: STANDING at ease, BOTH white sneakers flat on the ground with contact shadows, slight 3/4 toward camera. Talking. Not frozen. Not the master thumbs-up. HARD FAIL: hovering, floating, sneakers in mid-air.',
    motion: 'stand in place with sneakers planted on the ground, sway slightly, talk',
    brief: 'standing and talking, sneakers on the ground',
  },
  {
    id: 'stopping',
    still: 'POSE: STOPPING mid-walk — one sneaker forward, both sneakers on the ground with contact shadows, looking to camera, talking. Not the master thumbs-up freeze. HARD FAIL: hovering.',
    motion: 'take two steps on the ground then stop, sneakers stay planted, talk',
    brief: 'stopping mid-walk to talk, sneakers on the ground',
  },
  {
    id: 'turning',
    still: 'POSE: TURNING toward camera from a 3/4, one sneaker pivoting ON the ground, both sneakers touching the set. Talking. Not the master thumbs-up. HARD FAIL: hovering.',
    motion: 'turn toward camera with sneakers on the ground, settle, talk',
    brief: 'turning toward camera while talking, sneakers on the ground',
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

const BEAT_IDS = ['a', 'b', 'c', 'd'];
const bodies = pickUnique(sheetBodies.length ? sheetBodies : BODY_ACTIONS, 4);
const gestures = pickUnique(sheetGestures.length ? sheetGestures : GESTURES, 4);
const anglePool = sheetAngles.length
  ? sheetAngles
  : ANGLES.map((label) => ({ id: label, brief: label }));
const angles = pickUnique(anglePool, 4);

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

function cleanSetText(surfaceText, briefText) {
  let t = [surfaceText, briefText].filter(Boolean).join('. ');
  t = t.replace(/\s+/g, ' ');
  const drop = [
    /He points[^.]+\./gi,
    /then open-glove[^.]*\./gi,
    /open-glove gesture\.?/gi,
    /points to the environment[^.]+\./gi,
    /count(?:ing)? on (?:glove )?fingers[^.]+\./gi,
  ];
  for (const re of drop) t = t.replace(re, ' ');
  return t.replace(/\s{2,}/g, ' ').trim();
}

const setText = cleanSetText(surface, sceneBrief);

function packBlocking(body, gesture, angleRow) {
  const angle = angleText(angleRow);
  const poseStill = [
    body.still,
    'HANDS: white gloves relaxed near the hips or hanging naturally. No pointing, no counting, no waving, no swinging.',
    `ANGLE: ${angle}.`,
    'FEET: both white sneakers firmly on the ground of this set. Contact shadows. HARD FAIL hover.',
    'MOUTH OPEN mid-word (OmniHuman start frame).',
  ].join(' ');
  const poseMotion = `${body.motion}; relaxed gloves near the hips; sneakers stay on the ground; ${angle}; talking mouth the whole clip`;
  const omnihuman_prompt = [
    'Palm Beach Pep, anthropomorphic 10ml crimp-seal glass vial mascot, talking with the audio.',
    'Mouth on the white 10ml label moves with speech.',
    'Hold the still pose. Stay in this exact set:',
    setText + '.',
    'Body motion is small and natural only — a little weight shift, a little sway, same walk/sit/stand the still already shows.',
    'FEET: sneakers stay on the ground the whole clip. If walking, each step plants on the set. HARD FAIL: hovering, floating, walking on air.',
    'ARMS: relaxed, close to the body, gloves near the hips. Tiny talk motion only.',
    'HARD FAIL: wild arm swings, rubber-band limbs, pointing, counting fingers, waving, salutes, T-pose, thumbs-up, hat-tip.',
    'Do not invent new choreography. Do not change the backdrop.',
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
  a: { name: 'scene_a', window: 'cut 1', extra: `${motion}; preserve Pep identity; no thumbs-up; no new text` },
  b: { name: 'scene_b', window: 'cut 2', extra: 'new blocking in the same set; preserve Pep identity; no thumbs-up; no new text' },
  c: { name: 'scene_c', window: 'cut 3', extra: 'new blocking in the same set; preserve Pep identity; no thumbs-up; no new text' },
  d: { name: 'scene_d', window: 'cut 4', extra: 'new blocking in the same set; preserve Pep identity; no thumbs-up; no new text' },
};

const beats = {};
for (let i = 0; i < BEAT_IDS.length; i++) {
  const id = BEAT_IDS[i];
  const p = packs[i];
  const meta = beatMeta[id];
  beats[id] = {
    name: meta.name,
    brief: `Scene ${id.toUpperCase()} ${meta.name.toUpperCase()}: Palm Beach Pep mid-ground in this unique set: ${setText}. Blocking this cut: ${p.body.brief}, relaxed gloves. ${p.poseStill} ${pepLock} Product lock: ${compound} (${compoundId}). Lighting: ${lighting}. Grade: ${grade}. Hero: ${hero}. Full environment, not void packshot.`,
    motion: `${p.poseMotion}; ${meta.window}; ${meta.extra}`,
  };
}

const omnihuman_prompt = packs[0].omnihuman_prompt;

const beat_items = BEAT_IDS.map((id, i) => {
  const p = packs[i];
  return {
    beat: id,
    tts_text: voiceOver,
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
  beat_count: 4,
  pep_body_action: body.id,
  pep_hand_gesture: gesture.id,
  pep_angle: angle,
  pep_body_action_a: packs[0].body.id,
  pep_body_action_b: packs[1].body.id,
  pep_body_action_c: packs[2].body.id,
  pep_body_action_d: packs[3].body.id,
  pep_hand_gesture_a: packs[0].gesture.id,
  pep_hand_gesture_b: packs[1].gesture.id,
  pep_hand_gesture_c: packs[2].gesture.id,
  pep_hand_gesture_d: packs[3].gesture.id,
  blocking_source: blockingSource,
  pose_still: poseStill,
  pose_still_a: packs[0].poseStill,
  pose_still_b: packs[1].poseStill,
  pose_still_c: packs[2].poseStill,
  pose_still_d: packs[3].poseStill,
  pose_motion: poseMotion,
  omnihuman_prompt: omnihuman_prompt,
  omnihuman_prompt_a: packs[0].omnihuman_prompt,
  omnihuman_prompt_b: packs[1].omnihuman_prompt,
  omnihuman_prompt_c: packs[2].omnihuman_prompt,
  omnihuman_prompt_d: packs[3].omnihuman_prompt,
  beat_items: beat_items,
  beat_a_brief: beats.a.brief,
  beat_b_brief: beats.b.brief,
  beat_c_brief: beats.c.brief,
  beat_d_brief: beats.d.brief,
  beat_a_motion: beats.a.motion,
  beat_b_motion: beats.b.motion,
  beat_c_motion: beats.c.motion,
  beat_d_motion: beats.d.motion,
  vo_beat_a: voiceOver,
  vo_beat_b: voiceOver,
  vo_beat_c: voiceOver,
  vo_beat_d: voiceOver,
  tts_text: voiceOver,
  vo_source: 'sheet',
  voice_over: voiceOver,
  scene_brief: sceneBrief,
  set_text: setText,
  pep_script: pepScript,
  disclaimer_short: disclaimer,
  aspect_ratio: '9:16',
  resolution: '720p',
  model_still: 'grok-imagine-image',
  model_video: 'fal-omnihuman-v1.5',
};
