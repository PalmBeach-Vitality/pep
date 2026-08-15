// Node: gather_pep_clips (Code)
// Wire: loop_pep_beats (done) → gather_pep_clips → sheets_update_creation
// Mode: Run Once for All Items
// One talking clip. Loop runs once, then done.

function jsonOf(it) {
  return it?.json || it || {};
}

function allRuns(name) {
  const out = [];
  for (let run = 0; run < 8; run++) {
    let items;
    try {
      items = $(name).all(0, run);
    } catch (e) {
      break;
    }
    if (!items || !items.length) break;
    for (const it of items) out.push(jsonOf(it));
  }
  if (!out.length) {
    try {
      out.push(...$(name).all().map(jsonOf));
    } catch (e) {}
  }
  return out;
}

function clipUrl(j) {
  return String(j.lipsync_video_url || j.video_url || j.video?.url || '').trim();
}

function stillUrl(j) {
  return String(j.reel_still_url || j.data?.[0]?.url || '').trim();
}

const incoming = $input.all().map(jsonOf);
let clips = allRuns('save_lipsync_video_url').filter((j) => clipUrl(j));
if (!clips.length) {
  const fal = allRuns('pep_lipsync_fal').filter((j) => clipUrl(j));
  if (fal.length) clips = fal;
}
if (!clips.length) {
  clips = incoming.filter((j) => clipUrl(j));
}

const stills = allRuns('save_still_url');
const splits = allRuns('split_pep_beats');

if (clips.length < 1) {
  throw new Error(
    'Expected 1 OmniHuman clip, got 0. Check pep_lipsync_fal / save_lipsync_video_url.'
  );
}

const clip = clips[0];
const url = clipUrl(clip);
if (!url) {
  throw new Error('Missing lipsync URL.');
}
const still = stills[0] || {};
const first = splits[0] || clip;

return [
  {
    json: {
      creation_id: first.creation_id || clip.creation_id || '',
      beat_count: 1,
      resolution: '720p',
      model_video: 'fal-omnihuman-v1.5',
      reel_still_url: stillUrl(clip) || stillUrl(still) || '',
      reel_still_url_a: stillUrl(clip) || stillUrl(still) || '',
      video_url: url,
      lipsync_video_url: url,
      lipsync_video_url_a: url,
      stitch_clip_urls: [url],
      stitch_note: 'One 50s talking clip. Same sheet pitch. Audio is already in the mp4.',
    },
  },
];
