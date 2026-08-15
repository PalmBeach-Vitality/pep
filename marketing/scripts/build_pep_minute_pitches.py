#!/usr/bin/env python3
"""Build easy science pitches: how it works + studies + COA + store CTA.

Measured Pep TTS rate: ~2.51 words/sec.
OmniHuman talking clips cap at ~50s, so 116 words ≈ 46s and 125 words ≈ 50s.
Last sentence: Visit us at palmbeach-vitality.store.
COA line sits immediately before that CTA.
No FDA / unique-set / laboratory-research-use-only.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

SRC = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
CTA = "Visit us at palmbeach-vitality.store."
COA = (
    "Palm Beach Vitality research peptides are backed by a COA with every single order, "
    "American made delivering >99% purity 100% of the time."
)
TARGET = 120
TARGET_MIN = 112
TARGET_MAX = 125

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


def tokens(text: str) -> list[str]:
    return [w for w in text.split() if w]


def wc(s: str) -> int:
    return len(tokens(s))


def studies_line(say: str, benefit: str) -> str:
    return f"Studies have shown {say} has been beneficial to {benefit} in recent research studies."


# say = written product name. science = how it works. benefit = studies-line object.
# extra stays empty so the clip fits the 50s OmniHuman cap.
PROFILES: dict[str, dict[str, str]] = {
    "BPC-157": {
        "say": "BPC-157",
        "science": (
            "BPC-157 is a fifteen-amino-acid chain copied from a protective gastric protein. "
            "Researchers study it as a local repair signal: nitric-oxide and growth-factor talk around gut lining, "
            "tendon, and new blood vessels. Think of it as a short restore-the-neighborhood message, "
            "not a whole-body hormone dump. It is not a steroid."
        ),
        "benefit": "gut lining and tendon-repair research",
        "extra": "Papers follow cytoprotection and tissue-remodeling models after a local insult.",
    },
    "TB-500": {
        "say": "TB-500",
        "science": (
            "TB-500 is a fragment of thymosin beta-4. That protein binds actin, the scaffolding cells use when they move. "
            "This fragment is studied for helping cells migrate into a damaged area and support new vessel growth. "
            "It is a cytoskeleton story, not a stimulant or a steroid."
        ),
        "benefit": "cell-migration and recovery research",
        "extra": "Actin remodeling is why movement papers keep coming back to this fragment. Cells need a track to crawl on.",
    },
    "GHK-Cu": {
        "say": "GHK-Cu",
        "science": (
            "GHK-Cu is a copper-binding tripeptide in plasma. Glycine, histidine, and lysine grab a copper ion. "
            "That complex is researched for resetting gene expression toward repair: more collagen talk, "
            "calmer inflammatory signals, and antioxidant-enzyme activity in skin and connective tissue. "
            "It is a copper-delivery story, not a hormone."
        ),
        "benefit": "collagen remodeling and skin-repair research",
        "extra": "Measured GHK falls with age, which is why remodeling papers watch it.",
    },
    "BPC-157 / TB-500": {
        "say": "BPC-157 and TB-500",
        "science": (
            "Two repair stories, not one blend. BPC-157 is a gastric fragment studied as a local repair signal "
            "for gut lining, tendon, and new vessels. TB-500 is a thymosin beta-4 fragment studied for actin binding, "
            "so cells can crawl into a damaged area. Neighborhood restore plus cell migration. Neither is a steroid."
        ),
        "benefit": "tissue-repair and cell-migration research",
        "extra": "Gastric fragment plus thymosin fragment. Two mechanisms, one shelf.",
    },
    "BPC-157 / TB-500 / GHK-Cu": {
        "say": "BPC-157, TB-500, and GHK-Cu",
        "science": (
            "Three mechanisms. BPC-157 is a gastric repair signal for lining, tendon, and vessels. "
            "TB-500 is studied for actin binding so cells can migrate. "
            "GHK-Cu is a copper tripeptide researched for collagen gene expression. "
            "Protect, crawl, remodel. None of these is a steroid."
        ),
        "benefit": "repair, migration, and collagen research",
        "extra": "Copper is the gene-expression piece. The others are protection and migration.",
    },
    "KPV": {
        "say": "KPV",
        "science": (
            "KPV is the three-amino-acid tip of alpha-MSH. The full hormone can drive pigment. "
            "This short tip is researched for the anti-inflammatory half of melanocortin signaling, "
            "without the tanning half, in gut and skin models. It is a tiny calm-down message, not a steroid."
        ),
        "benefit": "gut and skin inflammation-pathway research",
        "extra": "Labs follow barrier and inflammatory-switch models, not a tanning hormone. Three letters, melanocortin calm-down only.",
    },
    "KPV / BPC-157 / TB-500 / GHK-Cu": {
        "say": "KPV, BPC-157, TB-500, and GHK-Cu",
        "science": (
            "Four letters, four jobs. KPV is a melanocortin calm-down tip. BPC-157 is a gastric repair signal. "
            "TB-500 is an actin-migration fragment. GHK-Cu is copper plus collagen gene expression. "
            "Quiet the noise, restore, crawl, remodel."
        ),
        "benefit": "comfort, repair, migration, and collagen research",
        "extra": "Each piece keeps its own receptor story. Not one mystery hormone. Melanocortin, gastric repair, actin, copper.",
    },
    "CJC (no DAC)": {
        "say": "CJC (no DAC)",
        "science": (
            "CJC with no DAC is a GHRH analog. It binds pituitary receptors and asks for a growth-hormone pulse. "
            "With no drug-affinity complex, it does not hang around for days: a knock, a rise, then back toward the body's rhythm. "
            "GH then tells the liver to talk in IGF-1. Not a steroid, not injecting GH."
        ),
        "benefit": "growth-hormone pulse and recovery research",
        "extra": "",
    },
    "CJC (no DAC)/Ipamorelin": {
        "say": "CJC (no DAC) and Ipamorelin",
        "science": (
            "Two knocks on the pituitary. CJC with no DAC is a GHRH analog that asks for a short GH pulse, then clears. "
            "Ipamorelin is a ghrelin-receptor agonist researched for a selective GH pulse with less cortisol noise. "
            "Together they are studied for a more natural-shaped pulse, then IGF-1. Neither is a steroid."
        ),
        "benefit": "combined growth-hormone pulse research",
        "extra": "GHRH plus ghrelin path. Two knocks, one pituitary.",
    },
    "Ipamorelin": {
        "say": "Ipamorelin",
        "science": (
            "Ipamorelin binds the ghrelin receptor on pituitary cells and asks for a growth-hormone pulse. "
            "Older GHRPs also tugged cortisol and prolactin. This one is researched as the quieter knock: GH up, those axes more still. "
            "The pulse is short. GH then talks to the liver in IGF-1. It is not a steroid and not injecting GH."
        ),
        "benefit": "selective growth-hormone pulse research",
        "extra": "Selectivity is the headline: a GH ask without the older side-axis chatter.",
    },
    "Sermorelin": {
        "say": "Sermorelin",
        "science": (
            "Sermorelin is the first twenty-nine amino acids of growth-hormone-releasing hormone. "
            "That fragment binds GHRH receptors on the pituitary and asks for a GH pulse. "
            "It does not stay around like a DAC analog. Researchers watch a rise, then IGF-1 downstream. "
            "It is not a steroid and not injecting GH."
        ),
        "benefit": "pituitary growth-hormone pulse research",
        "extra": "Same GHRH family as the other releasing analogs, just the original short fragment.",
    },
    "Tesamorelin": {
        "say": "Tesamorelin",
        "science": (
            "Tesamorelin is a stabilized GHRH analog. It binds pituitary GHRH receptors, asks for growth hormone, "
            "and GH tells the liver to raise IGF-1. Clinical literature has watched visceral fat and IGF-1 on this pathway. "
            "It is not a steroid and not a fat-dissolving shot."
        ),
        "benefit": "IGF-1 and visceral-fat research",
        "extra": "Ask the pituitary, follow GH, then follow IGF-1 and body-composition markers. Stabilized GHRH, not a dissolving shot.",
    },
    "AOD-9604": {
        "say": "AOD-9604",
        "science": (
            "AOD-9604 is a tiny fragment from the tail of human growth hormone. "
            "Intact HGH does many jobs. This fragment is researched for the fat-breakdown note, lipolysis signaling in fat cells, "
            "without playing the whole growth-hormone orchestra. It is not a stimulant, not a GLP-1, and not intact HGH."
        ),
        "benefit": "fat-metabolism and lipolysis research",
        "extra": "A fragment story, not full hormone replacement. Tail of HGH, quieter growth axis.",
    },
    "Semaglutide": {
        "say": "Semaglutide",
        "science": (
            "Semaglutide is a GLP-1 receptor agonist, a long-acting copy of the meal hormone GLP-1. "
            "After food, GLP-1 tells the pancreas to release insulin when glucose is high, eases extra liver sugar, "
            "and slows emptying so the brain hears that enough has arrived. Native GLP-1 vanishes in minutes. "
            "This analog stays on that one receptor. It is not a stimulant."
        ),
        "benefit": "appetite and metabolic-marker research",
        "extra": "One receptor, GLP-1: incretin signal, slower emptying, glucose-dependent insulin talk.",
    },
    "Tirzepatide": {
        "say": "Tirzepatide",
        "science": (
            "Tirzepatide talks to two incretin receptors: GIP and GLP-1. "
            "Together they are researched for insulin when glucose is high, for appetite, and for how fat tissue handles energy. "
            "Two meal-hormone knocks, one molecule. It is not a stimulant and not a thyroid drug."
        ),
        "benefit": "dual-incretin metabolic research",
        "extra": "GIP plus GLP-1 is the design. Dual incretin, not a mystery metabolic blend. Two receptors, one coordinated meal talk.",
    },
    "Retatrutide": {
        "say": "Retatrutide",
        "science": (
            "Retatrutide talks to three receptors: GIP, GLP-1, and glucagon. "
            "GIP and GLP-1 are meal hormones for insulin-when-glucose-is-high and appetite. "
            "Glucagon is the third lever, studied for energy spend and how the liver handles fat. "
            "Two knocks say the meal arrived. The third says spend a little more. Not a stimulant stack."
        ),
        "benefit": "triple-agonist metabolic research",
        "extra": "The glucagon piece is what makes this different from dual incretin analogs.",
    },
    "NAD+": {
        "say": "NAD+",
        "science": (
            "NAD+ is the coenzyme cells use to move electrons. Mitochondria use that shuttle to make ATP. "
            "It also feeds sirtuins and PARP enzymes that watch gene expression and DNA-repair talk. "
            "Levels fall with age. It is the redox coin, not caffeine."
        ),
        "benefit": "cellular-energy and mitochondrial research",
        "extra": "Electrons in, ATP out, sirtuins listening. Battery shuttle, not a jittery rush. Redox coin cells spend to keep themselves.",
    },
    "MOTS-C": {
        "say": "MOTS-C",
        "science": (
            "MOTS-C is a short peptide written in mitochondrial DNA, not the cell nucleus. "
            "It is researched for turning on AMPK, the fuel-gauge enzyme, and for cleaner glucose handling. "
            "An exercise-mimetic note from the powerhouses. It is not a stimulant."
        ),
        "benefit": "AMPK and metabolic-homeostasis research",
        "extra": "A stress-and-fuel message from the mitochondria themselves. AMPK on, glucose handled more steadily. Encoded in mtDNA, not the nucleus. Mito-peptide, not thyroid hormone.",
    },
    "SS-31": {
        "say": "SS-31",
        "science": (
            "SS-31 is a mitochondria-targeting tetrapeptide. It binds cardiolipin in the inner membrane "
            "that holds the electron-transport chain together. When that fat is messy, electrons leak. "
            "This peptide is researched for stabilizing the membrane and cleaner ATP. A wrench for the wall, not caffeine."
        ),
        "benefit": "mitochondrial-membrane and bioenergetics research",
        "extra": "The target is cardiolipin. Stamina papers follow membrane integrity, not a jitter score. Inner-membrane wrench, less leak.",
    },
    "Selank": {
        "say": "Selank",
        "science": (
            "Selank is a tuftsin analog. It is researched for GABA-ergic modulation, the brain's main calm-down conversation, "
            "and for cytokine balance on the immune side. A quiet-the-noise peptide, not a sedative shot."
        ),
        "benefit": "calm-focus and GABA-pathway research",
        "extra": "Tuftsin origin is why immune markers show up next to mood-model endpoints. GABA conversation plus cytokine balance. Quiet analog, not alcohol and not a knockout sedative. Calm-focus path on the first listen.",
    },
    "Semax": {
        "say": "Semax",
        "science": (
            "Semax is an ACTH-fragment analog. It is researched for BDNF and NGF talk, the brain-growth-factor conversation "
            "tied to learning, plus dopaminergic modulation. Cognition-model science, not caffeine and not amphetamine."
        ),
        "benefit": "BDNF and cognitive-research endpoints",
        "extra": "The ACTH fragment is stripped of the full stress-hormone job so papers can follow neurotrophins. BDNF, NGF, cognition models. Lights-on research for the mind. One analog, not amphetamine.",
    },
    "Thymosin Alpha-1": {
        "say": "Thymosin Alpha-1",
        "science": (
            "Thymosin Alpha-1 is a twenty-eight amino-acid peptide from the thymus family. "
            "It is researched for T-cell maturation and interferon and cytokine balance. "
            "A coordinator note to adaptive immunity, not an antibiotic and not a steroid."
        ),
        "benefit": "T-cell and immune-balance research",
        "extra": "Thymus-origin peptides are followed for how naive immune cells learn their jobs. T-cell talk, not a random stimulant. Interferon and cytokine balance on the page.",
    },
    "PT-141": {
        "say": "PT-141",
        "science": (
            "PT-141 is a melanocortin-receptor agonist. It talks mainly to MC4 receptors in the brain. "
            "That is a central arousal-pathway story, not the nitric-oxide blood-flow path used by PDE5 compounds. "
            "Brain knock, not plumbing. Not a caffeine stimulant."
        ),
        "benefit": "melanocortin arousal-pathway research",
        "extra": "MC4 is the headline. Melanocortin science, not vessel-dilator science. Central pathway, not blood-vessel plumbing. Desire-model papers watch that brain knock, not a PDE5 story.",
    },
}


def build_pitch(compound_name: str) -> str:
    p = PROFILES[compound_name]
    say = p["say"]
    extra = str(p.get("extra") or "").strip()
    parts = [
        f"Hey, I'm Palm Beach Pep, and today I am talking about {say}.",
        p["science"],
        extra,
        studies_line(say, p["benefit"]),
        COA,
        CTA,
    ]
    pitch = re.sub(r"\s+", " ", " ".join(parts)).strip()
    n = wc(pitch)
    if n < TARGET_MIN:
        raise RuntimeError(f"{compound_name} only {n} words")
    if n > TARGET_MAX:
        raise RuntimeError(f"{compound_name} is {n} words, max {TARGET_MAX}")
    return pitch


def main() -> None:
    missing = []
    for name in PROFILES:
        try:
            p = build_pitch(name)
        except Exception as e:
            missing.append((name, str(e), ""))
            continue
        n = wc(p)
        if not (TARGET_MIN <= n <= TARGET_MAX):
            missing.append((name, n, p))
        if "studies have shown" not in p.lower():
            missing.append((name, "studies", p))
        if COA not in p:
            missing.append((name, "coa", p))
        if not p.endswith(CTA):
            missing.append((name, "cta", p))
        idx_coa = p.find(COA)
        idx_cta = p.find(CTA)
        if not (0 < idx_coa < idx_cta):
            missing.append((name, "coa-before-cta", p))
    if missing:
        for item in missing[:15]:
            print("FAIL", item[0], item[1])
            if item[2]:
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
        if COA not in p:
            problems.append("coa")
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

    cjc = next(x for x in rows if x["compound_name"] == "CJC (no DAC)")
    print("ok 150")
    print("CJC (no DAC)", cjc["creation_id"], "words", wc(cjc["voice_over"]), "est_sec", round(wc(cjc["voice_over"]) / 2.51, 1))
    print(cjc["voice_over"])
    print("min", min(wc(r["voice_over"]) for r in rows), "max", max(wc(r["voice_over"]) for r in rows))
    by_name = {}
    for r in rows:
        by_name[r["compound_name"]] = wc(r["voice_over"])
    for k, v in sorted(by_name.items(), key=lambda kv: kv[1]):
        print(f"  {v:3d}  {k}")


if __name__ == "__main__":
    main()
