// Node: gather_pep_clips (Code)
// Mode: Run Once for All Items
// Select all, delete, paste this whole file. Do not paste under old JS.

function jsonOf(it) {
  return (it && it.json) || it || {};
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
      out.push.apply(out, $(name).all().map(jsonOf));
    } catch (e) {}
  }
  return out;
}

function clipUrl(j) {
  if (!j) return '';
  if (j.lipsync_video_url) return String(j.lipsync_video_url).trim();
  if (j.video_url) return String(j.video_url).trim();
  if (j.video && j.video.url) return String(j.video.url).trim();
  return '';
}

function stillUrl(j) {
  if (!j) return '';
  if (j.reel_still_url) return String(j.reel_still_url).trim();
  if (j.data && j.data[0] && j.data[0].url) return String(j.data[0].url).trim();
  return '';
}

const fromSave = allRuns('save_lipsync_video_url').filter(function (j) {
  return clipUrl(j);
});
const fromFal = allRuns('pep_lipsync_fal').filter(function (j) {
  return clipUrl(j);
});
const fromIn = $input.all().map(jsonOf).filter(function (j) {
  return clipUrl(j);
});
const clips = fromSave.length ? fromSave : fromFal.length ? fromFal : fromIn;

if (!clips.length) {
  throw new Error('Expected 1 OmniHuman clip, got 0. Check pep_lipsync_fal and save_lipsync_video_url.');
}

const clip = clips[0];
const url = clipUrl(clip);
if (!url) {
  throw new Error('Missing lipsync URL.');
}

const still = allRuns('save_still_url')[0] || {};
const first = allRuns('split_pep_beats')[0] || clip;
const stillFinal = stillUrl(clip) || stillUrl(still);

return [
  {
    json: {
      creation_id: first.creation_id || clip.creation_id || '',
      beat_count: 1,
      resolution: '1080p',
      model_video: 'fal-omnihuman-v1.5',
      reel_still_url: stillFinal,
      reel_still_url_a: stillFinal,
      video_url: url,
      lipsync_video_url: url,
      lipsync_video_url_a: url,
      stitch_clip_urls: [url],
      stitch_note: 'One 30s talking clip at 1080p. Same sheet pitch. Audio is already in the mp4.',
    },
  },
];
