// Node: prep_pep_lipsync (Code)
// Wire: save_still_url → prep_pep_lipsync → pep_lipsync_fal
// OmniHuman is image + audio → talking video (not Kling video + audio)
// Audio: fal_upload_tts_initiate.file_url (no save_tts_audio_url on canvas)
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }] — newer n8n errors "A 'json' property isn't an object"
// One talking clip. Use the paired split item, not a hardcoded beat.

function fromNode(name, keys) {
  try {
    const j = $(name).item.json;
    for (const k of keys) {
      const v = j?.[k];
      if (v) return String(v);
    }
  } catch (e) {}
  return '';
}

const imageUrl =
  String($json.reel_still_url || $json.data?.[0]?.url || '') ||
  fromNode('save_still_url', ['reel_still_url', 'reel_still_url_a']) ||
  fromNode('grok_imagine_reel_still', ['reel_still_url']);

const audioUrl =
  fromNode('fal_upload_tts_initiate', ['file_url', 'tts_audio_url']) ||
  String($json.tts_audio_url || $json.file_url || '');

if (!imageUrl) {
  throw new Error('Missing Pep still URL. Expected save_still_url.reel_still_url');
}
if (!audioUrl) {
  throw new Error('Missing TTS audio URL. Expected fal_upload_tts_initiate.file_url');
}
if (/catbox\.moe/i.test(audioUrl)) {
  throw new Error('TTS audio is Catbox — fal cannot fetch files.catbox.moe.');
}
if (/catbox\.moe/i.test(imageUrl)) {
  throw new Error('Still is Catbox — fal OmniHuman may not fetch files.catbox.moe. Use the xAI still URL.');
}

const beat =
  fromNode('split_pep_beats', ['beat']) ||
  String($json.beat || '') ||
  'a';

const creation_id =
  fromNode('split_pep_beats', ['creation_id']) ||
  fromNode('prep_pep_beats', ['creation_id']) ||
  String($json.creation_id || '');

const omniFromBeats =
  fromNode('split_pep_beats', ['omnihuman_prompt']) ||
  fromNode('prep_pep_beats', ['omnihuman_prompt']);

const omniPrompt = omniFromBeats || [
  'ANIMATE THIS STILL ONLY. The input image is already the correct Pep. Do not redesign the face, eyes, label, hat, or body.',
  'Palm Beach Pep talks with the audio. Mouth on the white 10ml label moves with speech.',
  'EYES: keep the same two cartoon ovals from the still — same size, same round pupils, same catchlights, same lash state as the still from 00:00. Copy the still. Do not invent new lashes. Do not grow lashes after a blink. Eyes SHOULD blink, glance, and look around naturally while he talks. That is good. HARD FAIL: morphing the eye shape, warping or smearing pupils, crossing the eyes, growing human eyelids, or growing new lashes mid-clip. Lashes are OK only if they already exist on this still from the first second. If the still has no lashes, keep zero lashes the whole clip. Mid-clip lash grow-in is the fail.',
  'LABEL: keep the vial type exactly 10ml. Do not add a letter after the l. Do not change, smear, or animate the type.',
  'If the still is mid-stride, WALK AND TALK AT THE SAME TIME — continue the walk, do not freeze standing. If the still is standing or sitting, talk in that pose.',
  'Stay mid-ground, full body visible, same backdrop.',
  'FEET: sneakers stay on the ground. Each walk step plants. HARD FAIL hover.',
  'ARMS: walk swing at hip height if walking, otherwise relaxed near the hips. Tiny talk motion only.',
  'HARD FAIL: mid-clip lash grow-in, warped eyes, 10mlz, extra label letters, wild arm swings, rubber-band limbs, pointing, counting, waving, thumbs-up, hat-tip.',
  'Do not restyle Pep.',
].join(' ');

return {
  creation_id: creation_id,
  beat: beat,
  lipsync_image_in: imageUrl,
  lipsync_audio_in: audioUrl,
  reel_still_url: imageUrl,
  tts_audio_url: audioUrl,
  omnihuman_prompt: omniPrompt,
  omnihuman_resolution: '720p',
  fal_lipsync_endpoint: 'fal-ai/bytedance/omnihuman/v1.5',
};
