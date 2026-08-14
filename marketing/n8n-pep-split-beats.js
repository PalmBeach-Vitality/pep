// Node: split_pep_beats (Code)
// Wire: prep_pep_beats → split_pep_beats → loop_pep_beats
// Mode: Run Once for All Items
// DO return [{ json: ... }, ...] — four items, scenes a/b/c/d
// Unique pose per item. SAME product sales pitch on every item.
// Downstream TTS / still / OmniHuman run four times on the same talking path.

const src = $input.first().json || {};
const packs = Array.isArray(src.beat_items) ? src.beat_items : [];
if (packs.length !== 4) {
  throw new Error(
    `split_pep_beats expected 4 beat_items from prep_pep_beats, got ${packs.length}. Re-paste marketing/n8n-pep-prep-beats.js.`
  );
}

const CTA = 'Visit us at palmbeach-vitality.store.';
const BEATS = ['a', 'b', 'c', 'd'];
const pitch0 = String(packs[0].tts_text || src.tts_text || '').trim();

return packs.map((pack, i) => {
  const beat = String(pack.beat || BEATS[i] || '').toLowerCase();
  const tts_text = String(pack.tts_text || src.tts_text || pitch0 || '').trim();
  if (!tts_text) {
    throw new Error(`Missing tts_text for beat ${beat}.`);
  }
  if (tts_text.includes("$('") || tts_text.includes('={{')) {
    throw new Error(`tts_text for beat ${beat} looks like an n8n expression, not sheet VO.`);
  }
  if (tts_text !== pitch0) {
    throw new Error(`Beat ${beat} tts_text must be the same product pitch as beat a. Do not slice sheet-list copy.`);
  }
  if (!tts_text.endsWith(CTA)) {
    throw new Error(`tts_text must end with: ${CTA}`);
  }
  const seen = new Set();
  for (const w of tts_text.split(/\s+/).filter(Boolean)) {
    const k = w.replace(/[.,!?;:"'()[\]{}]/g, '').replace(/[—–]/g, '').toLowerCase();
    if (!k) continue;
    if (seen.has(k)) {
      throw new Error(`tts_text repeats the word "${k}". Not one word may repeat.`);
    }
    seen.add(k);
  }
  const wc = tts_text.split(/\s+/).filter(Boolean).length;
  if (wc < 142 || wc > 150) {
    throw new Error(`tts_text is ${wc} words. Need 142–150 for 55–60s.`);
  }
  const low = tts_text.toLowerCase();
  if (
    low.includes("today's unique set") ||
    low.includes('for laboratory research use only') ||
    low.includes('not evaluated by the fda') ||
    low.includes('everything stays in the research') ||
    low.includes('not for human use')
  ) {
    throw new Error(`Beat ${beat} tts_text still has sheet-list/compliance. Re-paste prep_pep_beats.`);
  }
  const pose_still = String(pack.pose_still || src[`pose_still_${beat}`] || src.pose_still || '').trim();
  const omnihuman_prompt = String(
    pack.omnihuman_prompt || src[`omnihuman_prompt_${beat}`] || src.omnihuman_prompt || ''
  ).trim();
  if (!pose_still) {
    throw new Error(`Missing pose_still for beat ${beat}.`);
  }
  if (!omnihuman_prompt) {
    throw new Error(`Missing omnihuman_prompt for beat ${beat}.`);
  }
  return {
    json: {
      ...src,
      beat: beat,
      tts_text: tts_text,
      pep_body_action: pack.pep_body_action || src[`pep_body_action_${beat}`] || src.pep_body_action,
      pep_hand_gesture: pack.pep_hand_gesture || src[`pep_hand_gesture_${beat}`] || src.pep_hand_gesture,
      pep_angle: pack.pep_angle || src.pep_angle,
      pose_still: pose_still,
      pose_motion: pack.pose_motion || src.pose_motion,
      omnihuman_prompt: omnihuman_prompt,
      beat_brief: pack.beat_brief || src[`beat_${beat}_brief`],
      beat_motion: pack.beat_motion || src[`beat_${beat}_motion`],
      target_duration_seconds: 60,
      resolution: '720p',
    },
  };
});
