#!/usr/bin/env python3
"""Every VO is hook-first easy science with studies + COA + store CTA. 20 × 30s."""

from __future__ import annotations

import csv
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
POOL = Path("/workspace/marketing/sheets/pep-blocking-pool.csv")
CTA = "Visit us at palmbeach-vitality.store."
COA = (
    "Palm Beach Vitality research peptides are backed by a COA with every single order, "
    "American made delivering >99% purity 100% of the time."
)
TARGET_MIN = 65
TARGET_MAX = 74
BANNED = [
    "for laboratory research use only",
    "not for human use or consumption",
    "not evaluated by the fda",
    "research use only",
    "no treatment claims",
    "no human-use advice",
    "everything stays in the research and laboratory space",
    "today's unique set",
    "research language only",
    "storefront-page",
    "canonical-url",
    "experimental-systems",
]


def tokens(text: str) -> list[str]:
    return [w for w in text.split() if w]


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 20, len(rows)
    assert len({r["creation_id"] for r in rows}) == 20
    assert len({r["compound_name"] for r in rows}) == 20
    assert len({r["surface"] for r in rows}) == 20
    secs = []
    firsts = []
    for r in rows:
        vo = r["voice_over"]
        cid = r["creation_id"]
        n = len(tokens(vo))
        assert vo.endswith(CTA), cid
        assert TARGET_MIN <= n <= TARGET_MAX, f"{cid} {n} words"
        low = vo.lower()
        for b in BANNED:
            assert b not in low, f"{cid} {b}"
        assert "palm beach pep" in low, cid
        assert "i'm palm beach pep" in low or "im palm beach pep" in low, cid
        firsts.append(vo.split(".")[0].strip().lower())
        assert "studies have shown" in low, cid
        assert "beneficial to" in low, cid
        assert "recent research studies" in low, cid
        assert COA in vo, cid
        assert vo.index(COA) < vo.index(CTA), cid
        assert r["duration_seconds"] == "30", cid
        assert r["resolution"] == "1080p", cid
        assert r["workflow"] == "vid_gen_palm_beach_pep", cid
        assert "Palm Beach Pep" in r["scene_brief"], cid
        assert "don't scroll" not in low, cid
        secs.append(n / 2.51)
    header = rows[0].keys()
    for dropped in ("reel_still_url", "video_still_url", "videro_still_url", "pep_script", "disclaimer_short"):
        assert dropped not in header, dropped
    assert len(set(firsts)) == 20, firsts
    first = rows[0]
    with POOL.open(newline="", encoding="utf-8") as f:
        pool = list(csv.DictReader(f))
    by_id = {r["id"]: r for r in pool if r.get("type") == "body"}
    for active in ("walking", "running", "dancing", "sports_ready", "hiking"):
        assert by_id[active]["active"].upper() == "TRUE", active
    for inactive in ("sitting", "standing", "stopping", "turning"):
        assert by_id[inactive]["active"].upper() == "FALSE", inactive
    print("ok rows", len(rows))
    print("sec min", round(min(secs), 1), "max", round(max(secs), 1))
    print(first["creation_id"], first["voice_over"])


if __name__ == "__main__":
    main()
