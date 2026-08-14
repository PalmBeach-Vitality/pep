// Node: merge_tts_binary (Code)
// Wire: fal_upload_tts_initiate → merge_tts_binary → fal_upload_tts_put
// Mode: Run Once for All Items
// Zip initiate + TTS binary + split_pep_beats fields by index.
// Do NOT use .first() — that would attach Beat A audio to every beat.

const initiates = $input.all();
const ttsItems = $('tts_pep_voice_over').all();
let splits = [];
try {
  splits = $('split_pep_beats').all();
} catch (e) {
  splits = [];
}

if (initiates.length !== ttsItems.length) {
  throw new Error(
    `TTS/initiate count mismatch: ${ttsItems.length} TTS vs ${initiates.length} initiate`
  );
}

return initiates.map((initiate, i) => {
  const tts = ttsItems[i];
  const split = splits[i] || { json: {} };
  if (!tts.binary || !tts.binary.data) {
    throw new Error(
      `No binary data on tts_pep_voice_over item ${i} (beat ${split.json?.beat || '?'})`
    );
  }
  return {
    json: {
      ...(split.json || {}),
      ...(initiate.json || {}),
      beat: split.json?.beat || initiate.json?.beat || 'a',
      creation_id: split.json?.creation_id || initiate.json?.creation_id,
    },
    binary: tts.binary,
  };
});
