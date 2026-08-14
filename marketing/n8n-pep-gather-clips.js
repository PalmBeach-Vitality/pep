// Node: gather_pep_clips (Code)
// Wire: loop_pep_beats (done) → gather_pep_clips → sheets_update_creation
// Fallback wire: save_lipsync_video_url → gather_pep_clips (only if no loop)
// Mode: Run Once for All Items
// CapCut URLs live on this OUTPUT (sheet has one video_url column — Beat A).

function allFrom(name) {
  try {
    return $(name).all().map((it) => it.json || {});
  } catch (e) {
    return [];
  }
}

const incoming = $input.all().map((it) => it.json || {});
let clips = incoming.filter((j) => j.lipsync_video_url || j.video_url);
if (clips.length !== 4) {
  clips = allFrom('save_lipsync_video_url');
}

const stills = allFrom('save_still_url');
const splits = allFrom('split_pep_beats');
const ORDER = ['a', 'b', 'c', 'd'];

if (clips.length !== 4) {
  throw new Error(
    `Expected 4 OmniHuman clips, got ${clips.length}. Do not write the sheet until all 4 beats finish.`
  );
}

function byBeat(items) {
  const m = {};
  items.forEach((j, i) => {
    const b = String(j.beat || ORDER[i] || '').toLowerCase();
    if (b) m[b] = j;
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
  const url = String(clip.lipsync_video_url || clip.video_url || '').trim();
  if (!url) {
    throw new Error(`Missing lipsync URL for beat ${b}.`);
  }
  urls.push(url);
  const still = stillBy[b] || stills[i] || {};
  stillUrls.push(
    String(clip.reel_still_url || still.reel_still_url || still.data?.[0]?.url || '').trim()
  );
}

const first = clips.find((c) => String(c.beat).toLowerCase() === 'a') || splits[0] || clips[0] || {};

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
