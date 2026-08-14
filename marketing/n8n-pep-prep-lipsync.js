// Node: prep_pep_lipsync (Code)
// Wire: save_still_url → prep_pep_lipsync → pep_lipsync_fal
// OmniHuman is image + audio → talking video (not Kling video + audio)
// Audio: fal_upload_tts_initiate.file_url (no save_tts_audio_url on canvas)
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }] — newer n8n errors "A 'json' property isn't an object"
// After split_pep_beats this runs four times. Use paired split item, not hardcoded beat a.

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
  'Palm Beach Pep, anthropomorphic 10ml crimp-seal glass vial mascot,',
  'talking with the audio. Mouth on the white 10ml label moves with speech.',
  'Natural body motion with the audio — walk, sit, stand, or stop as the still shows.',
  'No thumbs-up. No hat-tip freeze.',
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
