// n8n Code node: pick_image_scene
// Workflow: image_generation_buffer -3-image-scenes-150
// Mode: Run Once for All Items
// After: filter_active  Before: Limit
//
// Strict alternate: vial → pen → vial → pen.
// Labs stay in the sheet but are never picked.
//
// last_used_date must be a full ISO timestamp (update_row writes $now.toISO())
// so same-calendar-day runs stay ordered. Date-only legacy cells still work
// as a fallback. Empty history starts on vial.
// Within the chosen category: unused first, then oldest stamp, then rotation_order.

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
  // Prefer full ISO strings for ordering; date-only sorts before same-day timestamps.
  return usedRaw(row);
}

function rot(row) {
  var n = Number(row && row.rotation_order);
  return isFinite(n) ? n : 9999;
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
var nextCat = NEXT_CAT[lastCat] || 'vial_10ml_scene';
var staggerSource = lastCat ? 'last_used_alternate' : 'start_vial';

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
    }),
  },
];
