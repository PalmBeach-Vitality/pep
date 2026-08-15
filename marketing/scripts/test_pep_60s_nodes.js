#!/usr/bin/env node
// Syntax + contract checks for one 50s talking clip.

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

function mustNotInclude(file, needles) {
  const s = fs.readFileSync(path.join(root, file), 'utf8');
  for (const n of needles) {
    if (s.includes(n)) throw new Error(`${file} still has: ${n}`);
  }
}

mustInclude('n8n-pep-prep-beats.js', [
  'beat_items',
  'pickUnique',
  'extractProductPitch',
  'studies have shown',
  'Visit us at palmbeach-vitality.store.',
  'beat_count: 1',
  "const BEAT_IDS = ['a']",
  "resolution: '720p'",
  'ARMS: relaxed',
  'cleanSetText',
  'BOTH sneakers firmly on the ground',
  'EYES: keep the same two cartoon ovals from the still',
  'Eyes SHOULD blink, glance, and look around naturally',
  'ANIMATE THIS STILL ONLY',
  'LABEL: keep the vial type exactly 10ml',
  'NO eyelashes',
]);
mustNotInclude('n8n-pep-prep-beats.js', [
  'function splitVoice',
  '1080p audio must stay under 75',
  "const BEAT_IDS = ['a', 'b', 'c', 'd']",
  'beat_count: 4',
]);
mustInclude('n8n-pep-split-beats.js', [
  'Run Once for All Items',
  'tts_text',
  'pose_still',
  'omnihuman_prompt',
  'Visit us at palmbeach-vitality.store.',
  'packs.length !== 1',
  'studies have shown',
  "resolution: '720p'",
]);
mustInclude('n8n-pep-gather-clips.js', [
  'Expected 1 OmniHuman clip',
  'lipsync_video_url_a',
  'stitch_clip_urls',
  '.all(0, run)',
  "resolution: '720p'",
  'beat_count: 1',
]);
mustNotInclude('n8n-pep-gather-clips.js', [
  'Expected 4 OmniHuman clips',
  'lipsync_video_url_d',
]);
mustInclude('n8n-pep-merge-tts-binary.js', [
  'Run Once for Each Item',
  "$('tts_pep_voice_over').item",
  "$('split_pep_beats').item.json",
]);
mustInclude('n8n-pep-prep-lipsync.js', [
  "fromNode('split_pep_beats', ['beat'])",
  "fromNode('split_pep_beats', ['omnihuman_prompt'])",
  "omnihuman_resolution: '720p'",
  'ARMS: relaxed',
  'EYES: keep the same two cartoon ovals from the still',
  'Eyes SHOULD blink, glance, and look around naturally',
  'ANIMATE THIS STILL ONLY',
  'LABEL: keep the vial type exactly 10ml',
  'NO eyelashes',
]);
mustInclude('n8n-pep-grok-still-body-lock.txt', [
  'Scene brief:',
  'Arms stay relaxed and natural',
  'CRITICAL #4 — FEET',
  'CRITICAL #5 — EYES',
  'CRITICAL #6 — LABEL TYPE',
  'HARD FAIL: hovering',
  '10mlz',
  'NO eyelashes',
]);

const merge = fs.readFileSync(path.join(root, 'n8n-pep-merge-tts-binary.js'), 'utf8');
if (merge.includes('$input.first()') || merge.includes("$('tts_pep_voice_over').first()")) {
  throw new Error('merge_tts_binary still uses .first() — that glues Beat A onto every clip');
}

const lipsync = fs.readFileSync(path.join(root, 'n8n-pep-prep-lipsync.js'), 'utf8');
if (/beat:\s*'a'/.test(lipsync)) {
  throw new Error('prep_pep_lipsync still hardcodes beat a');
}

const pitch = "Hey, I'm Palm Beach Pep — quick research rundown. Today we're looking at GHK-Cu. GHK-Cu is a naturally occurring copper-binding tripeptide found in human plasma and other tissues. Visit us at palmbeach-vitality.store.";
const beat_items = [{
  beat: 'a',
  tts_text: pitch,
  pose_still: 'POSE standing',
  omnihuman_prompt: 'omni a',
  pep_body_action: 'standing',
}];
if (beat_items.length !== 1) throw new Error('need 1 beat_item');
if (!beat_items[0].tts_text.endsWith('Visit us at palmbeach-vitality.store.')) {
  throw new Error('pitch must end with store CTA');
}

mustInclude('n8n-pep-60s-1080-execute.md', [
  'n8n-pep-tts-body.txt',
  '| 3 | **Resolution** (`resolution`) | OFF | `720p` |',
  'One talking clip',
]);
mustNotInclude('n8n-pep-60s-1080-execute.md', [
  'still 1080p',
  '4 scene cuts',
]);
mustInclude('n8n-pep-tts-body.txt', [
  '={{ JSON.stringify({',
  'eleven_multilingual_v2',
  "$('split_pep_beats').item.json.tts_text",
]);

console.log('ok one 50s talking-clip node contracts');
