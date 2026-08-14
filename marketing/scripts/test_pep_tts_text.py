#!/usr/bin/env python3
"""Mirror firstBeatVoice from prep_pep_beats and check every sheet row."""

from __future__ import annotations

import csv
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")


def first_beat_voice(vo: str) -> str:
    text = re.sub(r"\s+", " ", vo or "").strip()
    if not text:
        raise ValueError("empty")
    if "$('" in text or "={{" in text:
        raise ValueError("expression")
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s]
    out: list[str] = []
    words = 0
    for s in sentences:
        n = len([w for w in s.split() if w])
        if out and words + n > 42:
            break
        out.append(s)
        words += n
        if words >= 32:
            break
    return (" ".join(out) or " ".join(text.split()[:40])).strip()


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 150
    for r in rows:
        vo = r["voice_over"]
        a = first_beat_voice(vo)
        assert a
        assert a in vo or a == vo[: len(a)]
        assert "$('" not in a
        assert "prep_pep_beats" not in a
        assert r["compound_name"].split()[0] in a or r["compound_name"] in vo
    print("ok rows", len(rows))
    print("sample PEP-001:", first_beat_voice(rows[0]["voice_over"]))
    print("words", len(first_beat_voice(rows[0]["voice_over"]).split()))


if __name__ == "__main__":
    main()
