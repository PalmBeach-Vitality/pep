// n8n Code node: pick_image_scene
// Workflow: image_generation_buffer -3-image-scenes-150
// Mode: Run Once for All Items
// After: filter_active  Before: Limit
//
// Round-robin product format so pens cannot starve vials/labs:
//   pen_3ml_scene      → next vial_10ml_scene
//   vial_10ml_scene    → next lab_scene
//   lab_scene          → next pen_3ml_scene
// Within the chosen category: unused rows first (empty last_used_date),
// then oldest last_used_date, then rotation_order.

function catOf(row) {
  return String((row && row.scene_category) || '').trim();
}

function usedDate(row) {
  return String((row && row.last_used_date) || '').trim();
}

function rot(row) {
  var n = Number(row && row.rotation_order);
  return isFinite(n) ? n : 9999;
}

var NEXT_CAT = {
  pen_3ml_scene: 'vial_10ml_scene',
  vial_10ml_scene: 'lab_scene',
  lab_scene: 'pen_3ml_scene',
};

var rows = $input.all().map(function (i) {
  return i.json;
});

if (!rows.length) {
  throw new Error('pick_image_scene: no Active rows from 3-image-scenes-150');
}

var dated = rows
  .filter(function (r) {
    return usedDate(r);
  })
  .slice()
  .sort(function (a, b) {
    return usedDate(b).localeCompare(usedDate(a));
  });

var lastCat = dated.length ? catOf(dated[0]) : '';
var nextCat = NEXT_CAT[lastCat] || 'vial_10ml_scene';

function inCat(cat) {
  return rows.filter(function (r) {
    return catOf(r) === cat;
  });
}

var pool = inCat(nextCat);
if (!pool.length) {
  pool = rows.filter(function (r) {
    return catOf(r) && catOf(r) !== lastCat;
  });
}
if (!pool.length) pool = rows;

pool.sort(function (a, b) {
  var au = usedDate(a) ? 1 : 0;
  var bu = usedDate(b) ? 1 : 0;
  if (au !== bu) return au - bu;
  if (usedDate(a) !== usedDate(b)) return usedDate(a).localeCompare(usedDate(b));
  if (rot(a) !== rot(b)) return rot(a) - rot(b);
  return String(a.scene_id || '').localeCompare(String(b.scene_id || ''));
});

var pick = pool[0];
return [
  {
    json: Object.assign({}, pick, {
      pick_last_category: lastCat,
      pick_next_category: nextCat,
    }),
  },
];
