// Node: Parse_Grok (Code)
// After: GROK_API
// Mode: Run Once for Each Item
// Ensures compliance_ok is a REAL boolean for if_complaince

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
  try {
    const m = String(raw).match(/\{[\s\S]*\}/);
    if (!m) throw e;
    parsed = JSON.parse(m[0]);
    parse_error = '';
  } catch (e2) {
    parse_error = String(e2.message || e2);
    parsed = {};
  }
}

function asBool(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['true', 'yes', '1', 'ok', 'pass'].includes(s)) return true;
    if (['false', 'no', '0', 'fail'].includes(s)) return false;
  }
  return false;
}

// Force native boolean (never string / never undefined)
const compliance_ok = asBool(parsed.compliance_ok) === true;

let display_name = '';
let compound_name = '';
try {
  compound_name = String($('Prep_day_variant').item.json.compound_name || '');
} catch (e) {
  compound_name = '';
}
display_name = String(parsed.display_name || compound_name || '');

const ig = String(parsed.ig_caption_draft || parsed.instagram_caption || '');
const fb = String(parsed.fb_caption_draft || parsed.facebook_caption || '');
const notes = String(
  parsed.compliance_notes ||
  parsed.notes ||
  (parse_error ? `parse_error: ${parse_error}` : '') ||
  ''
);

// Extra flat flags for IF nodes that struggle with booleans
const compliance_ok_str = compliance_ok ? 'true' : 'false';
const compliance_ok_num = compliance_ok ? 1 : 0;

return [{
  json: {
    // keep upstream chat payload if useful
    grok_id: upstream.id || null,
    grok_model: upstream.model || null,
    raw_grok_content: String(raw),
    parse_error: parse_error || null,

    // IF node should use this boolean
    compliance_ok,
    compliance_ok_str,
    compliance_ok_num,

    compliance_notes: notes,
    display_name,
    ig_caption_draft: ig,
    fb_caption_draft: fb,
  }
}];
