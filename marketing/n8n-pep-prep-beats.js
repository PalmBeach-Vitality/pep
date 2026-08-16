// Node: prep_pep_beats (Code)
// After: if_complaince (true)  — EXACT canvas name
// Next: split_pep_beats
// Uses: Prep_day_variant → Limit (EXACT names)
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }]
// ONE talking clip. Walk-and-talk (default) or stand/sit from the scene row.
// Same ~50s sheet pitch, 720p OmniHuman.
// Easy science pitch: how this peptide works + studies line + COA line + store CTA.
// OmniHuman caps near 50s. No extra scene cuts.

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
function stripSpokenCompliance(text) {
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
  return t.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').replace(/^\.\s*/, '').trim();
}

const PITCH_CTA = 'Visit us at palmbeach-vitality.store.';

function wordsOf(text) {
  return String(text || '').split(/\s+/).filter(Boolean);
}

function extractProductPitch(raw) {
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
  t = stripSpokenCompliance(t);
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
  if (!/backed by a COA/i.test(t) || !/>99%/.test(t) || !/american made/i.test(t) || !/100% of the time/i.test(t)) {
    throw new Error('Product pitch must include the COA line before the store CTA: Palm Beach Vitality research peptides are backed by a COA with every single order, American made delivering >99% purity 100% of the time.');
  }
  const n = wordsOf(t).length;
  if (n < 112 || n > 125) {
    throw new Error(`Spoken VO is ${n} words (~${(n / 2.51).toFixed(1)}s). Need 112–125 words (~45–50s at Pep TTS rate). Re-import 150-pb-pep-scenes.`);
  }
  return t;
}

const voiceOver = extractProductPitch(voiceOverRaw);

// Spoken names for ElevenLabs only. Written pitch / captions stay chemical names.
// Longer keys first so combo names win. Optional sheet column tts_pronounce: Name=spoken|Name=spoken
const PRONOUNCE = [
  ['>99% purity 100% of the time', 'greater than ninety-nine percent purity one hundred percent of the time'],
  ['backed by a COA', 'backed by a certificate of analysis'],
  ['KPV / BPC-157 / TB-500 / GHK-Cu', 'K P V, B P C 157, T B 500, and G H K copper'],
  ['BPC-157 / TB-500 / GHK-Cu', 'B P C 157, T B 500, and G H K copper'],
  ['CJC (no DAC)/Ipamorelin', 'C J C, no D A C, and eye-PAM-or-REL-in'],
  ['BPC-157 / TB-500', 'B P C 157 and T B 500'],
  ['CJC (no DAC)', 'C J C, no D A C'],
  ['Thymosin Alpha-1', 'THY-mo-sin Alpha one'],
  ['Tesamorelin', 'tess-uh-mo-REL-in'],
  ['Sermorelin', 'ser-mo-REL-in'],
  ['Ipamorelin', 'eye-PAM-or-REL-in'],
  ['Semaglutide', 'SEM-uh-GLOO-tide'],
  ['Tirzepatide', 'teer-ZEP-uh-tide'],
  ['Retatrutide', 'reh-TAT-roo-tide'],
  ['AOD-9604', 'A O D 9604'],
  ['GHK-Cu', 'G H K copper'],
  ['BPC-157', 'B P C 157'],
  ['TB-500', 'T B 500'],
  ['PT-141', 'P T 141'],
  ['MOTS-C', 'mots C'],
  ['SS-31', 'S S 31'],
  ['NAD+', 'N A D plus'],
  ['Semax', 'SEE-max'],
  ['Selank', 'SEL-ank'],
  ['KPV', 'K P V'],
];

function extraPronouncePairs(raw) {
  const out = [];
  String(raw || '')
    .split(/\n|\|/)
    .forEach((line) => {
      const m = String(line).match(/^\s*(.+?)\s*=\s*(.+?)\s*$/);
      if (m) out.push([m[1].trim(), m[2].trim()]);
    });
  return out;
}

function applyPronunciation(text) {
  let t = String(text || '');
  const pairs = extraPronouncePairs(row.tts_pronounce).concat(PRONOUNCE);
  pairs.sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of pairs) {
    if (!from || !to) continue;
    const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    t = t.replace(re, to);
  }
  return t;
}

