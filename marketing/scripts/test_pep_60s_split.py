#!/usr/bin/env python3
"""Four ~15s 1080p beats: full sheet VO, no empty slice, under OmniHuman 30s cap."""

from __future__ import annotations

import csv
import math
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
BANNED = "research language only"
# ~2.5 words/sec spoken. 1080p OmniHuman hard-cap is 30s.
MAX_WORDS_1080 = 75


def strip_caption_only(vo: str) -> str:
    text = re.sub(r"\s+", " ", vo or "").strip()
    text = re.sub(r"\s*[—–-]\s*research language only\.?", ".", text, flags=re.I)
    text = re.sub(r"\bresearch language only\.?", "", text, flags=re.I)
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r"\s+\.", ".", text)
    return text.strip()


def split_voice(text: str) -> dict[str, str]:
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text) if s]
    if len(sentences) >= 4:
        n = math.ceil(len(sentences) / 4)
        return {
            "a": " ".join(sentences[0:n]).strip(),
            "b": " ".join(sentences[n : n * 2]).strip(),
            "c": " ".join(sentences[n * 2 : n * 3]).strip(),
            "d": " ".join(sentences[n * 3 :]).strip(),
        }
    words = [w for w in text.split() if w]
    n = max(1, math.ceil(len(words) / 4))
    return {
        "a": " ".join(words[0:n]).strip(),
        "b": " ".join(words[n : n * 2]).strip(),
        "c": " ".join(words[n * 2 : n * 3]).strip(),
        "d": " ".join(words[n * 3 :]).strip(),
    }


def word_count(s: str) -> int:
    return len([w for w in s.split() if w])


def pick_unique(ids: list[str], n: int) -> list[str]:
    assert ids
    mixed = list(ids)
    # deterministic uniqueness check: first n unique cycling
    out = []
    seen = []
    for i, item in enumerate(mixed):
        if item not in seen:
            seen.append(item)
        if len(seen) == n:
            break
    while len(seen) < n:
        seen.append(mixed[len(seen) % len(mixed)])
    return seen[:n]


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 150

    for r in rows:
        cid = r["creation_id"]
        vo = strip_caption_only(r["voice_over"])
        assert vo, cid
        assert BANNED not in vo.lower(), cid
        beats = split_voice(vo)
        for k in ("a", "b", "c", "d"):
            assert beats[k], f"{cid} empty beat {k}"
            assert "$('" not in beats[k], cid
            assert BANNED not in beats[k].lower(), cid
            wc = word_count(beats[k])
            assert wc <= MAX_WORDS_1080, f"{cid} beat {k} is {wc} words (> {MAX_WORDS_1080}, 1080p 30s cap)"
        joined = " ".join(beats[v] for v in "abcd")
        vo_words = word_count(vo)
        joined_words = word_count(joined)
        assert joined_words >= vo_words - 2, f"{cid} split dropped words ({joined_words} vs {vo_words})"

    bodies = ["walking", "sitting", "standing", "stopping", "turning"]
    picked = pick_unique(bodies, 4)
    assert len(set(picked)) == 4, picked

    print("ok rows", len(rows))
    sample = split_voice(strip_caption_only(rows[0]["voice_over"]))
    for k, v in sample.items():
        print(f"PEP-001 {k} words={word_count(v)}: {v[:80]}...")


if __name__ == "__main__":
    main()
