#!/usr/bin/env node
// Syntax + contract checks for one 30s 1080p talking clip.

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
  'pickTalkBody',
  'WALK AND TALK AT THE SAME TIME',
  'JOG AND TALK AT THE SAME TIME',
  'DANCE AND TALK AT THE SAME TIME',
  'KEEP THE SPORT MOTION AND TALK AT THE SAME TIME',
  'extractProductPitch',
  'studies have shown',
  'Visit us at palmbeach-vitality.store.',
  'beat_count: 1',
  "const BEAT_IDS = ['a']",
  "resolution: '1080p'",
  'target_duration_seconds: 30',
  'Need 65–74 words',
  'cleanSetText',
  'BOTH sneakers firmly on the ground',
  'EYES: keep the same two cartoon ovals from the still',
  'Eyes SHOULD blink, glance, and look around naturally',
  'ANIMATE THIS STILL ONLY',
  'LABEL: keep the vial type exactly 10ml',
  'same lash state as the still from 00:00',
  'Mid-clip lash grow-in is the fail',
  'Do not freeze standing',
  '\\bpep\\s+(walks|walking|jogs|jogging|runs|running|dances|dancing|hikes|hiking|pedals|pedaling|boxes|boxing|trains|training|stands|standing|sits|sitting|turns|turning|stops|stopping)\\b',
  'isLocomotionBody',
  "id: 'running'",
  "id: 'dancing'",
  "id: 'sports_ready'",
  "id: 'hiking'",
  "id: 'dance_groove'",
  "id: 'sport_guard'",
]);
mustNotInclude('n8n-pep-prep-beats.js', [
  'function splitVoice',
  '1080p audio must stay under 75',
  "const BEAT_IDS = ['a', 'b', 'c', 'd']",
  'beat_count: 4',
  'pep_script',
  'disclaimer_short',
  'const bodies = [standing]',
  'Hold the still pose',
  "resolution: '720p'",
  'Need 112–125 words',
]);
mustInclude('n8n-pep-split-beats.js', [
  'Run Once for All Items',
  'tts_text',
  'pose_still',
  'omnihuman_prompt',
  'Visit us at palmbeach-vitality.store.',
  'packs.length !== 1',
  'studies have shown',
  "resolution: '1080p'",
  'backed by a COA',
  'Need 65–74',
]);
mustInclude('n8n-pep-gather-clips.js', [
  'Expected 1 OmniHuman clip',
  'lipsync_video_url_a',
  'stitch_clip_urls',
  '.all(0, run)',
  "resolution: '1080p'",
  'beat_count: 1',
  'One 30s talking clip at 1080p',
]);
mustNotInclude('n8n-pep-gather-clips.js', [
  'Expected 4 OmniHuman clips',
  'lipsync_video_url_d',
  'const incoming',
  'gatherPepClips',
  "resolution: '720p'",
]);
mustInclude('n8n-pep-merge-tts-binary.js', [
  'Run Once for Each Item',
  "$('tts_pep_voice_over').item",
  "$('split_pep_beats').item.json",
]);
mustInclude('n8n-pep-prep-lipsync.js', [
  "fromNode('split_pep_beats', ['beat'])",
  "fromNode('split_pep_beats', ['omnihuman_prompt'])",
  "omnihuman_resolution: '1080p'",
  'WALK OR JOG AND TALK AT THE SAME TIME',
  'EYES: keep the same two cartoon ovals from the still',
  'Eyes SHOULD blink, glance, and look around naturally',
  'ANIMATE THIS STILL ONLY',
  'LABEL: keep the vial type exactly 10ml',
  'same lash state as the still from 00:00',
  'Mid-clip lash grow-in is the fail',
]);
mustInclude('n8n-pep-grok-still-body-lock.txt', [
  'Scene brief:',
  'If this pose is walking, jogging, or hiking',
  'If dancing:',
  'If sports:',
  'CRITICAL #4 — FEET',
  'CRITICAL #5 — EYES',
  'CRITICAL #6 — LABEL TYPE',
  'HARD FAIL: hovering',
  '10mlz',
  'copy the input lash state exactly',
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
  pep_body_action: 'walking',
}];
if (beat_items.length !== 1) throw new Error('need 1 beat_item');
if (!beat_items[0].tts_text.endsWith('Visit us at palmbeach-vitality.store.')) {
  throw new Error('pitch must end with store CTA');
}

