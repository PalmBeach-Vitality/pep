// Node: prep_pep_lipsync (Code)
// Wire: save_still_url → prep_pep_lipsync → pep_lipsync_fal
// OmniHuman is image + audio → talking video (not Kling video + audio)
// Audio: fal_upload_tts_initiate.file_url (no save_tts_audio_url on canvas)
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }] — newer n8n errors "A 'json' property isn't an object"

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
  fromNode('save_still_url', ['reel_still_url', 'reel_still_url_a']) ||
  fromNode('grok_imagine_reel_still', ['reel_still_url']) ||
  String($json.reel_still_url || $json.data?.[0]?.url || '');

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

let creation_id = '';
try {
  creation_id = String($('prep_pep_beats').item.json.creation_id || '');
} catch (e) {
  creation_id = '';
}

const omniPrompt = [
  'Palm Beach Pep, anthropomorphic 10ml crimp-seal glass vial mascot,',
  'talking with the audio. Mouth on the white 10ml label moves with speech.',
  'Walk toward camera, slight 3/4, screen-right. Both white gloves in a walk swing at hip height.',
  'No thumbs-up. No hat tip. No planted freeze.',
].join(' ');

return {
  creation_id: creation_id,
  beat: 'a',
  lipsync_image_in: imageUrl,
  lipsync_audio_in: audioUrl,
  reel_still_url: imageUrl,
  tts_audio_url: audioUrl,
  omnihuman_prompt: omniPrompt,
  omnihuman_resolution: '1080p',
  fal_lipsync_endpoint: 'fal-ai/bytedance/omnihuman/v1.5',
};
