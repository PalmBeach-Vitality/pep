// Node: prep_pep_lipsync (Code)
// After: save_video_url + save_tts_audio_url
// Mode: Run Once for Each Item
// Builds fal sync-lipsync/v3 body

const videoUrl = (() => {
  try {
    return String($('save_video_url').item.json.video_url || '');
  } catch (e) {
    return String($json.video_url || '');
  }
})();

const audioUrl = (() => {
  try {
    return String($('save_tts_audio_url').item.json.tts_audio_url || '');
  } catch (e) {
    return String($json.tts_audio_url || '');
  }
})();

if (!videoUrl) throw new Error('Missing video_url from save_video_url');
if (!audioUrl) {
  throw new Error('Missing public tts_audio_url from save_tts_audio_url (https mp3/wav)');
}

const lipsync_request_body = {
  video_url: videoUrl,
  audio_url: audioUrl,
  sync_mode: 'cut_off',
};

return [{
  json: {
    creation_id: (() => {
      try { return $('prep_pep_beats').item.json.creation_id; } catch (e) { return $json.creation_id || ''; }
    })(),
    beat: 'a',
    video_url: videoUrl,
    tts_audio_url: audioUrl,
    fal_lipsync_endpoint: 'fal-ai/sync-lipsync/v3',
    fal_lipsync_submit_url: 'https://queue.fal.run/fal-ai/sync-lipsync/v3',
    lipsync_request_body,
    lipsync_request_body_string: JSON.stringify(lipsync_request_body),
  }
}];