const voiceSpeak = applyPronunciation(voiceOver);

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

const BEAT_IDS = ['a'];
const bodyPool = sheetBodies.length ? sheetBodies : BODY_ACTIONS;
const gesturePool = sheetGestures.length ? sheetGestures : GESTURES;

function bodyById(pool, id) {
  return pool.find((b) => String(b.id).toLowerCase() === id) || BODY_ACTIONS.find((b) => b.id === id);
}

function gestureById(pool, id) {
  return pool.find((g) => String(g.id).toLowerCase() === id) || GESTURES.find((g) => g.id === id);
}

function sceneMotionHint() {
  return [
    sceneBrief,
    motion,
    row.video_prompt,
    row.video_motion_prompt,
    row.hero_style,
  ]
    .map((v) => String(v || '').toLowerCase())
    .join(' ');
}

function pickTalkBody(pool) {
  const hint = sceneMotionHint();
  const walking = bodyById(pool, 'walking');
  const standing = bodyById(pool, 'standing');
  const sitting = bodyById(pool, 'sitting');
  const stopping = bodyById(pool, 'stopping');
  const turning = bodyById(pool, 'turning');
  const pep = hint.match(/\bpep\s+(walks|walking|stands|standing|sits|sitting|turns|turning|stops|stopping)\b/);
  if (pep) {
    const v = pep[1];
    if (/walk/.test(v) && walking) return walking;
    if (/sit/.test(v) && sitting) return sitting;
    if (/stand/.test(v) && walking) return walking; // stand rows walk-and-talk; do not freeze
    if (/turn/.test(v) && turning) return turning;
    if (/stop/.test(v) && (stopping || walking)) return stopping || walking;
  }
  if (/\bsit(?:s|ting)?\b|\bseated\b/.test(hint) && sitting) return sitting;
  if (/\bwalk(?:s|ing)?\b|\bstroll\b/.test(hint) && walking) return walking;
  if (/\bstops?\b|\bstopping\b/.test(hint) && (stopping || walking)) return stopping || walking;
  if (/\bturns?\b|\bturning\b/.test(hint) && turning) return turning;
  if (/\bstand(?:s|ing)?\b/.test(hint) && walking) return walking;
  return walking || standing;
}

function bodyId(body) {
  return String(body?.id || '').toLowerCase();
}

function isWalkingBody(body) {
  return bodyId(body) === 'walking';
}

function isLocomotionBody(body) {
  const id = bodyId(body);
  return id === 'walking' || id === 'stopping' || id === 'turning';
}

function pickTalkGesture(body, pool) {
  if (isLocomotionBody(body)) {
    return gestureById(pool, 'walk_swing') || pickUnique(pool, 1)[0];
  }
  return gestureById(pool, 'hip_rest') || pickUnique(pool, 1)[0];
}

const bodies = [pickTalkBody(bodyPool)];
const gestures = [pickTalkGesture(bodies[0], gesturePool)];
const anglePool = sheetAngles.length
  ? sheetAngles
  : ANGLES.map((label) => ({ id: label, brief: label }));
const angles = pickUnique(anglePool, 1);