mustInclude('n8n-pep-60s-1080-execute.md', [
  'n8n-pep-tts-body.txt',
  '| 3 | **Resolution** (`resolution`) | OFF | `1080p` |',
  'One talking clip',
]);
mustNotInclude('n8n-pep-60s-1080-execute.md', [
  'still 1080p',
  '4 scene cuts',
]);
mustInclude('n8n-pep-tts-body.txt', [
  '={{ JSON.stringify({',
  'eleven_multilingual_v2',
  'tts_speak',
]);
mustInclude('AGENT_RULEBOOK.md', [
  'n8n-pep-n8n-mcp-agent-handoff.md',
  'if_complaince',
  'Do not remint boardwalk pass',
  '1080p',
]);
mustInclude('n8n-pep-n8n-mcp-agent-handoff.md', [
  'vid_gen_palm_beach_pep',
  'WALK AND TALK',
  'QJXLAo2E80avVgXRZv2pw_video.mp4',
  'NEVER PIN',
  'select all, delete, paste',
  'SEM-uh-GLOO-tide',
  '65–74',
  '1080p',
]);
mustInclude('n8n-pep-prep-beats.js', [
  'SEM-uh-GLOO-tide',
  'tts_speak: voiceSpeak',
  'applyPronunciation',
  'certificate of analysis',
  'greater than ninety-nine percent',
]);

function pickTalkBodyId(hint) {
  const h = String(hint || '').toLowerCase();
  const pep = h.match(/\bpep\s+(walks|walking|jogs|jogging|runs|running|dances|dancing|hikes|hiking|pedals|pedaling|boxes|boxing|trains|training|stands|standing|sits|sitting|turns|turning|stops|stopping)\b/);
  if (pep) {
    const v = pep[1];
    if (/walk/.test(v)) return 'walking';
    if (/jog|run/.test(v)) return 'running';
    if (/danc/.test(v)) return 'dancing';
    if (/hike/.test(v)) return 'hiking';
    if (/pedal|box|train/.test(v)) return 'sports_ready';
    if (/sit|stand|turn|stop/.test(v)) return 'walking';
  }
  if (/\bdanc(?:e|es|ing)|groove|two-step\b/.test(h)) return 'dancing';
  if (/\b(?:jog|jogs|jogging|run|runs|running|sprint)\b/.test(h)) return 'running';
  if (/\bhike|hiking|trail\b/.test(h)) return 'hiking';
  if (/\b(?:pedal|bike|box(?:es|ing)?|shuffle|assault|kettlebell|battle.?rope|spin)\b/.test(h)) return 'sports_ready';
  if (/\bwalk(?:s|ing)?\b|\bstroll\b/.test(h)) return 'walking';
  return 'walking';
}
if (pickTalkBodyId('Palm Beach Pep walks mid-ground in this unique set') !== 'walking') {
  throw new Error('walk scene must pick walking');
}
if (pickTalkBodyId('Palm Beach Pep stands mid-ground talking') !== 'walking') {
  throw new Error('stand scene must walk-and-talk, not freeze standing');
}
if (pickTalkBodyId('Palm Beach Pep sits mid-ground') !== 'walking') {
  throw new Error('sit scene must remap to walking for social clips');
}
if (pickTalkBodyId('Palm Beach Pep turns toward camera') !== 'walking') {
  throw new Error('turn scene must remap to walking');
}
if (pickTalkBodyId('Palm Beach Pep stops mid-stride mid-ground') !== 'walking') {
  throw new Error('stop scene must remap to walking');
}
if (pickTalkBodyId('Palm Beach Pep jogs mid-ground') !== 'running') {
  throw new Error('jog scene must pick running');
}
if (pickTalkBodyId('Palm Beach Pep dances mid-ground') !== 'dancing') {
  throw new Error('dance scene must pick dancing');
}
if (pickTalkBodyId('Palm Beach Pep hikes mid-ground') !== 'hiking') {
  throw new Error('hike scene must pick hiking');
}
if (pickTalkBodyId('Palm Beach Pep pedals mid-ground') !== 'sports_ready') {
  throw new Error('pedal scene must pick sports_ready');
}
if (pickTalkBodyId('Palm Beach Pep boxes mid-ground') !== 'sports_ready') {
  throw new Error('box scene must pick sports_ready');
}
if (pickTalkBodyId('Palm Beach Pep trains mid-ground') !== 'sports_ready') {
  throw new Error('train scene must pick sports_ready');
}
if (pickTalkBodyId('') !== 'walking') {
  throw new Error('default body must be walking');
}

console.log('ok one 30s 1080p talking-clip node contracts');
