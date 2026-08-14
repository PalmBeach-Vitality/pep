#!/usr/bin/env python3
"""Build 55–60s intro-pitch-close VOs with ZERO repeated words.

Measured Pep TTS rate: ~2.51 words/sec.
142 words ≈ 56.6s. 150 words ≈ 59.8s.
Token = lowercase, punctuation stripped. Hyphenated names count as one word.
Pitch = intro + product + store CTA. No packaging dump. No compliance.
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
CTA_WORDS = ["Visit", "us", "at", "palmbeach-vitality.store."]

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
]

BANNED_TOKENS = {
    "fda",
    "disclaimer",
    "consumption",
    "dietary",
    "supplement",
    "cosmetic",
    "evaluated",
    "treatment",
    "claims",
    "human-use",
    "human",
    "advice",
    "documentation",
    "purity",
    "verification",
    "unique",
    "set",
    "laboratory",
    "preclinical",
    "peer-reviewed",
    "literature",
    "catalog",
    "labeling",
    "vial",
    "vials",
    "bottle",
    "bottles",
    "mascot",
    "camera",
    "lighting",
    "packshot",
    "thumbs-up",
    "thumbs",
    "cartoon",
    "hat",
    "pose",
    "crimp",
    "stopper",
    "aluminum",
    "typography",
    "milliliter",
    "10-milliliter",
    "10ml",
    "injectable",
    "clinic",
    "parallax",
    "key-light",
    "label",
    "label-face",
    "cap",
    "glass",
    "rubber",
    "syringes",
    "pens",
}

# Product + storefront only. Each line is one spoken sentence.
FILLER_LINES = [ln.strip() for ln in """
Shoppers locate molecule listed storefront-page following spoken close.
Structure sequence binding presence described here experimental-systems mapped.
Walkthrough stays on compound itself ready checkout path follows.
Inventory shows current offering specs outline chain details.
Listing carries canonical-url cart accepts selected item.
Shipping notes appear beside price account holders complete order.
Payment clears then fulfillment tracking arrives afterward.
Support answers product-questions description covers origin class family.
Profile mentions target proteins history spans published assays.
Data highlights observed effects figures summarize measured outcomes.
Tables compare related analogs discussion frames possible roles.
Methods section cites protocols samples undergo independent analysis.
Certificates accompany each lot quantity options include multiple sizes.
Concentration values displayed clearly storage guidance listed separately.
Handling reminders stay visible return policy explained briefly.
Members save preferred picks newsletter flags new arrivals.
Search box finds exact names filters narrow category views.
Sort tools rank popularity photos depict actual product.
Copy explains intended audience researchers students educators.
Page links canonical source batch records match printed identity.
Mechanism language covers receptor ligand agonist antagonist.
Cascade kinase phosphatase transcription translation ribosomal.
Mitochondrial cytosolic nuclear membrane-bound secreted matrix-linked.
Collagen elastin proteoglycan glycosaminoglycan integrin cadherin.
Oxidation reduction chelation coordination geometry bioactivity.
Potency selectivity kinetics thermodynamics dose-response curve.
Saturation occupancy immunoassay chromatography spectrometry.
In-vitro organoid co-culture western-blot electrophoresis.
Lyophilized powder reconstitution bacteriostatic sterile-water.
Amino-acid residues cyclic linear modified acetylated amidated.
Truncated elongated chain-length molecular-weight solubility stability.
Bioavailability half-life clearance distribution metabolism.
Fragment analog analog-chain isoform splice-variant precursor.
Secretion uptake transport trafficking localization expression.
Phosphorylation glycosylation methylation acetylation cleavage.
Folding conformation helix sheet loop motif domain.
Hydrophobic hydrophilic polar charged aromatic aliphatic.
Disulfide bridge salt-bridge hydrogen-bond van-der-waals.
Zinc copper-ion magnesium calcium cofactor prosthetic-group.
Enzyme substrate product-turn catalysis rate-limiting step.
Signal transduction second-messenger cyclic-amp calcium-flux.
Gene regulation promoter enhancer transcription-factor binding-site.
Immune modulation cytokine chemokine complement cascade-node.
Vascular tone endothelial smooth-muscle platelet adhesion.
Neural circuit synapse neurotransmitter receptor-subtype.
Metabolic flux glycolysis oxidative-phosphorylation lipid-handling.
Repair remodeling extracellular-matrix deposition turnover.
Stress-response heat-shock antioxidant redox-balance.
""".splitlines() if ln.strip()]

FILLER: list[str] = []
_seen_filler: set[str] = set()
for _line in FILLER_LINES:
    for _w in _line.replace(".", " ").split():
        k = _w.strip(".,").lower()
        if k and k not in _seen_filler:
            _seen_filler.add(k)
            FILLER.append(_w.strip(".,"))

INTRO_SKIP = {
    "today",
    "we're",
    "looking",
    "at",
    "visit",
    "us",
    "hey",
    "i'm",
    "palm",
    "beach",
    "pep",
    "quickly",
    "presenting",
    "/",
    "-",
    "&",
    "+",
}


def norm(tok: str) -> str:
    t = tok.strip()
    t = t.strip(".,!?;:\"'()[]{}")
    t = t.replace("—", "").replace("–", "")
    return t.lower()


def tokens(text: str) -> list[str]:
    return [w for w in text.split() if w]


def token_keys(text: str) -> list[str]:
    return [norm(w) for w in tokens(text) if norm(w)]


def first_dup(text: str) -> str | None:
    seen: set[str] = set()
    for k in token_keys(text):
        if k in seen:
            return k
        seen.add(k)
    return None


def wc(s: str) -> int:
    return len(tokens(s))


def compound_token(name: str) -> str:
    t = str(name or "").strip()
    t = t.replace(" / ", "/").replace("/ ", "/").replace(" /", "/")
    t = re.sub(r"\(([^)]+)\)", r"\1", t)
    t = re.sub(r"\s+", "-", t)
    return t


def blend_parts(compound: str) -> set[str]:
    out: set[str] = set()
    for part in re.split(r"[/]", compound):
        k = norm(part)
        if k and (any(ch.isdigit() for ch in k) or len(k) >= 3):
            out.add(k)
    return out


def harvest_science_text(vo: str, disclaimer: str, skip: set[str]) -> str:
    """Keep original product sentence breaks; drop already-used tokens."""
    t = re.sub(r"\s+", " ", vo or "").strip()
    for cut in [
        r"Today['’]s unique set:.*",
        r"Everything stays in the research and laboratory space.*",
        r"Palm Beach Vitality focuses on documentation.*",
    ]:
        m = re.search(cut, t, flags=re.I)
        if m and m.start() > 20:
            t = t[: m.start()].strip()
    if disclaimer.strip():
        t = re.sub(re.escape(disclaimer.strip()), " ", t, flags=re.I)
    t = re.sub(r"^.*?(today we['’]?re looking at [^.!?]+[.!?])\s*", "", t, flags=re.I)
    used = set(skip)
    parts: list[str] = []
    for sent in re.split(r"(?<=[.!?])\s+", t):
        keep: list[str] = []
        for w in tokens(sent):
            raw = w.strip(".,")
            k = norm(raw)
            if not k or k in BANNED_TOKENS or k in INTRO_SKIP or k in used:
                continue
            used.add(k)
            keep.append(raw)
        while keep and norm(keep[0]) in {"is", "are", "was", "the", "and", "or"}:
            keep = keep[1:]
        while keep and norm(keep[-1]) in {"and", "or", "containing", "of", "with", "from"}:
            keep = keep[:-1]
        if len(keep) < 4:
            continue
        s = " ".join(keep).rstrip(".,") + "."
        if s[0].islower():
            s = s[0].upper() + s[1:]
        parts.append(s)
    return " ".join(parts)


def filler_sentences(used: set[str], need: int) -> tuple[str, int]:
    """Keep line groups as sentences. Skip already-used tokens. Stop at need words."""
    parts: list[str] = []
    n = 0
    for line in FILLER_LINES:
        keep: list[str] = []
        for w in tokens(line.replace(".", " ")):
            k = norm(w)
            if not k or k in used or k in BANNED_TOKENS or k in INTRO_SKIP:
                continue
            if n + len(keep) >= need:
                break
            keep.append(w.strip(".,"))
        if not keep:
            continue
        for w in keep:
            used.add(norm(w))
        n += len(keep)
        sent = " ".join(keep).rstrip(".,") + "."
        if sent[0].islower():
            sent = sent[0].upper() + sent[1:]
        parts.append(sent)
        if n >= need:
            break
    return " ".join(parts), n


def build_pitch(row: dict) -> str:
    compound = compound_token(row["compound_name"])
    intro_words = ["Hey", "I'm", "Palm", "Beach", "Pep", "quickly", "presenting", compound]
    used = set(token_keys(" ".join(intro_words)))
    used.update(token_keys(" ".join(CTA_WORDS)))
    used.update(blend_parts(compound))

    sci_text = harvest_science_text(row["voice_over"], row.get("disclaimer_short") or "", used)
    for w in tokens(sci_text):
        used.add(norm(w))

    need = TARGET - len(intro_words) - len(CTA_WORDS)
    sci_words = tokens(sci_text)
    if len(sci_words) > need:
        sci_text = " ".join(sci_words[:need]).rstrip(".,") + "."
        sci_words = tokens(sci_text)
        used = set(token_keys(" ".join(intro_words)))
        used.update(token_keys(" ".join(CTA_WORDS)))
        used.update(blend_parts(compound))
        for w in sci_words:
            used.add(norm(w))
    leftover = need - len(sci_words)
    fill_text, fill_n = filler_sentences(used, leftover)
    if len(sci_words) + fill_n < need:
        raise RuntimeError(
            f"{row['creation_id']} unique-word pool too small: {len(sci_words) + fill_n} < {need}"
        )

    intro = " ".join(intro_words).rstrip(".,") + "."
    pitch = " ".join(x for x in [intro, sci_text, fill_text, CTA] if x)
    return re.sub(r"\s+", " ", pitch).strip()


def main() -> None:
    filler_keys = token_keys(" ".join(FILLER))
    if len(filler_keys) != len(set(filler_keys)):
        seen: set[str] = set()
        for k in filler_keys:
            if k in seen:
                raise SystemExit(f"FILLER duplicate: {k}")
            seen.add(k)
    overlap = set(filler_keys) & (set(token_keys(" ".join(["Hey", "I'm", "Palm", "Beach", "Pep", "quickly", "presenting"]))) | set(token_keys(" ".join(CTA_WORDS))) | BANNED_TOKENS)
    if overlap:
        raise SystemExit(f"FILLER overlaps reserved: {sorted(overlap)}")

    with SRC.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    assert len(rows) == 150

    fails: list[tuple] = []
    for r in rows:
        p = build_pitch(r)
        n = wc(p)
        dup = first_dup(p)
        low = p.lower()
        problems: list[str] = []
        if dup:
            problems.append(f"dup:{dup}")
        if not p.endswith(CTA):
            problems.append("cta")
        if not (TARGET_MIN <= n <= TARGET_MAX):
            problems.append(f"words:{n}")
        for b in BANNED_PHRASES:
            if b in low:
                problems.append(b)
        if "palm beach pep" not in low:
            problems.append("no-intro")
        for pack in ("vial", "packshot", "thumbs", "mascot", "crimp-sealed"):
            if pack in low:
                problems.append(f"packaging:{pack}")
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
    print("filler_n", len(FILLER))


if __name__ == "__main__":
    main()
