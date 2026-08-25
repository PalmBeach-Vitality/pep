// n8n Code node: pick_image_scene
// Workflow: image_generation_buffer -3-image-scenes-150
// Mode: Run Once for All Items
// After: filter_active  Before: Limit
//
// Round-robin product format: pen → vial → pen → vial.
// Lab rows stay in the sheet but are never picked.
//
// last_used_date is ISO date only, so same-day pen/vial rows cannot
// be ordered by recency. staticData alone is unreliable on manual/
// unpublished runs, so stagger from same-day sheet counts instead.
//
// Primary: among eligible rows used TODAY, pick the underrepresented
// category. Ties (incl. 0–0) default to pen, then optional staticData.
// Sheet dates update only after a successful Buffer run. Within the
// chosen category: unused first, then oldest date, then rotation_order.

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

function todayISO() {
  try {
    return $now.toISODate();
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

var STAGGER = ['pen_3ml_scene', 'vial_10ml_scene'];
var NEXT_CAT = {
  pen_3ml_scene: 'vial_10ml_scene',
  vial_10ml_scene: 'pen_3ml_scene',
  lab_scene: 'pen_3ml_scene',
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

var today = todayISO();
var countToday = { pen_3ml_scene: 0, vial_10ml_scene: 0 };
eligible.forEach(function (r) {
  if (usedDate(r) === today) {
    var c = catOf(r);
    if (countToday[c] !== undefined) countToday[c] += 1;
  }
});

var lastCat = '';
var nextCat = '';
var staggerSource = '';

if (countToday.pen_3ml_scene !== countToday.vial_10ml_scene) {
  // Rebalance: pick whichever format was used less today.
  nextCat =
    countToday.pen_3ml_scene < countToday.vial_10ml_scene
      ? 'pen_3ml_scene'
      : 'vial_10ml_scene';
  lastCat = NEXT_CAT[nextCat];
  staggerSource = 'same_day_count';
} else {
  // Tie (including both 0): best-effort staticData, else start with pen.
  var staticData = $getWorkflowStaticData('global');
  lastCat = String(staticData.last_image_category || '').trim();
  if (STAGGER.indexOf(lastCat) === -1) {
    lastCat = '';
    nextCat = 'pen_3ml_scene';
    staggerSource = 'tie_default_pen';
  } else {
    nextCat = NEXT_CAT[lastCat] || 'pen_3ml_scene';
    staggerSource = 'tie_staticData';
  }
}

// Best-effort only — do not rely on this alone.
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
      pick_stagger_source: staggerSource,
      pick_today_pen_count: countToday.pen_3ml_scene,
      pick_today_vial_count: countToday.vial_10ml_scene,
    }),
  },
];
