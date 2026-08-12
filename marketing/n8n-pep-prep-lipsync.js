// Node: prep_pep_lipsync (Code)
// Wire: save_video_url → prep_pep_lipsync → pep_lipsync_start
// Also needs save_tts_audio_url upstream on the same execution path
// Mode: Run Once for All Items
// n8n: return plain objects (do NOT wrap in { json: ... })

const videoUrl = String($('save_video_url').item.json.video_url || '');
const audioUrl = String($('save_tts_audio_url').item.json.tts_audio_url || '');

if (!videoUrl) throw new Error('Missing video_url from save_video_url');
if (!audioUrl) throw new Error('Missing tts_audio_url from save_tts_audio_url');

const lipsync_request_body = {
  video_url: videoUrl,
  audio_url: audioUrl,
  sync_mode: 'cut_off',
};

let creation_id = '';
try {
  creation_id = String($('prep_pep_beats').item.json.creation_id || '');
} catch (e) {
  creation_id = '';
}

return [
  {
    creation_id,
    beat: 'a',
    video_url: videoUrl,
    tts_audio_url: audioUrl,
    fal_lipsync_endpoint: 'fal-ai/sync-lipsync/v3',
    fal_lipsync_submit_url: 'https://queue.fal.run/fal-ai/sync-lipsync/v3',
    lipsync_request_body,
    lipsync_request_body_string: JSON.stringify(lipsync_request_body),
  },
];