const pepLock = [
  'CHARACTER LOCK — use master Pep reference exactly (https://files.catbox.moe/2yfdbi.jpg).',
  'Anthropomorphic clear 10ml sterile injectable-style glass vial,',
  'rubber stopper + silver aluminum crimp seal only (NOT screw-cap, NOT black twist cap),',
  'white mid-body label with the same two cartoon eyes as the master (copy the master eye shape and lash state exactly) and bold type that is exactly 10ml (four characters only: 1, 0, m, l),',
  'white baseball cap with Palm Beach Vitality sunset + palm-tree logo,',
  'gray tube limbs, white cartoon gloves, rounded white sneakers,',
  'mouth open mid-word, clean 3D-cartoon / sticker style with bold outlines.',
  'HARD FAIL: thumbs-up. HARD FAIL: warped eyes. HARD FAIL: inventing extra human lashes the master does not have. HARD FAIL: any letter after 10ml (no 10mlz). No hat-tip freeze. No extra mascots. No humans. No doctor offices. No hospitals.',
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
  const walking = isWalkingBody(body);
  const locomotion = isLocomotionBody(body);
  const sitting = /sit/i.test(String(body.id || ''));
  const handsStill = locomotion
    ? 'HANDS: both white gloves in a natural walk swing at hip height. Neither glove raised. NO thumbs-up. NO pointing. NO counting.'
    : 'HANDS: white gloves relaxed near the hips or hanging naturally. No pointing, no counting, no waving.';
  const feetStill = walking
    ? 'FEET: mid-stride. One sneaker forward, one back. BOTH sneakers touching the ground of this set with contact shadows. HARD FAIL hover.'
    : 'FEET: both white sneakers firmly on the ground of this set. Contact shadows. HARD FAIL hover.';
  const poseStill = [
    body.still,
    handsStill,
    `ANGLE: ${angle}.`,
    feetStill,
    'MOUTH OPEN mid-word (OmniHuman start frame).',
  ].join(' ');
  const poseMotion = walking
    ? `${body.motion}; WALK AND TALK at the same time; gloves swing at hip height; each step plants; ${angle}; talking mouth the whole clip`
    : locomotion
      ? `${body.motion}; keep talking; gloves at hip height; sneakers on the ground; ${angle}; talking mouth the whole clip`
      : `${body.motion}; relaxed gloves near the hips; sneakers stay on the ground; ${angle}; talking mouth the whole clip`;
  const eyeLock = 'EYES: keep the same two cartoon ovals from the still — same size, same round pupils, same catchlights, same lash state as the still from 00:00. Copy the still. Do not invent new lashes. Do not grow lashes after a blink. Eyes SHOULD blink, glance, and look around naturally while he talks. That is good. HARD FAIL: morphing the eye shape, warping or smearing pupils, crossing the eyes, growing human eyelids, or growing new lashes mid-clip. Lashes are OK only if they already exist on this still from the first second. If the still has no lashes, keep zero lashes the whole clip. Mid-clip lash grow-in is the fail.';
  const labelLock = 'LABEL: keep the vial type exactly 10ml. Do not add a letter after the l. Do not change, smear, or animate the type.';
  const omniWalk = [
    'ANIMATE THIS STILL ONLY. The input image is already the correct Pep. Do not redesign the face, eyes, label, hat, or body.',
    'WALK AND TALK AT THE SAME TIME. Palm Beach Pep keeps walking while the mouth on the white 10ml label talks with the audio. Do not freeze standing. The still is a mid-stride start frame — continue the walk from it for the whole clip.',
    eyeLock,
    labelLock,
    'Stay mid-ground, full body visible. Slow natural walk through this exact set. Do not walk out of frame. Camera holds. Keep the same Pep scale.',
    setText + '.',
    'LEGS: continuous walk cycle. Each sneaker plants on the ground with a contact shadow. HARD FAIL: hovering, floating, sliding, moonwalk, walking on air, standing still the whole clip.',
    'ARMS: natural walk swing at hip height, close to the body. Tiny talk motion only. No raised gloves.',
    'HARD FAIL: standing frozen, mid-clip lash grow-in, warped eyes, 10mlz, extra label letters, wild arm swings, rubber-band limbs, pointing, counting fingers, waving, salutes, T-pose, thumbs-up, hat-tip.',
    'Do not change the backdrop. Do not restyle Pep.',
  ];
  const omniMove = [
    'ANIMATE THIS STILL ONLY. The input image is already the correct Pep. Do not redesign the face, eyes, label, hat, or body.',
    'Palm Beach Pep talks with the audio while moving. Mouth on the white 10ml label moves with speech.',
    `BODY: ${body.motion}. Do not freeze standing still. Continue this action from the still.`,
    eyeLock,
    labelLock,
    'Stay mid-ground, full body visible. Stay in this exact set:',
    setText + '.',
    'FEET: sneakers stay in contact with the ground. Each step plants. HARD FAIL: hovering, floating, sliding, moonwalk, walking on air.',
    'ARMS: natural motion at hip height, close to the body. No raised gloves.',
    'HARD FAIL: standing frozen, mid-clip lash grow-in, warped eyes, 10mlz, extra label letters, wild arm swings, rubber-band limbs, pointing, counting fingers, waving, salutes, T-pose, thumbs-up, hat-tip.',
    'Do not change the backdrop. Do not restyle Pep.',
  ];
  const omniStand = [
    'ANIMATE THIS STILL ONLY. The input image is already the correct Pep. Do not redesign the face, eyes, label, hat, or body.',
    'Palm Beach Pep talks with the audio. Mouth on the white 10ml label moves with speech.',
    eyeLock,
    labelLock,
    sitting
      ? 'Stay seated on this set perch. Do not stand up. Stay in this exact set:'
      : 'Talk in place. Stay in this exact set:',
    setText + '.',
    sitting
      ? 'Body motion is small and natural — a little weight shift on the seat, talking the whole clip.'
      : 'Body motion is small and natural only — a little weight shift, a little sway, same standing pose the still already shows.',
    'FEET: sneakers stay on the ground the whole clip. HARD FAIL: hovering, floating, walking on air.',
    'ARMS: relaxed, close to the body, gloves near the hips. Tiny talk motion only.',
    'HARD FAIL: mid-clip lash grow-in, warped eyes, 10mlz, extra label letters, wild arm swings, rubber-band limbs, pointing, counting fingers, waving, salutes, T-pose, thumbs-up, hat-tip.',
    'Do not change the backdrop. Do not restyle Pep.',
  ];
  const omnihuman_prompt = (walking ? omniWalk : locomotion ? omniMove : omniStand).join(' ');
  return { body, gesture, angle, poseStill, poseMotion, omnihuman_prompt };
}

