const DISCLAIMER = 'For laboratory research use only. Not for human use or consumption. Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA.';

const raw = $json.choices?.[0]?.message?.content ?? '';
let parsed;

try {
  parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
} catch (error) {
  return [{
    json: {
      compliance_ok: false,
      compliance_flags: `Invalid JSON from Grok: ${error.message}`,
      grok_raw: raw,
    },
  }];
}

const ig = parsed?.platform_copy?.instagram?.caption || '';
const fb = parsed?.platform_copy?.facebook?.caption || '';
const tt = parsed?.platform_copy?.tiktok?.caption || '';

const flags = [...(parsed?.compliance_check?.flags || [])];
if (!ig.includes(DISCLAIMER)) flags.push('IG missing mandatory disclaimer');
if (!fb.includes(DISCLAIMER)) flags.push('FB missing mandatory disclaimer');
if (!tt.includes(DISCLAIMER)) flags.push('TikTok missing mandatory disclaimer');

const compliance_ok = (parsed?.compliance_check?.ok === true) && flags.length === 0;

const prior = $('Build Grok Body').item?.json || {};

return [{
  json: {
    compound_id: parsed.compound_id || prior.compound_id,
    display_name: parsed.display_name || prior.compound_name,
    compound_name: prior.compound_name || parsed.display_name,
    product_form: prior.product_form,
    canonical_url: prior.canonical_url,
    figma_template_type: parsed?.creative_brief?.figma_template_type || prior.figma_template_type,

    ig_caption_draft: ig,
    ig_first_comment: parsed?.platform_copy?.instagram?.first_comment || '',
    ig_alt_text: parsed?.platform_copy?.instagram?.alt_text || '',

    fb_caption_draft: fb,

    tiktok_hook: parsed?.platform_copy?.tiktok?.hook || '',
    tiktok_on_screen_text: (parsed?.platform_copy?.tiktok?.on_screen_text || []).join(' | '),
    tiktok_script_draft: parsed?.platform_copy?.tiktok?.spoken_script || '',
    tiktok_caption: tt,

    figma_headline: parsed?.creative_brief?.headline || '',
    figma_subhead: parsed?.creative_brief?.subhead || '',
    figma_bullet_1: parsed?.creative_brief?.bullets?.[0] || '',
    figma_bullet_2: parsed?.creative_brief?.bullets?.[1] || '',
    figma_bullet_3: parsed?.creative_brief?.bullets?.[2] || '',
    figma_cta: parsed?.creative_brief?.cta || 'View laboratory listing',
    figma_visual_notes: parsed?.creative_brief?.visual_notes || '',

    compliance_ok,
    compliance_flags: flags.join('; '),
    grok_raw: raw,
  },
}];
