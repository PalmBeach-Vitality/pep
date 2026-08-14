// Node: split_pep_beats (Code)
// Wire: prep_pep_beats → split_pep_beats → tts_pep_voice_over
// Mode: Run Once for All Items
// DO return [{ json: ... }, ...] — four items, beats a/b/c/d
// Each item carries its own tts_text + pose_still + omnihuman_prompt.
// Downstream TTS / still / OmniHuman run four times on the same talking path.

const src = $input.first().json || {};
const packs = Array.isArray(src.beat_items) ? src.beat_items : [];
if (packs.length !== 4) {
  throw new Error(
    `split_pep_beats expected 4 beat_items from prep_pep_beats, got ${packs.length}. Re-paste marketing/n8n-pep-prep-beats.js.`
  );
}

const BEATS = ['a', 'b', 'c', 'd'];
return packs.map((pack, i) => {
  const beat = String(pack.beat || BEATS[i] || '').toLowerCase();
  const tts_text = String(pack.tts_text || src[`vo_beat_${beat}`] || '').trim();
  if (!tts_text) {
    throw new Error(`Missing tts_text for beat ${beat}.`);
  }
  if (tts_text.includes("$('") || tts_text.includes('={{')) {
    throw new Error(`tts_text for beat ${beat} looks like an n8n expression, not sheet VO.`);
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
      target_duration_seconds: 15,
      resolution: '1080p',
    },
  };
});
