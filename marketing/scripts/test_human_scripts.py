#!/usr/bin/env python3
"""Lint live 30s VOs and review-only 60s human scripts."""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

ROOT = Path("/workspace/marketing")
sys.path.insert(0, str(ROOT / "scripts"))

from human_script_lib import (  # noqa: E402
    first_sentence,
    lint_script,
    seconds,
    wc,
)

SHEET = ROOT / "sheets" / "150-pb-pep-scenes.csv"
REVIEW_30 = ROOT / "n8n-pep-20-vo-review.md"
REVIEW_60 = ROOT / "n8n-pep-60s-human-vo.md"


def scripts_from_review(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    blocks: list[str] = []
    for chunk in re.split(r"\n## ", text)[1:]:
        body = chunk.split("\n\n", 1)[-1].strip()
        vo = body.split("\n\n")[0].strip()
        if vo.startswith("**"):
            # skip meta lines, take the paragraph after
            parts = body.split("\n\n")
            vo = next(p.strip() for p in parts if p.strip() and not p.startswith("**"))
        blocks.append(vo)
    return blocks


def main() -> None:
    with SHEET.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 20
    firsts_30: list[str] = []
    for r in rows:
        vo = r["voice_over"]
        cid = r["creation_id"]
        problems = lint_script(vo, duration=30)
        assert not problems, f"{cid}: {problems}\n{vo}"
        firsts_30.append(first_sentence(vo).lower())
        print(f"30s {cid} {wc(vo):3d}w ~{seconds(vo):.1f}s")
    assert len(set(firsts_30)) == 20, firsts_30

    review_30 = scripts_from_review(REVIEW_30)
    assert len(review_30) == 20
    for vo, r in zip(review_30, rows, strict=True):
        assert vo == r["voice_over"], r["creation_id"]

    vos_60 = scripts_from_review(REVIEW_60)
    assert len(vos_60) == 20, len(vos_60)
    firsts_60: list[str] = []
    for vo in vos_60:
        problems = lint_script(vo, duration=60)
        assert not problems, f"60s: {problems}\n{vo}"
        firsts_60.append(first_sentence(vo).lower())
    assert len(set(firsts_60)) == 20, firsts_60
    print("ok 20×30s + 20×60s human scripts")


if __name__ == "__main__":
    main()
