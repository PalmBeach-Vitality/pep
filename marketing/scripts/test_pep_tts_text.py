#!/usr/bin/env python3
"""Sheet voice_over is the spoken source. No caption-only phrase. No empty rows."""

from __future__ import annotations

import csv
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
BANNED = "research language only"


def clip_sheet_voice(vo: str, max_words: int = 42) -> str:
    text = re.sub(r"\s+", " ", vo or "").strip()
    if not text:
        raise ValueError("empty")
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s]
    out: list[str] = []
    words = 0
    for s in sentences:
        n = len([w for w in s.split() if w])
        if out and words + n > max_words:
            break
        out.append(s)
        words += n
        if words >= max(24, max_words - 10):
            break
    return (" ".join(out) or " ".join(text.split()[:max_words])).strip()


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 150
    for r in rows:
        vo = r["voice_over"]
        assert vo.strip(), r["creation_id"]
        assert BANNED not in vo.lower(), r["creation_id"]
        a = clip_sheet_voice(vo)
        assert a
        assert a in vo or vo.startswith(a.rstrip("."))
        assert "$('" not in a
        assert BANNED not in a.lower()
    print("ok rows", len(rows))
    print("sample PEP-001:", clip_sheet_voice(rows[0]["voice_over"]))


if __name__ == "__main__":
    main()
