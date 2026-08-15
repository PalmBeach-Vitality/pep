#!/usr/bin/env python3
"""Every VO is an easy science pitch with studies + COA + store CTA."""

from __future__ import annotations

import csv
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
CTA = "Visit us at palmbeach-vitality.store."
COA = (
    "Palm Beach Vitality research peptides are backed by a COA with every single order, "
    "American made delivering >99% purity 100% of the time."
)
TARGET_MIN = 154
TARGET_MAX = 230
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
    assert len(rows) == 150
    secs = []
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
        assert "studies have shown" in low, cid
        assert "beneficial to" in low, cid
        assert "recent research studies" in low, cid
        assert COA in vo, cid
        assert vo.index(COA) < vo.index(CTA), cid
        secs.append(n / 2.51)
    ghk = next(x for x in rows if x["creation_id"] == "PEP-013")
    print("ok rows", len(rows))
    print("sec min", round(min(secs), 1), "max", round(max(secs), 1))
    print("PEP-013", ghk["voice_over"])


if __name__ == "__main__":
    main()
