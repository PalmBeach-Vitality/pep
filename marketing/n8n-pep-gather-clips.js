// Node: gather_pep_clips (Code)
// Wire: loop_pep_beats (done) → gather_pep_clips → sheets_update_creation
// Mode: Run Once for All Items
// Loop Over Items only keeps the LAST beat on $input / .all().
// Pull every runIndex of save_lipsync_video_url (and fal fallback).

function jsonOf(it) {
  return it?.json || it || {};
}

function allRuns(name) {
  const out = [];
  for (let run = 0; run < 16; run++) {
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

const ORDER = ['a', 'b', 'c', 'd'];
const incoming = $input.all().map(jsonOf);
let clips = allRuns('save_lipsync_video_url').filter((j) => clipUrl(j));
if (clips.length < 4) {
  const fal = allRuns('pep_lipsync_fal').filter((j) => clipUrl(j));
  if (fal.length > clips.length) clips = fal;
}
if (clips.length < 4) {
  const fromIn = incoming.filter((j) => clipUrl(j));
  if (fromIn.length > clips.length) clips = fromIn;
}

const stills = allRuns('save_still_url');
const splits = allRuns('split_pep_beats');

if (clips.length < 4) {
  throw new Error(
    `Expected 4 OmniHuman clips, got ${clips.length}. Loop ran, but gather only saw the last beat — re-paste gather_pep_clips from marketing/n8n-pep-gather-clips.js.`
  );
}

function byBeat(items) {
  const m = {};
  items.forEach((j, i) => {
    const b = String(j.beat || '').toLowerCase();
    if (b && !m[b]) m[b] = j;
    else if (!b && ORDER[i] && !m[ORDER[i]]) m[ORDER[i]] = j;
  });
  return m;
}

const clipBy = byBeat(clips);
const stillBy = byBeat(stills);
const urls = [];
const stillUrls = [];

for (let i = 0; i < ORDER.length; i++) {
  const b = ORDER[i];
  const clip = clipBy[b] || clips[i] || {};
  const url = clipUrl(clip);
  if (!url) {
    throw new Error(`Missing lipsync URL for beat ${b}.`);
  }
  urls.push(url);
  const still = stillBy[b] || stills[i] || {};
  stillUrls.push(stillUrl(clip) || stillUrl(still));
}

const first = clipBy.a || splits[0] || clips[0] || {};

return [
  {
    json: {
      creation_id: first.creation_id || clips[0].creation_id || '',
      beat_count: 4,
      resolution: '1080p',
      model_video: 'fal-omnihuman-v1.5',
      reel_still_url: stillUrls[0] || '',
      reel_still_url_a: stillUrls[0] || '',
      reel_still_url_b: stillUrls[1] || '',
      reel_still_url_c: stillUrls[2] || '',
      reel_still_url_d: stillUrls[3] || '',
      video_url: urls[0],
      lipsync_video_url: urls[0],
      lipsync_video_url_a: urls[0],
      lipsync_video_url_b: urls[1],
      lipsync_video_url_c: urls[2],
      lipsync_video_url_d: urls[3],
      stitch_clip_urls: urls,
      stitch_note:
        'CapCut: A then B then C then D (9:16). Cross Dissolve 8–12 frames at each join. See marketing/n8n-pep-stitch-notes.md',
    },
  },
];
