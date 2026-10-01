// Node: split_pep_beats (Code)
// Wire: prep_pep_beats → split_pep_beats → loop_pep_beats
// Mode: Run Once for All Items
// DO return [{ json: ... }] — ONE item. One still, one TTS, one OmniHuman.
// Leave the loop on the canvas. It runs once, then done.

const src = $input.first().json || {};
const packs = Array.isArray(src.beat_items) ? src.beat_items : [];
if (packs.length !== 1) {
  throw new Error(
    `split_pep_beats expected 1 beat_item from prep_pep_beats, got ${packs.length}. Re-paste marketing/n8n-pep-prep-beats.js.`
  );
}

const CTA = 'Visit us at palmbeach-vitality.store.';
const pack = packs[0];
const beat = String(pack.beat || 'a').toLowerCase();
const tts_text = String(pack.tts_text || src.tts_text || '').trim();
if (!tts_text) {
  throw new Error('Missing tts_text.');
}
if (tts_text.includes("$('") || tts_text.includes('={{')) {
  throw new Error('tts_text looks like an n8n expression, not sheet VO.');
}
if (!tts_text.endsWith(CTA)) {
  throw new Error(`tts_text must end with: ${CTA}`);
}
if (!/studies have shown/i.test(tts_text) || !/beneficial to/i.test(tts_text) || !/recent research studies/i.test(tts_text)) {
  throw new Error('tts_text must include the studies-have-shown wellness line.');
}
if (!/backed by a COA/i.test(tts_text) || !/>99%/.test(tts_text) || !/american made/i.test(tts_text)) {
  throw new Error('tts_text must include the COA / American made / >99% purity line before the store CTA.');
}
const wc = tts_text.split(/\s+/).filter(Boolean).length;
if (wc < 65 || wc > 74) {
  throw new Error(`tts_text is ${wc} words. Need 65–74 to fit the 30s 1080p OmniHuman clip.`);
}
const low = tts_text.toLowerCase();
if (
  low.includes("today's unique set") ||
  low.includes('for laboratory research use only') ||
  low.includes('not evaluated by the fda') ||
  low.includes('everything stays in the research') ||
  low.includes('not for human use')
) {
  throw new Error('tts_text still has sheet-list/compliance. Re-paste prep_pep_beats.');
}
const pose_still = String(pack.pose_still || src.pose_still_a || src.pose_still || '').trim();
const omnihuman_prompt = String(
  pack.omnihuman_prompt || src.omnihuman_prompt_a || src.omnihuman_prompt || ''
).trim();
if (!pose_still) {
  throw new Error('Missing pose_still.');
}
if (!omnihuman_prompt) {
  throw new Error('Missing omnihuman_prompt.');
}

return [
  {
    json: {
      ...src,
      beat: beat,
      tts_text: tts_text,
      tts_speak: String(pack.tts_speak || src.tts_speak || tts_text),
      pep_body_action: pack.pep_body_action || src.pep_body_action,
      pep_hand_gesture: pack.pep_hand_gesture || src.pep_hand_gesture,
      pep_angle: pack.pep_angle || src.pep_angle,
      pose_still: pose_still,
      pose_motion: pack.pose_motion || src.pose_motion,
      omnihuman_prompt: omnihuman_prompt,
      beat_brief: pack.beat_brief || src.beat_a_brief,
      beat_motion: pack.beat_motion || src.beat_a_motion,
      target_duration_seconds: 30,
      beat_count: 1,
      resolution: '1080p',
    },
  },
];
