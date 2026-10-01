#!/usr/bin/env python3
"""Interleave compounds on 150-pb-pep-scenes and vary Pep blocking language."""

from __future__ import annotations

import csv
import re
from collections import Counter, defaultdict, deque
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")

BODY = [
    "walks mid-ground",
    "sits mid-ground",
    "stands mid-ground talking",
    "stops mid-stride mid-ground",
    "turns toward camera mid-ground",
]
GESTURE = [
    "He presents the 10ml label with an open glove.",
    "He points at the 10ml typography.",
    "Both gloves swing naturally at hip height.",
    "One glove rests on a hip while he talks.",
    "He counts on glove fingers at chest height.",
    "He gives a small low wave below the shoulder.",
    "Both palms present the vial at waist height.",
    "He taps the 10ml label once, then keeps talking.",
]


def interleave(rows: list[dict]) -> list[dict]:
    buckets: dict[str, deque] = defaultdict(deque)
    order: list[str] = []
    for r in rows:
        cid = r["compound_id"]
        if cid not in buckets:
            order.append(cid)
        buckets[cid].append(r)
    out: list[dict] = []
    while any(buckets[c] for c in order):
        for cid in order:
            if buckets[cid]:
                out.append(buckets[cid].popleft())
    return out


def rewrite_blocking(text: str, i: int) -> str:
    body = BODY[i % len(BODY)]
    gesture = GESTURE[i % len(GESTURE)]
    text = re.sub(
        r"Palm Beach Pep stands mid-ground",
        f"Palm Beach Pep {body}",
        text,
    )
    text = re.sub(
        r"He tips his Palm Beach Vitality hat once\.?",
        gesture,
        text,
    )
    text = re.sub(
        r"He glances at his 10ml label, then smiles\.?",
        gesture,
        text,
    )
    text = re.sub(
        r"He settles his sneakers, then thumbs-up\.?",
        gesture,
        text,
    )
    text = re.sub(r"Pep may gesture thumbs-up", "Pep uses a random glove gesture — never thumbs-up", text)
    text = re.sub(r"optimistic thumbs-up energy", "talking-cartoon energy", text)
    text = re.sub(r"He settles his sneakers, then thumbs-up\.?", gesture, text)
    text = re.sub(r"never thumbs-up", "never THUMBSUP_LOCK", text)
    text = re.sub(r"thumbs-up", "open-glove gesture", text, flags=re.I)
    text = re.sub(r"never THUMBSUP_LOCK", "never thumbs-up", text)
    return text


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    rows = interleave(rows)
    for i, r in enumerate(rows):
        r["rank"] = str(i + 1)
        r["scene_brief"] = rewrite_blocking(r.get("scene_brief", ""), i)
        r["video_prompt"] = rewrite_blocking(r.get("video_prompt", ""), i)
        r["video_motion_prompt"] = rewrite_blocking(r.get("video_motion_prompt", ""), i)
        r["model_video"] = "fal-omnihuman-v1.5"

    compounds = [r["compound_id"] for r in rows]
    repeats = 0
    for a, b in zip(compounds, compounds[1:]):
        if a == b:
            repeats += 1

    thumbs_fail = 0
    for r in rows:
        blob = f"{r['scene_brief']} {r['video_motion_prompt']}".lower()
        stripped = blob.replace("never thumbs-up", "")
        if "thumbs-up" in stripped or "thumbs up" in stripped:
            thumbs_fail += 1
    if thumbs_fail:
        raise SystemExit(f"planted thumbs-up leftover in {thumbs_fail} rows")
    if len(set(r["creation_id"] for r in rows)) != 150:
        raise SystemExit("creation_id unique fail")
    if len(set(r["scene_brief"] for r in rows)) != 150:
        raise SystemExit("scene_brief unique fail")
    if len(set(r["surface"] for r in rows)) != 150:
        raise SystemExit("surface unique fail")

    with SRC.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {SRC} rows={len(rows)}")
    print("adjacent_same_compound", repeats)
    print("first_12")
    for r in rows[:12]:
        print(r["rank"], r["creation_id"], r["compound_name"], r["surface"][:48])
    print("products", Counter(r["compound_name"] for r in rows).most_common(5))


if __name__ == "__main__":
    main()
