// Node: merge_tts_binary (Code)
// Wire: fal_upload_tts_initiate → merge_tts_binary → fal_upload_tts_put
// Mode: Run Once for Each Item
// Do NOT return [{ json: ... }]
// Paired TTS binary for THIS beat. Works with (loop_pep_beats) batch size 1
// and with four items. Do not use .all() zip — a loop makes .all() grow.

const tts = $('tts_pep_voice_over').item;
if (!tts.binary || !tts.binary.data) {
  throw new Error('No binary data on tts_pep_voice_over for this beat');
}

let split = {};
try {
  split = $('split_pep_beats').item.json || {};
} catch (e) {
  split = {};
}

return {
  json: {
    ...split,
    ...$json,
    beat: split.beat || $json.beat || 'a',
    creation_id: split.creation_id || $json.creation_id,
  },
  binary: tts.binary,
};
