#!/usr/bin/env python3
"""Two ~30s 1080p scenes: spoken VO has no compliance boilerplate."""

from __future__ import annotations

import csv
import math
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
BANNED = "research language only"
SPOKEN_BANNED = [
    "for laboratory research use only",
    "not for human use or consumption",
    "not evaluated by the fda",
    "research use only",
    "no treatment claims",
    "no human-use advice",
    "everything stays in the research and laboratory space",
    BANNED,
]
MAX_WORDS_1080 = 75


def strip_spoken(vo: str, disclaimer: str = "") -> str:
    text = re.sub(r"\s+", " ", vo or "").strip()
    patterns = [
        r"research language only\.?",
        r"for laboratory research use only\.?",
        r"not for human use or consumption\.?",
        r"not a drug, dietary supplement, or cosmetic\.?",
        r"not evaluated by the fda\.?",
        r"research use only\.?",
        r"no treatment claims\.?",
        r"no human-use advice\.?",
        r"everything stays in the research and laboratory space\.?",
    ]
    for p in patterns:
        text = re.sub(p, " ", text, flags=re.I)
    if disclaimer.strip():
        text = re.sub(re.escape(disclaimer.strip()), " ", text, flags=re.I)
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r"\s+\.", ".", text).strip(" .")
    return text


def split_voice(text: str) -> dict[str, str]:
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s]
    if len(sentences) >= 2:
        n = math.ceil(len(sentences) / 2)
        return {
            "a": " ".join(sentences[0:n]).strip(),
            "b": " ".join(sentences[n:]).strip(),
        }
    words = [w for w in text.split() if w]
    n = max(1, math.ceil(len(words) / 2))
    return {
        "a": " ".join(words[0:n]).strip(),
        "b": " ".join(words[n:]).strip(),
    }


def word_count(s: str) -> int:
    return len([w for w in s.split() if w])


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 150

    for r in rows:
        cid = r["creation_id"]
        spoken = strip_spoken(r["voice_over"], r.get("disclaimer_short") or "")
        assert spoken, cid
        low = spoken.lower()
        for phrase in SPOKEN_BANNED:
            assert phrase not in low, f"{cid} still speaks {phrase!r}"
        beats = split_voice(spoken)
        for k in ("a", "b"):
            assert beats[k], f"{cid} empty beat {k}"
            assert "$('" not in beats[k], cid
            wc = word_count(beats[k])
            assert wc <= MAX_WORDS_1080, f"{cid} beat {k} is {wc} words"
        joined = " ".join(beats[v] for v in "ab")
        assert word_count(joined) >= word_count(spoken) - 2, cid

    print("ok rows", len(rows))
    sample = split_voice(strip_spoken(rows[0]["voice_over"], rows[0].get("disclaimer_short") or ""))
    for k, v in sample.items():
        print(f"PEP-001 {k} words={word_count(v)}: {v[:90]}...")


if __name__ == "__main__":
    main()
