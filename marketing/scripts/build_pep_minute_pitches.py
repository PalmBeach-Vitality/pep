#!/usr/bin/env python3
"""Build easy science pitches: how it works + studies + COA + store CTA.

Measured Pep TTS rate: ~2.51 words/sec.
175 words ≈ 70s. 205 words ≈ 82s.
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
TARGET = 180
TARGET_MIN = 154
TARGET_MAX = 230

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
# extra = optional extra science if the base pitch is short.
PROFILES: dict[str, dict[str, str]] = {
    "BPC-157": {
        "say": "BPC-157",
        "science": (
            "BPC-157 is a synthetic fifteen-amino-acid chain copied from a protective protein in gastric juice. "
            "In simple terms, researchers study it as a local repair signal. "
            "It is watched for turning on pathways that help new blood vessels form, for nitric-oxide signaling, "
            "and for growth-factor talk around gut lining, tendon, and muscle tissue. "
            "Think of it as a short message the body already knows how to read: restore the neighborhood, "
            "not a whole-body hormone dump. It does not act like a steroid, and it is not a painkiller. "
            "The science is cytoprotection and tissue remodeling in lab and animal models."
        ),
        "benefit": "gut lining and tendon-repair research",
        "extra": "Papers also follow nitric-oxide and VEGF talk after a tissue insult, because those are the restore-the-neighborhood checkpoints. That is the whole walkthrough: a short gastric fragment, a local repair signal, and a research trail in gut and tendon models.",
    },
    "TB-500": {
        "say": "TB-500",
        "science": (
            "TB-500 is the research name for a fragment of thymosin beta-4. "
            "Thymosin beta-4 binds actin, the protein cells use as scaffolding when they move. "
            "In simple terms, this fragment is studied for helping cells migrate into a damaged area, "
            "building new actin structures, and supporting new blood-vessel growth. "
            "That is why movement and recovery research keeps coming back to it. "
            "It is not a stimulant and it is not a steroid. It is a cytoskeleton-and-migration story: "
            "cells need a track to crawl on, and this peptide is researched for laying that track."
        ),
        "benefit": "cell-migration and recovery research",
        "extra": "Researchers also watch flexibility and repair models because actin remodeling sits at the center of how tissue rebuilds. So the pitch stays simple: bind actin, help cells crawl, support new vessels, follow the recovery models.",
    },
    "GHK-Cu": {
        "say": "GHK-Cu",
        "science": (
            "GHK-Cu is a naturally occurring copper-binding tripeptide found in plasma. "
            "The three amino acids glycine, histidine, and lysine grab a copper ion. "
            "That copper-peptide complex is researched for resetting gene expression toward repair: "
            "more collagen and glycosaminoglycan talk, calmer inflammatory signals, and antioxidant-enzyme activity "
            "in skin and connective tissue. As we age, measured GHK levels fall, which is why remodeling papers watch it closely. "
            "It is not a cream filler and it is not a hormone. It is a copper-delivery and gene-expression story."
        ),
        "benefit": "collagen remodeling and skin-repair research",
        "extra": "Studies also follow wound-matrix and antioxidant gene changes after the copper tripeptide binds its target. The walkthrough is glycine-histidine-lysine plus copper, then gene expression toward repair, then the skin-remodeling papers.",
    },
    "BPC-157 / TB-500": {
        "say": "BPC-157 and TB-500",
        "science": (
            "This pairing puts two repair stories on the same shelf. "
            "BPC-157 is a fifteen-amino-acid gastric fragment researched as a local cytoprotective signal "
            "for gut lining, tendon, and blood-vessel growth-factor talk. "
            "TB-500 is a thymosin beta-4 fragment researched for actin binding, which is how cells crawl "
            "into a damaged area and rebuild scaffolding. "
            "Together they are studied as a neighborhood-restore peptide plus a cell-migration peptide. "
            "Neither is a steroid. The science is tissue signaling, not a stimulant rush."
        ),
        "benefit": "tissue-repair and cell-migration research",
        "extra": "Labs watch the pair because one story is local protection and the other is cytoskeleton remodeling. You get the gastric fragment plus the thymosin fragment, two mechanisms, one shelf.",
    },
    "BPC-157 / TB-500 / GHK-Cu": {
        "say": "BPC-157, TB-500, and GHK-Cu",
        "science": (
            "This trio stacks three repair languages. "
            "BPC-157 is studied as a gastric-derived local repair signal for lining, tendon, and new vessels. "
            "TB-500 is studied for actin binding so cells can migrate and rebuild scaffolding. "
            "GHK-Cu is a copper-binding tripeptide researched for turning gene expression toward collagen "
            "and calmer inflammatory talk in skin and connective tissue. "
            "In simple terms: protect the neighborhood, help cells crawl in, then remodel the matrix. "
            "None of these is a steroid or a stimulant."
        ),
        "benefit": "repair, migration, and collagen-remodeling research",
        "extra": "The copper tripeptide is the gene-expression piece. The other two are the migration and cytoprotection pieces. That is three mechanisms named out loud, not a vague wellness blend.",
    },
    "KPV": {
        "say": "KPV",
        "science": (
            "KPV is the three-amino-acid tip of alpha-MSH, written lysine-proline-valine. "
            "Alpha-MSH talks to melanocortin receptors. The full hormone can also drive pigment. "
            "This short tip is researched for the anti-inflammatory half of that conversation without the tanning half. "
            "In simple terms, it is studied as a calm-down signal in gut and skin models: less noisy cytokine talk, "
            "more comfortable barrier research. It is not a steroid cream and it is not a full MSH hormone. "
            "It is a tiny melanocortin-pathway message."
        ),
        "benefit": "gut and skin inflammation-pathway research",
        "extra": "Papers follow inflammatory-switch and barrier models because those are the quiet-the-noise checkpoints. So KPV is a three-letter melanocortin message, not a full tanning hormone and not a steroid.",
    },
    "KPV / BPC-157 / TB-500 / GHK-Cu": {
        "say": "KPV, BPC-157, TB-500, and GHK-Cu",
        "science": (
            "This four-peptide mix is four different letters, not one mystery blend. "
            "KPV is a short alpha-MSH tip researched for melanocortin anti-inflammatory signaling in gut and skin models. "
            "BPC-157 is a gastric fragment studied as a local repair and vessel-growth signal. "
            "TB-500 is a thymosin beta-4 fragment studied for actin binding and cell migration. "
            "GHK-Cu is a copper tripeptide studied for collagen gene expression. "
            "In simple terms: quiet the noise, restore the neighborhood, help cells crawl, remodel the matrix."
        ),
        "benefit": "comfort, repair, migration, and collagen research",
        "extra": "Each piece keeps its own receptor story rather than acting like one giant hormone. You can follow all four on the first listen: melanocortin calm, gastric repair, actin migration, copper remodeling.",
    },
    "CJC (no DAC)": {
        "say": "CJC (no DAC)",
        "science": (
            "CJC with no DAC is a growth-hormone-releasing hormone analog. "
            "In simple terms, it is a short copy of the knock your hypothalamus already uses to talk to the pituitary gland, "
            "the small control center that decides when to release growth hormone. "
            "This analog binds GHRH receptors on those pituitary cells and asks for a pulse. "
            "Because this version has no drug-affinity complex, it does not hang around for days. "
            "Researchers watch a knock, a rise, then a return toward the body's own rhythm. "
            "Growth hormone then tells the liver to talk in IGF-1, a messenger studied for recovery and body-composition work. "
            "It is not a steroid, and it is not injecting growth hormone itself. "
            "It is a researched way to ask the pituitary for a natural-shaped pulse."
        ),
        "benefit": "growth-hormone pulse and recovery research",
        "extra": "",
    },
    "CJC (no DAC)/Ipamorelin": {
        "say": "CJC (no DAC) and Ipamorelin",
        "science": (
            "This pair uses two different knocks on the pituitary. "
            "CJC with no DAC is a GHRH analog: it binds growth-hormone-releasing-hormone receptors and asks for a short GH pulse, "
            "then clears because it has no drug-affinity complex. "
            "Ipamorelin is a ghrelin-receptor agonist, a GHRP, researched for a selective GH pulse with less cortisol and prolactin noise "
            "than older GHRPs. "
            "Together they are studied because GHRH plus the ghrelin path can amplify a more natural-shaped pulse, "
            "then IGF-1 downstream. Neither is a steroid. Neither is exogenous growth hormone."
        ),
        "benefit": "combined growth-hormone pulse research",
        "extra": "Labs like the pair because one analog starts the GHRH conversation and the other starts the ghrelin conversation. Two knocks, one pituitary, a researched pulse, then IGF-1 downstream.",
    },
    "Ipamorelin": {
        "say": "Ipamorelin",
        "science": (
            "Ipamorelin is a selective growth-hormone secretagogue. "
            "It binds the ghrelin receptor, also called GHS-R1a, on pituitary cells and asks for a pulse of growth hormone. "
            "Older GHRPs were less picky and could tug cortisol and prolactin too. "
            "Ipamorelin is researched as the quieter knock: GH up, those other axes more still. "
            "The pulse is short. Growth hormone then talks to the liver in IGF-1, which recovery and body-composition papers follow. "
            "It is not a steroid, not caffeine, and not injecting GH itself. It is a ghrelin-receptor pulse story."
        ),
        "benefit": "selective growth-hormone pulse research",
        "extra": "Selectivity is the headline: a GH ask without the messy side-axis chatter of earlier secretagogues. Ghrelin receptor, short pulse, IGF-1 follow-through. That is the whole scientific walkthrough.",
    },
    "Sermorelin": {
        "say": "Sermorelin",
        "science": (
            "Sermorelin is the first twenty-nine amino acids of growth-hormone-releasing hormone. "
            "That fragment is enough to bind GHRH receptors on the pituitary and ask for a growth-hormone pulse. "
            "In simple terms, it is the classic short analog of the brain's own GH knock. "
            "It does not stay around like a long-acting DAC analog. Researchers watch a rise, then a return to the body's rhythm, "
            "and they follow IGF-1 downstream. It is not a steroid and it is not exogenous growth hormone. "
            "It is a pituitary-ask story, the same family as other GHRH analogs, just the original short fragment."
        ),
        "benefit": "pituitary growth-hormone pulse research",
        "extra": "Because it is short-acting, papers treat it as a physiologic pulse tool rather than a constant infusion. Same GHRH receptor family as the other releasing analogs, just the original short fragment.",
    },
    "Tesamorelin": {
        "say": "Tesamorelin",
        "science": (
            "Tesamorelin is a stabilized analog of growth-hormone-releasing hormone. "
            "It binds GHRH receptors on the pituitary, asks for growth hormone, and that GH tells the liver to raise IGF-1. "
            "The extra design work is about lasting long enough to be studied as a steady GHRH signal, "
            "not about injecting growth hormone itself. "
            "Clinical literature has watched visceral fat and IGF-1 because those are measurable endpoints on this pathway. "
            "It is not a steroid and it is not a fat-dissolving injection. It is a pituitary GHRH-receptor story with a midsection research trail."
        ),
        "benefit": "IGF-1 and visceral-fat research",
        "extra": "The mechanism stays upstream: ask the pituitary, then follow GH and IGF-1, then follow body-composition markers. Stabilized GHRH analog, not a fat-dissolving shot and not a steroid.",
    },
    "AOD-9604": {
        "say": "AOD-9604",
        "science": (
            "AOD-9604 is a tiny fragment from the tail of human growth hormone, around the 177 to 191 region, with a tyrosine cap. "
            "Intact growth hormone does many jobs, including IGF-1 and blood-sugar talk. "
            "This fragment is researched for the fat-breakdown note without playing the whole orchestra. "
            "In simple terms, labs watch lipolysis signaling in fat cells, including beta-3 adrenergic conversation, "
            "while the broader growth axis stays quieter than full HGH. "
            "It is not a stimulant, not a GLP-1, and not intact growth hormone. It is a targeted fat-metabolism fragment."
        ),
        "benefit": "fat-metabolism and lipolysis research",
        "extra": "That is why metabolic papers treat it as a fragment story, not a full hormone-replacement story. Tail of HGH, lipolysis note, quieter growth axis. Easy science on the first listen.",
    },
    "Semaglutide": {
        "say": "Semaglutide",
        "science": (
            "Semaglutide is a GLP-1 receptor agonist, a long-acting copy of the incretin hormone GLP-1. "
            "After a meal, GLP-1 tells the pancreas to release insulin when glucose is already high, "
            "tells the liver to ease off extra sugar output, and tells the brain and stomach that enough food has arrived, "
            "so emptying slows. Native GLP-1 vanishes in minutes. Semaglutide is built to stay on that receptor. "
            "Research follows appetite, glycemic markers, and body-weight endpoints because those are the incretin outputs. "
            "It is not a stimulant and it is not a thyroid hormone. It is one receptor, the GLP-1 receptor, spoken clearly."
        ),
        "benefit": "appetite and metabolic-marker research",
        "extra": "The simple chain is receptor, incretin signal, slower emptying, glucose-dependent insulin talk. One receptor, GLP-1, spoken the whole way through so the pitch does not turn vague after half a minute.",
    },
    "Tirzepatide": {
        "say": "Tirzepatide",
        "science": (
            "Tirzepatide is a dual incretin agonist. It talks to the GIP receptor and the GLP-1 receptor. "
            "GIP is glucose-dependent insulinotropic polypeptide. GLP-1 is the better-known meal hormone. "
            "Together they are researched for insulin when glucose is high, for appetite, and for how fat tissue handles energy. "
            "In simple terms, it is two meal-hormone knocks instead of one. "
            "It is not a stimulant and it is not a thyroid drug. "
            "The science is dual-incretin signaling, which is why metabolic papers compare it with single GLP-1 analogs."
        ),
        "benefit": "dual-incretin metabolic research",
        "extra": "GIP plus GLP-1 is the whole design: two receptors, one molecule, one coordinated meal-hormone conversation. Dual incretin, not a mystery metabolic blend. You keep hearing GIP and GLP-1 through the close, not a vague wellness fade.",
    },
    "Retatrutide": {
        "say": "Retatrutide",
        "science": (
            "Retatrutide is a triple agonist. It talks to GIP, GLP-1, and glucagon receptors. "
            "GIP and GLP-1 are incretin meal hormones researched for insulin-when-glucose-is-high and for appetite. "
            "The glucagon receptor is the third lever, studied for energy expenditure and how the liver handles fat. "
            "In simple terms, two knocks say the meal has arrived, and the third knock says spend a little more energy. "
            "It is not a stimulant stack. It is one molecule aimed at three metabolic receptors, which is why newer papers watch it closely."
        ),
        "benefit": "triple-agonist metabolic research",
        "extra": "The glucagon piece is what makes this different from dual GIP and GLP-1 analogs. Three receptors, one molecule, energy-spend plus meal-hormone talk. That is the retatrutide walkthrough all the way to the close.",
    },
    "NAD+": {
        "say": "NAD+",
        "science": (
            "NAD+ is nicotinamide adenine dinucleotide, a coenzyme every cell uses to move electrons. "
            "In simple terms, it is the shuttle mitochondria use while they make ATP, the cell's spendable energy. "
            "It also feeds sirtuins and PARP enzymes that watch gene expression and DNA-repair talk. "
            "Measured NAD+ falls with age, which is why metabolic and redox papers follow it. "
            "It is not caffeine and it is not a stimulant. It is the redox coin cells spend to make energy and maintain themselves. "
            "Raise the coin, and researchers watch cellular energy, mitochondrial function, and recovery markers."
        ),
        "benefit": "cellular-energy and mitochondrial research",
        "extra": "Think battery shuttle, not a jittery rush: electrons in, ATP out, sirtuins listening. That is NAD-plus in one walkthrough: redox coin, mitochondria, repair enzymes.",
    },
    "MOTS-C": {
        "say": "MOTS-C",
        "science": (
            "MOTS-C is a mitochondrial-encoded peptide, a short message written in mtDNA, not in the cell nucleus. "
            "It is researched for turning on AMPK, the fuel-gauge enzyme cells use when energy is tight, "
            "and for folate-cycle and AICAR-related metabolic talk. "
            "In simple terms, it is studied as an exercise-mimetic metabolic note from the mitochondria themselves: "
            "spend fuel more cleanly, handle glucose more steadily. "
            "It is not a stimulant and it is not a thyroid hormone. It is a mito-peptide with an AMPK story."
        ),
        "benefit": "AMPK and metabolic-homeostasis research",
        "extra": "Because it is encoded in mitochondria, papers treat it as a stress-and-fuel message from the powerhouses. AMPK on, fuel handled more cleanly, metabolic-homeostasis models on the page.",
    },
    "SS-31": {
        "say": "SS-31",
        "science": (
            "SS-31, also studied as elamipretide, is a mitochondria-targeting tetrapeptide. "
            "It binds cardiolipin, a special fat in the inner mitochondrial membrane that holds the electron-transport chain together. "
            "When cardiolipin is messy, electrons leak and extra reactive oxygen shows up. "
            "SS-31 is researched for stabilizing that membrane, keeping ATP production cleaner, and lowering that leak. "
            "In simple terms, it is a wrench for the powerhouse wall, not a caffeine spark. "
            "It is not a stimulant. It is a bioenergetics and cardiolipin story."
        ),
        "benefit": "mitochondrial-membrane and bioenergetics research",
        "extra": "The target is cardiolipin, which is why stamina papers follow membrane integrity instead of a jitter score. Inner-membrane wrench, cleaner electron transport, less leak. That is the SS-31 walkthrough.",
    },
    "Selank": {
        "say": "Selank",
        "science": (
            "Selank is a synthetic heptapeptide built from tuftsin, an immune-related fragment. "
            "It is researched for GABA-ergic modulation, which is the brain's main calm-down neurotransmitter conversation, "
            "and for cytokine balance on the immune side. "
            "In simple terms, labs watch anxiety-model behavior and enkephalin-breakdown enzymes because those sit on the calm-focus path. "
            "It is not a sedative shot and it is not alcohol. It is a tuftsin analog with a quiet-the-noise plus immune-talk story."
        ),
        "benefit": "calm-focus and GABA-pathway research",
        "extra": "The tuftsin origin is why immune markers show up next to the mood-model endpoints. GABA conversation, cytokine balance, calm-focus research. Easy to follow on the first listen. Selank is the quiet analog: same family as tuftsin, aimed at the calm-down pathway.",
    },
    "Semax": {
        "say": "Semax",
        "science": (
            "Semax is a synthetic analog of a fragment of ACTH, the pituitary peptide. "
            "It is researched for raising BDNF and NGF talk, the brain-growth-factor conversation tied to learning and plasticity, "
            "and for dopaminergic and serotonergic modulation. "
            "In simple terms, papers watch cognition and neuroprotection models because neurotrophins are how neurons keep their wiring sharp. "
            "It is not caffeine and it is not amphetamine. It is an ACTH-fragment analog with a neurotrophin story."
        ),
        "benefit": "BDNF and cognitive-research endpoints",
        "extra": "The ACTH fragment is stripped of the full stress-hormone job so the research can follow brain-factor signaling. BDNF, NGF, cognition models. That is Semax without turning into a textbook. One analog, neurotrophin talk, lights-on research for the mind.",
    },
    "Thymosin Alpha-1": {
        "say": "Thymosin Alpha-1",
        "science": (
            "Thymosin Alpha-1 is a twenty-eight amino-acid peptide from prothymosin alpha, originally studied from the thymus. "
            "It is researched for T-cell maturation and for balancing immune signaling, including interferon and cytokine talk. "
            "In simple terms, it is a coordinator note to the adaptive immune system: train the T-cell conversation, "
            "do not dump a random stimulant into the bloodstream. "
            "It is not an antibiotic and it is not a steroid. It is an immune-modulation peptide with a T-cell research trail."
        ),
        "benefit": "T-cell and immune-balance research",
        "extra": "Thymus-origin peptides are followed for how naive immune cells learn their jobs. T-cell maturation, interferon talk, immune-balance models. Coordinator note, not a random stimulant. That is Thymosin Alpha-1 in one simple walkthrough.",
    },
    "PT-141": {
        "say": "PT-141",
        "science": (
            "PT-141, also studied as bremelanotide, is a melanocortin-receptor agonist that came out of melanotan chemistry. "
            "It talks mainly to MC3 and MC4 receptors in the central nervous system. "
            "That is a brain-pathway spark for arousal research, not the nitric-oxide blood-flow path used by PDE5 compounds. "
            "In simple terms: it is a melanocortin knock in the brain, not a plumbing knock in blood vessels. "
            "It is not a stimulant like caffeine. It is a central melanocortin story, which is why desire-model papers watch it."
        ),
        "benefit": "melanocortin arousal-pathway research",
        "extra": "MC4 receptor activity is the headline, which is why this is grouped with melanocortin science, not vessel-dilator science. Brain pathway, not plumbing. That is the PT-141 walkthrough.",
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
