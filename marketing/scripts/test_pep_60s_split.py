#!/usr/bin/env python3
"""Every VO is 55–60s intro-pitch-close with ZERO repeated words."""

from __future__ import annotations

import csv
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
CTA = "Visit us at palmbeach-vitality.store."
TARGET_MIN = 142
TARGET_MAX = 150
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
]


def tokens(text: str) -> list[str]:
    return [w for w in text.split() if w]


def norm(tok: str) -> str:
    return re.sub(r"[.,!?;:\"'()[\]{}]", "", tok).replace("—", "").replace("–", "").lower()


def first_dup(text: str) -> str | None:
    seen = set()
    for w in tokens(text):
        k = norm(w)
        if not k:
            continue
        if k in seen:
            return k
        seen.add(k)
    return None


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 150
    secs = []
    for r in rows:
        vo = r["voice_over"]
        cid = r["creation_id"]
        n = len(tokens(vo))
        dup = first_dup(vo)
        assert dup is None, f"{cid} repeats {dup!r}"
        assert vo.endswith(CTA), cid
        assert TARGET_MIN <= n <= TARGET_MAX, f"{cid} {n} words"
        low = vo.lower()
        for b in BANNED:
            assert b not in low, f"{cid} {b}"
        assert "palm beach pep" in low, cid
        for pack in ("vial", "packshot", "thumbs", "mascot", "crimp-sealed", "10ml"):
            assert pack not in low, f"{cid} packaging {pack}"
        secs.append(n / 2.51)
    ghk = next(x for x in rows if x["creation_id"] == "PEP-013")
    print("ok rows", len(rows))
    print("sec min", round(min(secs), 1), "max", round(max(secs), 1))
    print("PEP-013", ghk["voice_over"])


if __name__ == "__main__":
    main()
