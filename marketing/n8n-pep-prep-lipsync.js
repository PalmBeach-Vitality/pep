// Node: prep_pep_lipsync (Code)
// Wire: save_video_url → prep_pep_lipsync → fal_lipsync_call
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

const videoUrl = fromNode('save_video_url', ['video_url']) || String($json.video_url || '');
const audioUrl =
  fromNode('fal_upload_tts_initiate', ['file_url', 'tts_audio_url']) ||
  String($json.tts_audio_url || $json.file_url || '');

if (!videoUrl) throw new Error('Missing video_url from save_video_url');
if (!audioUrl) {
  throw new Error(
    'Missing TTS audio URL. Expected fal_upload_tts_initiate.file_url'
  );
}
if (/catbox\.moe/i.test(audioUrl)) {
  throw new Error('TTS audio is Catbox — fal cannot fetch files.catbox.moe.');
}

let creation_id = '';
try {
  creation_id = String($('prep_pep_beats').item.json.creation_id || '');
} catch (e) {
  creation_id = '';
}

const bodyString = JSON.stringify({
  video_url: videoUrl,
  audio_url: audioUrl,
  sync_mode: 'cut_off',
});

return {
  creation_id: creation_id,
  beat: 'a',
  video_url: videoUrl,
  tts_audio_url: audioUrl,
  fal_lipsync_endpoint: 'fal-ai/sync-lipsync/v3',
  fal_lipsync_submit_url: 'https://queue.fal.run/fal-ai/sync-lipsync/v3',
  lipsync_video_in: videoUrl,
  lipsync_audio_in: audioUrl,
  lipsync_sync_mode: 'cut_off',
  lipsync_request_body_string: bodyString,
};
