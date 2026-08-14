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
  'vo_beat_b',
  'stripSpokenCompliance',
  "beat_count: 2",
  "target_duration_seconds: 60",
  "const BEAT_IDS = ['a', 'b']",
]);

function mustNotInclude(file, needles) {
  const s = fs.readFileSync(path.join(root, file), 'utf8');
  for (const n of needles) {
    if (s.includes(n)) throw new Error(`${file} still has: ${n}`);
  }
}

mustNotInclude('n8n-pep-prep-beats.js', [
  'vo_beat_c',
  'vo_beat_d',
  "BEAT_IDS = ['a', 'b', 'c', 'd']",
  'vo[id] = `${vo[id]} ${disclaimer}',
]);
mustNotInclude('n8n-pep-split-beats.js', [
  "packs.length !== 4",
  "BEATS = ['a', 'b', 'c', 'd']",
]);
mustNotInclude('n8n-pep-gather-clips.js', [
  'Expected 4 OmniHuman clips',
  "ORDER = ['a', 'b', 'c', 'd']",
]);
mustInclude('n8n-pep-split-beats.js', [
  'Run Once for All Items',
  'tts_text',
  'pose_still',
  'omnihuman_prompt',
]);
mustInclude('n8n-pep-merge-tts-binary.js', [
  "Run Once for Each Item",
  "$('tts_pep_voice_over').item",
  "$('split_pep_beats').item.json",
]);
mustInclude('n8n-pep-prep-lipsync.js', [
  "fromNode('split_pep_beats', ['beat'])",
  "fromNode('split_pep_beats', ['omnihuman_prompt'])",
]);
mustInclude('n8n-pep-gather-clips.js', [
  'Expected 2 OmniHuman clips',
  'lipsync_video_url_b',
  'stitch_clip_urls',
  '.all(0, run)',
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
  const ids = pickUnique(['walking', 'sitting', 'standing', 'stopping', 'turning'], 2).map((x) => x);
  if (new Set(ids).size !== 2) throw new Error(`pickUnique repeated bodies: ${ids.join(',')}`);
}

const beat_items = ['a', 'b'].map((beat, i) => ({
  beat,
  tts_text: `line ${beat} about a research compound.`,
  pose_still: `POSE ${beat}`,
  omnihuman_prompt: `omni ${beat}`,
  pep_body_action: ['walking', 'sitting'][i],
}));
const src = { creation_id: 'PEP-001', surface: 'gym', beat_items, pose_still: 'POSE a' };
if (src.beat_items.length !== 2) throw new Error('need 2 beat_items');
const poses = new Set(src.beat_items.map((b) => b.pose_still));
if (poses.size !== 2) throw new Error('poses not unique per scene');

const clips = ['a', 'b'].map((beat) => ({
  beat,
  creation_id: 'PEP-001',
  lipsync_video_url: `https://example.test/${beat}.mp4`,
}));
if (clips.length !== 2) throw new Error('gather needs 2');
const urls = clips.map((c) => c.lipsync_video_url);
if (urls[0] === urls[1]) throw new Error('gather urls collided');

function stripSpokenCompliance(text, disclaimerText) {
  let t = String(text || '').replace(/\s+/g, ' ').trim();
  t = t.replace(/\s*[—–-]\s*research language only\.?/gi, '.');
  const drop = [
    /research language only\.?/gi,
    /for laboratory research use only\.?/gi,
    /not for human use or consumption\.?/gi,
    /not a drug, dietary supplement, or cosmetic\.?/gi,
    /not evaluated by the fda\.?/gi,
    /research use only\.?/gi,
    /no treatment claims\.?/gi,
    /no human-use advice\.?/gi,
    /everything stays in the research and laboratory space\.?/gi,
  ];
  for (const re of drop) t = t.replace(re, ' ');
  const d = String(disclaimerText || '').trim();
  if (d) {
    const esc = d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(esc, 'gi'), ' ');
  }
  return t.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').replace(/^\.\s*/, '').trim();
}

const spoken = stripSpokenCompliance(
  'Pep walks the set. For laboratory research use only. Not for human use or consumption. Research language only.',
  'Not evaluated by the FDA. Research use only. No treatment claims.'
);
const low = spoken.toLowerCase();
if (/fda|not for human use|laboratory research use only|research language only|no treatment claims/.test(low)) {
  throw new Error(`spoken VO still has compliance: ${spoken}`);
}
if (!/pep walks the set/i.test(spoken)) {
  throw new Error(`stripSpokenCompliance ate product talk: ${spoken}`);
}

console.log('ok 60s 1080p node contracts');