const packs = BEAT_IDS.map((id, i) => packBlocking(bodies[i], gestures[i], angles[i]));
const body = packs[0].body;
const gesture = packs[0].gesture;
const angle = packs[0].angle;
const poseStill = packs[0].poseStill;
const poseMotion = packs[0].poseMotion;

const beatMeta = {
  a: { name: 'talking', window: 'one 50s clip', extra: `${body.id} while talking; ${motion}; preserve Pep identity; no thumbs-up; no new text; no mid-clip lash grow-in` },
};

const beats = {};
for (let i = 0; i < BEAT_IDS.length; i++) {
  const id = BEAT_IDS[i];
  const p = packs[i];
  const meta = beatMeta[id];
  beats[id] = {
    name: meta.name,
    brief: `Scene ${id.toUpperCase()} ${meta.name.toUpperCase()}: Palm Beach Pep mid-ground in this unique set: ${setText}. Blocking this cut: ${p.body.brief}, ${p.gesture.brief || p.gesture.id}. ${p.poseStill} ${pepLock} Product lock: ${compound} (${compoundId}). Lighting: ${lighting}. Grade: ${grade}. Hero: ${hero}. Full environment, not void packshot.`,
    motion: `${p.poseMotion}; ${meta.window}; ${meta.extra}`,
  };
}

const omnihuman_prompt = packs[0].omnihuman_prompt;

const beat_items = BEAT_IDS.map((id, i) => {
  const p = packs[i];
  return {
    beat: id,
    tts_text: voiceOver,
    tts_speak: voiceSpeak,
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

if (beat_items.length !== 1) {
  throw new Error(`Expected 1 talking beat, got ${beat_items.length}.`);
}

return {
  ...row,
  creation_id: row.creation_id || '',
  compound_id: compoundId,
  compound_name: compound,
  pep_ref_url: pepRefUrl,
  target_duration_seconds: 60,
  beat_count: 1,
  pep_body_action: body.id,
  pep_hand_gesture: gesture.id,
  pep_angle: angle,
  pep_body_action_a: packs[0].body.id,
  pep_hand_gesture_a: packs[0].gesture.id,
  blocking_source: blockingSource,
  pose_still: poseStill,
  pose_still_a: packs[0].poseStill,
  pose_motion: poseMotion,
  omnihuman_prompt: omnihuman_prompt,
  omnihuman_prompt_a: packs[0].omnihuman_prompt,
  beat_items: beat_items,
  beat_a_brief: beats.a.brief,
  beat_a_motion: beats.a.motion,
  vo_beat_a: voiceOver,
  tts_text: voiceOver,
  tts_speak: voiceSpeak,
  vo_source: 'sheet',
  voice_over: voiceOver,
  scene_brief: sceneBrief,
  set_text: setText,
  aspect_ratio: '9:16',
  resolution: '720p',
  model_still: 'grok-imagine-image',
  model_video: 'fal-omnihuman-v1.5',
};
