// Node: prep_pep_beats (Code)
// After: if_complaince (true)  — EXACT canvas name
// Uses: Prep_day_variant → Limit (EXACT names)
// Mode: Run Once for Each Item
// Builds 4 beat briefs for ~60s Pep breakdown (A hook, B product, C world, D close)

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
const voiceOver = row.voice_over || '';
const pepScript = row.pep_script || '';
const disclaimer = row.disclaimer_short ||
  'For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.';

// Canonical Pep master — default locked URL (override via Prep_day_variant.pep_ref_url if needed)
const PEP_MASTER_DEFAULT = 'https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/palm-beach-pep-scenes-8510/marketing/assets/palm-beach-pep-master.jpg';
const pepRefUrl = String(row.pep_ref_url || PEP_MASTER_DEFAULT).trim();
if (!pepRefUrl) {
  throw new Error('Missing pep_ref_url. Canonical Pep master URL is required.');
}

const pepLock = [
  'CHARACTER LOCK — use master Pep reference exactly (https://files.catbox.moe/2yfdbi.jpg).',
  'Anthropomorphic clear 10mL sterile injectable-style glass vial,',
  'rubber stopper + silver aluminum crimp seal only (NOT screw-cap, NOT black twist cap),',
  'white mid-body label with cheerful cartoon face and bold 10ml text,',
  'white baseball cap with Palm Beach Vitality sunset + palm-tree logo,',
  'gray tube limbs, white cartoon gloves, rounded white sneakers,',
  'mid-stride walking pose toward camera slight 3/4 screen-right, mouth open mid-word, no thumbs-up, clean 3D-cartoon / sticker style with bold outlines.',
  'No humans. No doctor offices. No hospitals.',
].join(' ');

const beats = {
  a: {
    name: 'hook',
    brief: `Beat A HOOK: Palm Beach Pep mid-ground in this unique set: ${surface}. Walking and talking the whole beat — mid-stride in and out for dissolve to Beat B. ${pepLock} Product lock: ${compound} (${compoundId}). Lighting: ${lighting}. Grade: ${grade}. Full environment, not void packshot.`,
    motion: `continuous walking + talking 0–15s; toward camera slight 3/4 screen-right; mid-stride first and last frame; no thumbs-up; no hat tip; no smile hold; camera tracks; ${motion}; preserve Pep identity`,
  },
  b: {
    name: 'product',
    brief: `Beat B PRODUCT: Same set (${surface}). Keep walking and talking — slightly closer on the 10ml label while full scene stays. Mid-stride in from Beat A, mid-stride out to Beat C. No smile hold. ${pepLock} Product lock: ${compound} (${compoundId}). Hero: ${hero}.`,
    motion: 'continue same walk toward camera slight 3/4 screen-right + talking mouth; mid-stride in/out; slow track; preserve Pep identity; no new text',
  },
  c: {
    name: 'world',
    brief: `Beat C WORLD: Same set (${surface}). Keep walking and talking. Stronger environment motion (breeze, light sweep) while Pep stays mid-ground. Mid-stride in from Beat B, mid-stride out to Beat D. ${pepLock} Product lock: ${compound} (${compoundId}). Source scene: ${String(sceneBrief).slice(0, 500)}`,
    motion: 'continue same walk toward camera slight 3/4 screen-right + talking mouth; mid-stride in/out; environment drift; preserve identity',
  },
  d: {
    name: 'close',
    brief: `Beat D CLOSE: Same set (${surface}). Keep walking and talking. Mid-stride in from Beat C. Last second can ease the walk but mouth keeps moving. No thumbs-up freeze. ${pepLock} Product lock: ${compound} (${compoundId}). No new on-screen text.`,
    motion: 'continue same walk toward camera slight 3/4 screen-right + talking mouth; mid-stride in; ease last 1s without planting; preserve Pep identity; no new text',
  },
};

// Simple VO split into 4 segments (single-line sheet scripts)
function splitVoice(vo) {
  const text = String(vo || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return {
      a: `Hey, I'm Palm Beach Pep. Today we're looking at ${compound}.`,
      b: `${compound} is laboratory research material. Clear vial, clear label.`,
      c: `Everything stays in the research space. No treatment claims.`,
      d: `${pepScript || 'Thumbs up from Pep.'} ${disclaimer}`,
    };
  }
  const parts = text.split(/(?<=\.)\s+/).filter(Boolean);
  if (parts.length >= 4) {
    const n = Math.ceil(parts.length / 4);
    return {
      a: parts.slice(0, n).join(' '),
      b: parts.slice(n, n * 2).join(' '),
      c: parts.slice(n * 2, n * 3).join(' '),
      d: parts.slice(n * 3).join(' '),
    };
  }
  const chunk = Math.ceil(text.length / 4);
  return {
    a: text.slice(0, chunk).trim(),
    b: text.slice(chunk, chunk * 2).trim(),
    c: text.slice(chunk * 2, chunk * 3).trim(),
    d: text.slice(chunk * 3).trim(),
  };
}

const vo = splitVoice(voiceOver);
if (!String(vo.d).includes('laboratory research use only')) {
  vo.d = `${vo.d} ${disclaimer}`.trim();
}

return [{
  json: {
    ...row,
    creation_id: row.creation_id || '',
    compound_id: compoundId,
    compound_name: compound,
    pep_ref_url: pepRefUrl,
    target_duration_seconds: 60,
    beat_count: 4,
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
    voice_over: voiceOver,
    pep_script: pepScript,
    disclaimer_short: disclaimer,
    aspect_ratio: '9:16',
    resolution: '1080p',
    model_still: 'grok-imagine-image',
    // Cartoon I2V via fal Kling (ElevenLabs-style models; Flows API not public yet)
    model_video: 'fal-kling-v3-pro-i2v',
  }
}];

