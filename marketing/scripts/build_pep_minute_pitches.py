#!/usr/bin/env python3
"""Build easy, upbeat 55–60s wellness sales pitches.

Measured Pep TTS rate: ~2.51 words/sec.
142 words ≈ 56.6s. 150 words ≈ 59.8s.
Intro + product + studies line + close.
Last sentence: Visit us at palmbeach-vitality.store.
No FDA / unique-set / laboratory-research-use-only.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
CTA = "Visit us at palmbeach-vitality.store."
TARGET = 146
TARGET_MIN = 142
TARGET_MAX = 150

BANNED_PHRASES = [
    "for laboratory research use only",
    "not for human use",
    "not evaluated by the fda",
    "research use only",
    "no treatment claims",
    "no human-use advice",
    "everything stays in the research",
    "today's unique set",
    "research language only",
    "palm beach vitality focuses on documentation",
    "not a drug",
    "storefront-page",
    "canonical-url",
    "experimental-systems",
]

# Easy spoken name, one-line what-it-is, wellness benefit for Sal's studies line.
PROFILES: dict[str, dict[str, str]] = {
    "GHK-Cu": {
        "say": "GHK-Cu",
        "what": "This is a naturally occurring copper-binding tripeptide found in plasma and other tissues, and the wellness story is simple and sunny.",
        "benefit": "skin comfort and a fresh, healthy-looking glow",
        "color": "People like it because the science feels friendly: copper binding, tissue support, and that clean everyday radiance vibe.",
    },
    "BPC-157": {
        "say": "BPC-157",
        "what": "This is a synthetic fifteen-amino-acid peptide from a protective gastric protein, and the wellness story is easy to follow.",
        "benefit": "gut comfort and a faster bounce-back feel",
        "color": "People like it because it sounds like a recovery buddy: simple, upbeat, and kind to the comfort conversation.",
    },
    "TB-500": {
        "say": "TB-500",
        "what": "This is a synthetic fragment of thymosin beta-4, and the wellness story is all about easy movement.",
        "benefit": "flexible motion and a free, loose feeling in the body",
        "color": "People like it because it feels like a stretch-and-go molecule with a bright, athletic glow.",
    },
    "BPC-157 / TB-500": {
        "say": "BPC-157 and TB-500",
        "what": "This is a two-peptide pairing that brings a recovery peptide together with a movement peptide, and the wellness story stays light.",
        "benefit": "comfort, bounce-back, and flexible movement",
        "color": "People like the pair because it feels like care plus motion, without a heavy science lecture.",
    },
    "BPC-157 / TB-500 / GHK-Cu": {
        "say": "BPC-157, TB-500, and GHK-Cu",
        "what": "This is a three-peptide mix for recovery, movement, and glow, and the wellness story is warm and simple.",
        "benefit": "bounce-back, flexible motion, and skin comfort",
        "color": "People like the trio because it covers comfort, motion, and that fresh-looking radiance in one upbeat walkthrough.",
    },
    "KPV": {
        "say": "KPV",
        "what": "This is a short tripeptide fragment of alpha-MSH, and the wellness story is calm and kind.",
        "benefit": "comfortable skin and a soothed, easy gut feel",
        "color": "People like it because it feels gentle: small molecule, soft vibe, and a friendly comfort story.",
    },
    "KPV / BPC-157 / TB-500 / GHK-Cu": {
        "say": "KPV, BPC-157, TB-500, and GHK-Cu",
        "what": "This is a four-peptide mix for comfort, recovery, movement, and glow, and the wellness story stays easy.",
        "benefit": "soothed comfort, bounce-back, flexible motion, and a fresh-looking glow",
        "color": "People like the stack because it feels like a full feel-good lineup without turning into a textbook.",
    },
    "CJC (no DAC)": {
        "say": "CJC no DAC",
        "what": "This is a growth-hormone-releasing peptide without DAC, and the wellness story is rest and refresh.",
        "benefit": "overnight recovery and a lifted, rested feel",
        "color": "People like it because it sounds like a nightly reset with a bright morning vibe.",
    },
    "CJC (no DAC)/Ipamorelin": {
        "say": "CJC no DAC and Ipamorelin",
        "what": "This is a rest-and-recovery pairing, and the wellness story is soft, simple, and upbeat.",
        "benefit": "restful recovery and a lifted overnight feel",
        "color": "People like the pair because it feels like a calm night and a brighter morning in one easy pitch.",
    },
    "Ipamorelin": {
        "say": "Ipamorelin",
        "what": "This is a gentle growth-hormone-releasing peptide, and the wellness story is soft and friendly.",
        "benefit": "gentle recovery and a rested, lifted feel",
        "color": "People like it because it feels easy: not harsh, not heavy, just a bright recovery vibe.",
    },
    "Sermorelin": {
        "say": "Sermorelin",
        "what": "This is a growth-hormone-releasing peptide, and the wellness story is restful and clear.",
        "benefit": "restful recovery and a refreshed morning feel",
        "color": "People like it because it sounds like a clean overnight reset with a sunny follow-through.",
    },
    "Tesamorelin": {
        "say": "Tesamorelin",
        "what": "This is a growth-hormone-releasing peptide with a midsection wellness story that stays simple.",
        "benefit": "midsection wellness and a smoother metabolic feel",
        "color": "People like it because the pitch is practical: feel lighter, feel brighter, keep the science friendly.",
    },
    "AOD-9604": {
        "say": "AOD-9604",
        "what": "This is a research peptide fragment with a metabolic wellness story that is easy to understand.",
        "benefit": "metabolic wellness and a lighter, more active feel",
        "color": "People like it because it sounds like momentum: simple science, sunny energy, no jargon pile-up.",
    },
    "Semaglutide": {
        "say": "Semaglutide",
        "what": "This is a GLP-1 style peptide, and the wellness story is steady, modern, and easy to follow.",
        "benefit": "metabolic wellness and a calmer appetite feel",
        "color": "People like it because it feels like a smoother rhythm: less noise, more balance, still upbeat.",
    },
    "Tirzepatide": {
        "say": "Tirzepatide",
        "what": "This is a dual-pathway metabolic peptide, and the wellness story is balanced and bright.",
        "benefit": "metabolic wellness and a steady, lighter feel",
        "color": "People like it because it sounds like two friendly levers working together, without a heavy lecture.",
    },
    "Retatrutide": {
        "say": "Retatrutide",
        "what": "This is a next-wave metabolic peptide, and the wellness story is fresh and easy.",
        "benefit": "metabolic wellness and a brighter, lighter rhythm",
        "color": "People like it because it feels new, sunny, and simple to talk about on a first listen.",
    },
    "NAD+": {
        "say": "NAD+",
        "what": "This is a core energy helper found in cells, and the wellness story is vitality you can understand.",
        "benefit": "everyday energy and a brighter vitality feel",
        "color": "People like it because it sounds like a spark: clean energy, clear mood, and a friendly science walkthrough.",
    },
    "MOTS-C": {
        "say": "MOTS-C",
        "what": "This is a mitochondrial peptide, and the wellness story is bouncy cellular energy.",
        "benefit": "cellular energy and a lively metabolic feel",
        "color": "People like it because it feels like a little engine with a sunny, get-up-and-go vibe.",
    },
    "SS-31": {
        "say": "SS-31",
        "what": "This is a mitochondria-targeted peptide, and the wellness story is steady stamina.",
        "benefit": "cellular energy and a supported, steady stamina feel",
        "color": "People like it because it sounds like durable energy, not a jittery rush.",
    },
    "Selank": {
        "say": "Selank",
        "what": "This is a synthetic heptapeptide related to tuftsin, and the wellness story is calm focus.",
        "benefit": "calm focus and an easy, settled mind",
        "color": "People like it because it feels like a deep breath: clear, kind, and quietly upbeat.",
    },
    "Semax": {
        "say": "Semax",
        "what": "This is a synthetic peptide with a bright focus story that stays easy to understand.",
        "benefit": "clear focus and a sharp, sunny mental feel",
        "color": "People like it because it sounds like lights-on energy for the mind, without a dense lecture.",
    },
    "Thymosin Alpha-1": {
        "say": "Thymosin Alpha-1",
        "what": "This is an immune-balance peptide, and the wellness story is supported and steady.",
        "benefit": "immune-balance wellness and a supported, steady feel",
        "color": "People like it because it feels like quiet backup: simple science, warm tone, easy listen.",
    },
    "PT-141": {
        "say": "PT-141",
        "what": "This is a melanocortin peptide, and the wellness story is confidence and spark.",
        "benefit": "confidence and a lifted, playful spark",
        "color": "People like it because the vibe is bold, bright, and still easy to say out loud.",
    },
}

def tokens(text: str) -> list[str]:
    return [w for w in text.split() if w]


def wc(s: str) -> int:
    return len(tokens(s))


def studies_line(say: str, benefit: str) -> str:
    return f"Studies have shown {say} has been beneficial to {benefit} in recent research studies."


CUSTOM = {
    "GHK-Cu": (
        "Hey, I'm Palm Beach Pep, and I am quickly presenting GHK-Cu. "
        "This is a naturally occurring copper-binding tripeptide found in plasma and other tissues, "
        "and the wellness story is simple and sunny. "
        "Studies have shown GHK-Cu has been beneficial to skin comfort and a fresh, healthy-looking glow "
        "in recent research studies. "
        "That is why this one is fun to talk about: copper binding, tissue support, and a clean everyday "
        "radiance vibe that feels friendly, not scary. "
        "I keep the science light so you can follow it on the first listen. No heavy jargon. "
        "Just an upbeat walkthrough of a bright little molecule with a warm reputation for helping skin feel cared for. "
        "This is feel-good science you can actually follow. "
        "If you want GHK-Cu on your list, the storefront has it ready. "
        "Come take a look and grab the one that fits your research shelf. "
        "Visit us at palmbeach-vitality.store."
    ),
}


def build_pitch(compound_name: str) -> str:
    if compound_name in CUSTOM:
        return re.sub(r"\s+", " ", CUSTOM[compound_name]).strip()

    p = PROFILES[compound_name]
    say = p["say"]
    parts = [
        f"Hey, I'm Palm Beach Pep, and I am quickly presenting {say}.",
        p["what"],
        studies_line(say, p["benefit"]),
        p["color"],
        "I keep this pitch light on purpose so you can follow it on the first listen.",
        "No heavy jargon, just an upbeat walkthrough of a molecule with a warm wellness reputation.",
        f"If you want {say} on your list, the storefront has it ready.",
    ]
    extras = [
        "The vibe stays sunny, simple, and easy the whole way through.",
        "Come take a look and grab the one that fits your research shelf.",
        "Keep it curious, keep it kind, and enjoy the story.",
        "This is a feel-good science talk, not a textbook.",
        "Stay upbeat, stay curious, and have fun with the molecule.",
    ]
    n = wc(" ".join(parts + [CTA]))
    used: list[str] = []
    for extra in extras:
        if n >= TARGET:
            break
        add = wc(extra)
        if n + add > TARGET_MAX:
            continue
        used.append(extra)
        n += add
    if n < TARGET_MIN:
        raise RuntimeError(f"{compound_name} only {n} words")
    # extras sit before the storefront close so the CTA stays last
    ready = parts[-1]
    head = parts[:-1]
    pitch = " ".join(head + used + [ready, CTA])
    return re.sub(r"\s+", " ", pitch).strip()


def main() -> None:
    missing = []
    for name in PROFILES:
        p = build_pitch(name)
        n = wc(p)
        if not (TARGET_MIN <= n <= TARGET_MAX):
            missing.append((name, n, p))
        if "studies have shown" not in p.lower():
            missing.append((name, "studies", p))
    if missing:
        for item in missing[:10]:
            print("FAIL", item[0], item[1])
            print(item[2], "\n")
        raise SystemExit(f"{len(missing)} profile builds failed")

    with SRC.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    assert len(rows) == 150

    fails: list[tuple] = []
    for r in rows:
        name = r["compound_name"]
        if name not in PROFILES:
            fails.append((r["creation_id"], [f"no profile:{name}"], 0, ""))
            continue
        p = build_pitch(name)
        n = wc(p)
        low = p.lower()
        problems: list[str] = []
        if not p.endswith(CTA):
            problems.append("cta")
        if not (TARGET_MIN <= n <= TARGET_MAX):
            problems.append(f"words:{n}")
        if "studies have shown" not in low or "beneficial to" not in low or "recent research studies" not in low:
            problems.append("studies-line")
        if "palm beach pep" not in low:
            problems.append("no-intro")
        for b in BANNED_PHRASES:
            if b in low:
                problems.append(b)
        if problems:
            fails.append((r["creation_id"], problems, n, p))
        r["voice_over"] = p

    if fails:
        for item in fails[:20]:
            print("FAIL", item[0], item[1], item[2])
            print(item[3], "\n")
        raise SystemExit(f"{len(fails)} pitches failed")

    with SRC.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, quoting=csv.QUOTE_ALL)
        w.writeheader()
        w.writerows(rows)

    ghk = next(x for x in rows if x["creation_id"] == "PEP-013")
    print("ok 150")
    print("PEP-013 words", wc(ghk["voice_over"]), "est_sec", round(wc(ghk["voice_over"]) / 2.51, 1))
    print(ghk["voice_over"])
    print("min", min(wc(r["voice_over"]) for r in rows), "max", max(wc(r["voice_over"]) for r in rows))


if __name__ == "__main__":
    main()
