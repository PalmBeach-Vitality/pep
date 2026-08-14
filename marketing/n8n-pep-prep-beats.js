// Node: prep_pep_beats (Code)
// After: if_complaince (true)  — EXACT canvas name
// Uses: Prep_day_variant → Limit (EXACT names)
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }]
// Each run picks a random body action + hand gesture so Pep is not
// the same mid-stride walk every video. Thumbs-up is never allowed.
// Spoken lines come from tab 150-pb-pep-scenes column voice_over only.
// Do not hardcode VO. "research language only" is caption-only.

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

// Caption-only phrase. Never speak it. Source of truth is the sheet column after re-import.
const voiceOver = voiceOverRaw
  .replace(/\s*[—–-]\s*research language only\.?/gi, '.')
  .replace(/\bresearch language only\.?/gi, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/\s+\./g, '.')
  .trim();
const pepScript = String(row.pep_script || '').trim();
const disclaimer = String(row.disclaimer_short || '').trim();

const PEP_MASTER_DEFAULT = 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/assets/palm-beach-pep-master.jpg';
const pepRefUrl = String(row.pep_ref_url || PEP_MASTER_DEFAULT).trim();
if (!pepRefUrl) {
  throw new Error('Missing pep_ref_url. Canonical Pep master URL is required.');
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
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

const body = pick(sheetBodies.length ? sheetBodies : BODY_ACTIONS);
const gesture = pick(sheetGestures.length ? sheetGestures : GESTURES);
const angleRow = sheetAngles.length ? pick(sheetAngles) : null;
const angle = angleRow ? String(angleRow.id || angleRow.brief || ANGLES[0]) : pick(ANGLES);

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

const poseStill = [body.still, gesture.still, `ANGLE: ${angle}.`, 'MOUTH OPEN mid-word (OmniHuman start frame).'].join(' ');
const poseMotion = `${body.motion}; ${gesture.motion}; ${angle}; talking mouth the whole clip`;

const beats = {
  a: {
    name: 'hook',
    brief: `Beat A HOOK: Palm Beach Pep mid-ground in this unique set: ${surface}. Blocking this run: ${body.brief}, ${gesture.id.replace(/_/g, ' ')}. ${poseStill} ${pepLock} Product lock: ${compound} (${compoundId}). Lighting: ${lighting}. Grade: ${grade}. Full environment, not void packshot.`,
    motion: `${poseMotion}; 0–15s; ${motion}; preserve Pep identity; no thumbs-up; no new text`,
  },
  b: {
    name: 'product',
    brief: `Beat B PRODUCT: Same set (${surface}). Keep ${body.brief} and talking — slightly closer on the 10ml label while full scene stays. ${pepLock} Product lock: ${compound} (${compoundId}). Hero: ${hero}.`,
    motion: `continue ${poseMotion}; slow track in on label; preserve Pep identity; no thumbs-up; no new text`,
  },
  c: {
    name: 'world',
    brief: `Beat C WORLD: Same set (${surface}). Keep ${body.brief} and talking. Stronger environment motion while Pep stays mid-ground. ${pepLock} Product lock: ${compound} (${compoundId}). Source scene: ${String(sceneBrief).slice(0, 400)}`,
    motion: `continue ${poseMotion}; environment drift; preserve identity; no thumbs-up`,
  },
  d: {
    name: 'close',
    brief: `Beat D CLOSE: Same set (${surface}). Keep ${body.brief} and talking. Mouth keeps moving. ${pepLock} Product lock: ${compound} (${compoundId}). No new on-screen text.`,
    motion: `continue ${poseMotion}; ease last 1s; preserve Pep identity; no thumbs-up; no new text`,
  },
};

function clipSheetVoice(text, maxWords) {
  const sentences = String(text || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  const out = [];
  let words = 0;
  for (const s of sentences) {
    const n = s.split(/\s+/).filter(Boolean).length;
    if (out.length && words + n > maxWords) break;
    out.push(s);
    words += n;
    if (words >= Math.max(24, maxWords - 10)) break;
  }
  return (out.join(' ') || String(text).split(/\s+/).slice(0, maxWords).join(' ')).trim();
}

function splitVoice(text) {
  const a = clipSheetVoice(text, 42);
  const rest = text.startsWith(a) ? text.slice(a.length).trim() : text;
  const parts = rest.split(/(?<=\.)\s+/).filter(Boolean);
  if (parts.length >= 3) {
    const n = Math.ceil(parts.length / 3);
    return {
      a,
      b: parts.slice(0, n).join(' '),
      c: parts.slice(n, n * 2).join(' '),
      d: parts.slice(n * 2).join(' '),
    };
  }
  const chunk = Math.max(1, Math.ceil(rest.length / 3));
  return {
    a,
    b: rest.slice(0, chunk).trim(),
    c: rest.slice(chunk, chunk * 2).trim(),
    d: rest.slice(chunk * 2).trim(),
  };
}

const vo = splitVoice(voiceOver);
if (disclaimer && !String(vo.d).includes('laboratory research use only')) {
  vo.d = `${vo.d} ${disclaimer}`.trim();
}

const omnihuman_prompt = [
  'Palm Beach Pep, anthropomorphic 10ml crimp-seal glass vial mascot,',
  'talking with the audio. Mouth on the white 10ml label moves with speech.',
  (body.omni || body.motion) + '.',
  (gesture.omni || gesture.motion) + '.',
  angle + '.',
  'No thumbs-up. No hat-tip freeze.',
].join(' ');

return {
  ...row,
  creation_id: row.creation_id || '',
  compound_id: compoundId,
  compound_name: compound,
  pep_ref_url: pepRefUrl,
  target_duration_seconds: 15,
  beat_count: 4,
  pep_body_action: body.id,
  pep_hand_gesture: gesture.id,
  pep_angle: angle,
  blocking_source: blockingSource,
  pose_still: poseStill,
  pose_motion: poseMotion,
  omnihuman_prompt: omnihuman_prompt,
  beat_a_brief: beats.a.brief,
  beat_b_brief: beats.b.brief,
  beat_c_brief: beats.c.brief,
  beat_d_brief: beats.d.brief,
  beat_a_motion: beats.a.motion,
  beat_b_motion: beats.b.motion,
  beat_c_motion: beats.c.motion,
  beat_d_motion: beats.d.motion,
  vo_beat_a: vo.a,
  vo_beat_b: vo.b,
  vo_beat_c: vo.c,
  vo_beat_d: vo.d,
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
