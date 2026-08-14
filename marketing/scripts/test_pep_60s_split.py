#!/usr/bin/env python3
"""Every 4-vid clip speaks intro + product only, then the store CTA."""

from __future__ import annotations

import csv
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
CTA = "Visit us at palmbeach-vitality.store."
MAX_WORDS_1080 = 75
SPOKEN_BANNED = [
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
STOP = re.compile(
    r"today['’]s unique set|everything stays in the research|no treatment claims|no human-use advice|"
    r"palm beach vitality focuses on documentation|for laboratory research use only|not for human use|"
    r"not a drug|not evaluated by the fda|research use only|research language only|peer-reviewed literature|"
    r"catalog clear|purity verification|that's the rundown|thanks for hanging|keep it curious|simple facts|"
    r"short story, clear rules",
    re.I,
)
INTRO = re.compile(
    r"palm beach pep|\bpep here\b|today we're looking at|^hey\b|^quick one|^stay curious|^research desk|"
    r"^what's |^what’s |i['’]m palm beach pep|pep with ",
    re.I,
)
GHK_PITCH = (
    "Hey, I'm Palm Beach Pep — quick research rundown. "
    "Today we're looking at GHK-Cu. "
    "GHK-Cu is a naturally occurring copper-binding tripeptide found in human plasma and other tissues. "
    "Visit us at palmbeach-vitality.store."
)


def identity(s: str, compound: str) -> str:
    first = compound.split("/")[0].strip()
    if not re.match(re.escape(first) + r"\s+is\s+(a|an|the)\b", s.strip(), re.I) and not re.match(
        re.escape(compound) + r"\s+is\s+(a|an|the)\b", s.strip(), re.I
    ):
        return ""
    t = s.strip()
    t = re.sub(
        r"\s+(widely studied|examined in|appearing in laboratory|in experimental literature|"
        r"in laboratory-focused literature|in experimental models|in controlled)\b.*",
        ".",
        t,
        flags=re.I,
    )
    t = re.sub(r"\s{2,}", " ", t).strip()
    if t and not re.search(r"[.!?]$", t):
        t += "."
    return t


def extract_pitch(vo: str, compound: str) -> str:
    t = re.sub(r"\s+", " ", vo or "").strip()
    for cut in [
        r"Today['’]s unique set:.*",
        r"Everything stays in the research and laboratory space.*",
        r"Palm Beach Vitality focuses on documentation.*",
    ]:
        m = re.search(cut, t, flags=re.I)
        if m and m.start() > 20:
            t = t[: m.start()].strip()
    sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]
    acc: list[str] = []
    for s in sents:
        ident = identity(s, compound)
        if ident:
            acc.append(ident)
            break
        if STOP.search(s):
            continue
        if INTRO.search(s):
            acc.append(s)
            continue
    text = " ".join(acc).strip()
    text = re.sub(r"\s*Visit us at palmbeach-vitality\.store\.?\s*$", "", text, flags=re.I).strip()
    if text and not re.search(r"[.!?]$", text):
        text += "."
    return (text + " " + CTA).strip()


def word_count(s: str) -> int:
    return len([w for w in s.split() if w])


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 150

    for r in rows:
        cid = r["creation_id"]
        spoken = extract_pitch(r["voice_over"], r["compound_name"])
        assert spoken.endswith(CTA), cid
        assert "today we're looking at" in spoken.lower(), cid
        low = spoken.lower()
        for phrase in SPOKEN_BANNED:
            assert phrase not in low, f"{cid} still speaks {phrase!r}: {spoken}"
        wc = word_count(spoken)
        assert 12 <= wc <= MAX_WORDS_1080, f"{cid} is {wc} words: {spoken}"
        assert "$('" not in spoken, cid
        # all four clips get this exact same pitch
        for _beat in "abcd":
            assert spoken.endswith(CTA)

    ghk = next(x for x in rows if x["creation_id"] == "PEP-013")
    got = extract_pitch(ghk["voice_over"], ghk["compound_name"])
    assert got == GHK_PITCH, repr(got)

    print("ok rows", len(rows))
    print("PEP-013:", got)


if __name__ == "__main__":
    main()
