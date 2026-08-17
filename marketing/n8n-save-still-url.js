// n8n Code node name: save_still_url
// After: grok_imagine_reel_still  (or GROK_Imagine)
// Before: grok_video  (or grok_video_start / prep_grok_video_start)
// Mode: Run Once for Each Item
// Why: grok_video was sending image.url = null. This node pulls the Imagine
// URL from every common response shape and refuses to continue if missing.

function pickUrl(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const candidates = [
    obj.data?.[0]?.url,
    obj.data?.[0]?.image_url,
    obj.data?.[0]?.image?.url,
    obj.url,
    obj.image_url,
    obj.output?.[0]?.url,
    obj.images?.[0]?.url,
    obj.reel_still_url,
    obj.still_url,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('http')) return c;
  }
  return '';
}

let stillUrl = '';
const sources = ['grok_imagine_reel_still', 'GROK_Imagine', 'grok_imagine_pen_edit'];
for (const name of sources) {
  try {
    stillUrl = pickUrl($(name).item.json);
    if (stillUrl) break;
  } catch (e) {}
}
if (!stillUrl) stillUrl = pickUrl($json);

if (!stillUrl) {
  throw new Error('save_still_url: no Imagine image URL found. Execute grok_imagine_reel_still first and confirm data[0].url is an https URL.');
}

const prior = $json || {};
return [{
  json: {
    ...prior,
    reel_still_url: stillUrl,
    still_url: stillUrl,
    save_still_url: stillUrl,
  },
}];
