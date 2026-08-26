// n8n Code node: pick_image_scene
// Workflow: image_generation_buffer -3-image-scenes-150
// Mode: Run Once for All Items
// After: filter_active  Before: Limit
//
// Manual override: Set node choose_pen_or_vial.format = "pen" | "vial"
// (first node after Manual Trigger, before Get row(s)).
//
// If format is blank/auto: strict alternate vial → pen → vial → pen
// from the most recent pen/vial last_used stamp. Labs never picked.
// update_row writes $now.toISO() timestamps for same-day ordering.

function catOf(row) {
  return String((row && row.scene_category) || '').trim();
}

function usedRaw(row) {
  var v = row && row.last_used_date;
  if (v === undefined || v === null || v === '') return '';
  if (typeof v === 'object' && typeof v.toISOString === 'function') {
    return v.toISOString();
  }
  return String(v).trim();
}

function usedSortKey(row) {
  return usedRaw(row);
}

function rot(row) {
  var n = Number(row && row.rotation_order);
  return isFinite(n) ? n : 9999;
}

function manualChoice() {
  try {
    var raw = String($('choose_pen_or_vial').first().json.format || '')
      .trim()
      .toLowerCase();
    if (raw === 'pen' || raw === 'pen_3ml_scene') return 'pen_3ml_scene';
    if (raw === 'vial' || raw === 'vial_10ml_scene') return 'vial_10ml_scene';
    return '';
  } catch (e) {
    return '';
  }
}

var STAGGER = ['pen_3ml_scene', 'vial_10ml_scene'];
var NEXT_CAT = {
  pen_3ml_scene: 'vial_10ml_scene',
  vial_10ml_scene: 'pen_3ml_scene',
};

var rows = $input.all().map(function (i) {
  return i.json;
});

if (!rows.length) {
  throw new Error('pick_image_scene: no Active rows from 3-image-scenes-150');
}

var eligible = rows.filter(function (r) {
  return STAGGER.indexOf(catOf(r)) !== -1;
});

if (!eligible.length) {
  throw new Error('pick_image_scene: no Active pen_3ml_scene or vial_10ml_scene rows');
}

var dated = eligible
  .filter(function (r) {
    return usedRaw(r);
  })
  .slice()
  .sort(function (a, b) {
    return usedSortKey(b).localeCompare(usedSortKey(a));
  });

var lastCat = dated.length ? catOf(dated[0]) : '';
var forced = manualChoice();
var nextCat = '';
var staggerSource = '';

if (forced) {
  nextCat = forced;
  staggerSource = 'manual_choose';
} else {
  nextCat = NEXT_CAT[lastCat] || 'vial_10ml_scene';
  staggerSource = lastCat ? 'last_used_alternate' : 'start_vial';
}

try {
  $getWorkflowStaticData('global').last_image_category = nextCat;
} catch (e) {}

function inCat(cat) {
  return eligible.filter(function (r) {
    return catOf(r) === cat;
  });
}

var pool = inCat(nextCat);
if (!pool.length) {
  pool = eligible.filter(function (r) {
    return catOf(r) !== lastCat;
  });
}
if (!pool.length) pool = eligible;

pool.sort(function (a, b) {
  var au = usedRaw(a) ? 1 : 0;
  var bu = usedRaw(b) ? 1 : 0;
  if (au !== bu) return au - bu;
  if (usedSortKey(a) !== usedSortKey(b)) {
    return usedSortKey(a).localeCompare(usedSortKey(b));
  }
  if (rot(a) !== rot(b)) return rot(a) - rot(b);
  return String(a.scene_id || '').localeCompare(String(b.scene_id || ''));
});

var pick = pool[0];
return [
  {
    json: Object.assign({}, pick, {
      pick_last_category: lastCat,
      pick_next_category: nextCat,
      pick_stagger_source: staggerSource,
      pick_last_used_raw: dated.length ? usedRaw(dated[0]) : '',
      pick_manual_format: forced || '',
    }),
  },
];
