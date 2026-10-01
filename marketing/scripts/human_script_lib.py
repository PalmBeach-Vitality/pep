#!/usr/bin/env python3
"""Shared constants and lints for the Human Script Agent.

30s live path: 65–74 words at ~2.51 wps (OmniHuman 1080p audio cap).
60s variants: 140–150 words (~56–60s). Review-only unless Sal mints longer audio.
"""

from __future__ import annotations

import re

CTA = "Visit us at palmbeach-vitality.store."
COA = (
    "Palm Beach Vitality research peptides are backed by a COA with every single order, "
    "American made delivering >99% purity 100% of the time."
)
WPS = 2.51

DURATION = {
    30: (65, 74),
    60: (140, 150),
}

BANNED_OPENERS = (
    "in today's video",
    "in this article",
    "in this post",
    "have you ever wondered",
    "what if i told you",
    "picture this",
    "let's dive",
    "welcome back to the channel",
    "without further ado",
    "in a world where",
    "in today's fast-paced",
    "ever-evolving landscape",
    "don't scroll",
)

BANNED_VOCAB = (
    "delve", "tapestry", "testament", "underscore", "pivotal", "intricate",
    "meticulously", "garner", "vibrant", "bolster", "interplay", "exemplify",
    "renowned", "groundbreaking", "nestled", "realm", "embark", "leverage",
    "elevate", "unlock", "unleash", "harness", "robust", "seamless", "holistic",
    "myriad", "plethora", "cornerstone", "beacon", "game-changer", "paradigm",
    "synergy", "empower", "utilize", "facilitate", "comprehensive",
    "cutting-edge", "revolutionary", "noteworthy", "foster", "showcase",
)

BANNED_PHRASES = (
    "it's not just",
    "at the end of the day",
    "when it comes to",
    "it's important to note",
    "it is worth noting",
    "in order to",
    "due to the fact that",
    "in conclusion",
    "to summarize",
    "rest assured",
    "look no further",
    "the good news is",
    "the bad news is",
    "unlock the power",
)

BANNED_SPOKEN = (
    "for laboratory research use only",
    "not for human use or consumption",
    "not evaluated by the fda",
    "research use only",
    "no treatment claims",
    "treat, cure",
    "diagnos",
    "prevent disease",
)

# Formula openers that made the first 20 clips sound cloned.
CLONED_INTRO = re.compile(
    r"^i'?m palm beach pep,\s+\w+ing this\b",
    re.IGNORECASE,
)


def tokens(text: str) -> list[str]:
    return [w for w in text.split() if w]


def wc(text: str) -> int:
    return len(tokens(text))


def seconds(text: str, wps: float = WPS) -> float:
    return wc(text) / wps


def studies(say: str, benefit: str) -> str:
    return (
        f"Studies have shown {say} has been beneficial to {benefit} "
        f"in recent research studies."
    )


def assemble(hook: str, science: str, say: str, benefit: str) -> str:
    parts = [hook, science, studies(say, benefit), COA, CTA]
    return re.sub(r"\s+", " ", " ".join(parts)).strip()


def first_sentence(text: str) -> str:
    parts = re.split(r"(?<=[.!?])\s+", text.strip(), maxsplit=1)
    return parts[0].strip()


def lint_script(text: str, *, duration: int = 30, require_pep: bool = True) -> list[str]:
    """Return human-readable problems. Empty list means the script passes."""
    errors: list[str] = []
    lo = text.lower()
    n = wc(text)
    lo_min, lo_max = DURATION[duration]
    if not (lo_min <= n <= lo_max):
        errors.append(f"{n} words, need {lo_min}–{lo_max} for {duration}s")
    if not text.endswith(CTA):
        errors.append("missing exact store CTA")
    if COA not in text:
        errors.append("missing exact COA line")
    if "studies have shown" not in lo or "beneficial to" not in lo:
        errors.append("missing locked studies line")
    if require_pep and "i'm palm beach pep" not in lo and "im palm beach pep" not in lo:
        errors.append("missing I'm Palm Beach Pep")
    opener = first_sentence(text).lower()
    for banned in BANNED_OPENERS:
        if opener.startswith(banned) or lo.startswith(banned):
            errors.append(f"banned opener: {banned}")
    for word in BANNED_VOCAB:
        if re.search(rf"\b{re.escape(word)}\b", lo):
            errors.append(f"banned vocab: {word}")
    for phrase in BANNED_PHRASES:
        if phrase in lo:
            errors.append(f"banned phrase: {phrase}")
    for phrase in BANNED_SPOKEN:
        if phrase in lo:
            errors.append(f"banned spoken compliance: {phrase}")
    if text.count("—") + text.count("–") > 1:
        errors.append("too many dashes for spoken VO")
    if CLONED_INTRO.search(text):
        errors.append("cloned I'm Palm Beach Pep, [verb]ing this [noun] opener")
    if re.search(r"\bit'?s not (just )?.+, it'?s\b", lo):
        errors.append("it's not X, it's Y construction")
    return errors
