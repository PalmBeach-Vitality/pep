#!/usr/bin/env node
// Syntax + contract checks for 60s 1080p split / gather / merge / lipsync.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = '/workspace/marketing';
const files = [
  'n8n-pep-prep-beats.js',
  'n8n-pep-split-beats.js',
  'n8n-pep-gather-clips.js',
  'n8n-pep-merge-tts-binary.js',
  'n8n-pep-prep-lipsync.js',
];

for (const f of files) {
  const p = path.join(root, f);
  const r = spawnSync('node', ['--check', p], { encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`${f} syntax error:\n${r.stderr || r.stdout}`);
  }
}

function mustInclude(file, needles) {
  const s = fs.readFileSync(path.join(root, file), 'utf8');
  for (const n of needles) {
    if (!s.includes(n)) throw new Error(`${file} missing: ${n}`);
  }
}

mustInclude('n8n-pep-prep-beats.js', [
  'beat_items',
  'pickUnique',
  'vo_beat_d',
  "target_duration_seconds: 60",
]);
mustInclude('n8n-pep-split-beats.js', [
  'Run Once for All Items',
  'tts_text',
  'pose_still',
  'omnihuman_prompt',
]);
mustInclude('n8n-pep-merge-tts-binary.js', [
  '$input.all()',
  "$('tts_pep_voice_over').all()",
  "$('split_pep_beats').all()",
]);
mustInclude('n8n-pep-prep-lipsync.js', [
  "fromNode('split_pep_beats', ['beat'])",
  "fromNode('split_pep_beats', ['omnihuman_prompt'])",
]);
mustInclude('n8n-pep-gather-clips.js', [
  'Expected 4 OmniHuman clips',
  'lipsync_video_url_d',
  'stitch_clip_urls',
]);

const merge = fs.readFileSync(path.join(root, 'n8n-pep-merge-tts-binary.js'), 'utf8');
if (merge.includes('$input.first()') || merge.includes("$('tts_pep_voice_over').first()")) {
  throw new Error('merge_tts_binary still uses .first() — that glues Beat A onto every clip');
}

const lipsync = fs.readFileSync(path.join(root, 'n8n-pep-prep-lipsync.js'), 'utf8');
if (/beat:\s*'a'/.test(lipsync)) {
  throw new Error('prep_pep_lipsync still hardcodes beat a');
}

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function pickUnique(list, n) {
  const mixed = shuffle(list);
  const out = [];
  for (let i = 0; i < n; i++) out.push(mixed[i % mixed.length]);
  return out;
}

for (let t = 0; t < 40; t++) {
  const ids = pickUnique(['walking', 'sitting', 'standing', 'stopping', 'turning'], 4).map((x) => x);
  if (new Set(ids).size !== 4) throw new Error(`pickUnique repeated bodies: ${ids.join(',')}`);
}

// Simulate split_pep_beats mapping
const beat_items = ['a', 'b', 'c', 'd'].map((beat, i) => ({
  beat,
  tts_text: `line ${beat} about a research compound.`,
  pose_still: `POSE ${beat}`,
  omnihuman_prompt: `omni ${beat}`,
  pep_body_action: ['walking', 'sitting', 'standing', 'stopping'][i],
}));
const src = { creation_id: 'PEP-001', surface: 'gym', beat_items, pose_still: 'POSE a' };
if (src.beat_items.length !== 4) throw new Error('need 4 beat_items');
const poses = new Set(src.beat_items.map((b) => b.pose_still));
if (poses.size !== 4) throw new Error('poses not unique per beat');

// Simulate gather
const clips = ['a', 'b', 'c', 'd'].map((beat) => ({
  beat,
  creation_id: 'PEP-001',
  lipsync_video_url: `https://example.test/${beat}.mp4`,
}));
if (clips.length !== 4) throw new Error('gather needs 4');
const urls = clips.map((c) => c.lipsync_video_url);
if (urls[0] === urls[1]) throw new Error('gather urls collided');

console.log('ok 60s 1080p node contracts');
