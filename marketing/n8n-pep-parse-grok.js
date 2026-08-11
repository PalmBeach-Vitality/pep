// Node: Parse_Grok (Code)
// After: GROK_API
// Mode: Run Once for Each Item
// Pulls caption JSON from Grok chat.completion and normalizes compliance_ok

const upstream = $json;
const raw =
  upstream.choices?.[0]?.message?.content ??
  upstream.message?.content ??
  upstream.content ??
  '';

function stripFences(s) {
  const t = String(s || '').trim();
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (m ? m[1] : t).trim();
}

let parsed = {};
let parse_error = '';
try {
  parsed = JSON.parse(stripFences(raw));
} catch (e) {
  parse_error = String(e.message || e);
  // last-ditch: find first {...} block
  try {
    const m = String(raw).match(/\{[\s\S]*\}/);
    if (m) parsed = JSON.parse(m[0]);
    else throw e;
  } catch (e2) {
    parse_error = String(e2.message || e2);
    parsed = {};
  }
}

// Normalize boolean — Grok sometimes returns "true"/"false" strings
function asBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === 'yes' || s === '1') return true;
    if (s === 'false' || s === 'no' || s === '0') return false;
  }
  if (typeof v === 'number') return v === 1;
  return false;
}

const compliance_ok = asBool(parsed.compliance_ok);
const compliance_notes = String(
  parsed.compliance_notes ||
  parsed.notes ||
  (parse_error ? `parse_error: ${parse_error}` : '') ||
  (compliance_ok ? '' : 'Grok set compliance_ok=false — see captions / caption_lock')
);

return [{
  json: {
    ...upstream,
    raw_grok_content: String(raw),
    parse_error: parse_error || null,
    compliance_ok,
    compliance_notes,
    display_name: parsed.display_name || $('Prep_day_variant').item.json.compound_name || '',
    ig_caption_draft: parsed.ig_caption_draft || parsed.instagram_caption || '',
    fb_caption_draft: parsed.fb_caption_draft || parsed.facebook_caption || '',
  }
}];
