#!/usr/bin/env python3
"""20 × 60s human Pep scripts. Review-only. Do not write the live 30s sheet.

140–150 words ≈ 56–60s at 2.51 wps. Mint only if Sal asks for 720p or a stitched pair.
Human Script Agent: marketing/HUMAN_SCRIPT_AGENT.md
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path("/workspace/marketing")
sys.path.insert(0, str(ROOT / "scripts"))

from build_20_pep_scenes import SCENES_DATA  # noqa: E402
from human_script_lib import (  # noqa: E402
    CTA,
    COA,
    WPS,
    assemble,
    first_sentence,
    lint_script,
    wc,
)

REVIEW = ROOT / "n8n-pep-60s-human-vo.md"

# Longer science for the 60s pass. Same unique hooks as the 30s sheet.
SCIENCE_60 = {
    "PEP-001": (
        "BPC-157 is a fifteen-amino-acid chain copied from a protective gastric protein. "
        "Labs study it as a local repair signal: nitric-oxide and growth-factor talk around gut lining, "
        "tendon, and new blood vessels. A short restore-the-neighborhood message. "
        "Papers follow cytoprotection and tissue-remodeling models after a local insult. "
        "If you keep one picture, keep neighborhood repair. Gut lining. Tendon. New vessels. "
        "A local message, walking these planks. That is the whole job on the page."
    ),
    "PEP-002": (
        "TB-500 is a fragment of thymosin beta-4. That protein binds actin, the scaffolding cells use when they move. "
        "This fragment is studied for helping cells migrate into a damaged area and support new vessel growth. "
        "It is a cytoskeleton story. Actin remodeling is why movement papers keep coming back to this fragment. "
        "Cells need a track to crawl on. That is what labs watch. I'm jogging this turf because the story is motion. "
        "Scaffold. Crawl. Repair zone. Hold that."
    ),
    "PEP-003": (
        "GHK-Cu is a copper-binding tripeptide in plasma. Glycine, histidine, and lysine grab a copper ion. "
        "That complex is researched for resetting gene expression toward repair: more collagen talk, "
        "calmer inflammatory signals, and antioxidant-enzyme activity in skin and connective tissue. "
        "Measured GHK falls with age, which is why remodeling papers watch it. Copper-delivery story. "
        "Three letters, one ion, collagen talk. Petals can fall. The copper story stays."
    ),
    "PEP-004": (
        "Semaglutide is a GLP-1 receptor agonist, a long-acting copy of the meal hormone GLP-1. "
        "After food, GLP-1 tells the pancreas to release insulin when glucose is high, eases extra liver sugar, "
        "and slows emptying so the brain hears that enough has arrived. Native GLP-1 vanishes in minutes. "
        "This analog stays on that one receptor. Incretin signal. Slower emptying. Glucose-dependent insulin talk. "
        "One receptor. GLP-1. Keep the pace and keep the mechanism that simple."
    ),
    "PEP-005": (
        "Tirzepatide talks to two incretin receptors: GIP and GLP-1. "
        "Together they are researched for insulin when glucose is high, for appetite, and for how fat tissue handles energy. "
        "Two meal-hormone knocks, one molecule. Dual incretin design. Two receptors, one coordinated meal talk. "
        "That is the map labs follow. GIP plus GLP-1. Named receptors, named jobs. "
        "The water can crash. The mechanism stays two knocks."
    ),
    "PEP-006": (
        "Retatrutide talks to three receptors: GIP, GLP-1, and glucagon. "
        "GIP and GLP-1 are meal hormones for insulin-when-glucose-is-high and appetite. "
        "Glucagon is the third lever, studied for energy spend and how the liver handles fat. "
        "Two knocks say the meal arrived. The third says spend a little more. "
        "The glucagon piece is what makes this different from dual incretin analogs. "
        "Cliff trail. Three receptors. Count them once and you're done."
    ),
    "PEP-007": (
        "AOD-9604 is a tiny fragment from the tail of human growth hormone. "
        "Intact HGH does many jobs. This fragment is researched for the fat-breakdown note, "
        "lipolysis signaling in fat cells, while the rest of the growth-hormone orchestra stays quiet. "
        "A fragment story. Tail of HGH. Quieter growth axis. Labs follow lipolysis in fat-cell models. "
        "Morning miles. One fragment. One note. That is AOD."
    ),
    "PEP-008": (
        "Semax is an ACTH-fragment analog. It is researched for BDNF and NGF talk, "
        "the brain-growth-factor conversation tied to learning, plus dopaminergic modulation. "
        "The ACTH fragment is stripped of the full stress-hormone job so papers can follow neurotrophins. "
        "BDNF, NGF, cognition models. Lights-on research for the mind. One analog. One pathway to watch. "
        "Wildflowers can wait. The learning-signal story is the reason this clip exists."
    ),
    "PEP-009": (
        "Selank is a tuftsin analog. It is researched for GABA-ergic modulation, "
        "the brain's main calm-down conversation, and for cytokine balance on the immune side. "
        "Tuftsin origin is why immune markers show up next to mood-model endpoints. "
        "GABA conversation plus cytokine balance. Quiet analog. Calm-focus path on the first listen. "
        "Water's still for a reason. This is the quiet peptide. Listen once."
    ),
    "PEP-010": (
        "Ipamorelin binds the ghrelin receptor on pituitary cells and asks for a growth-hormone pulse. "
        "Older GHRPs also tugged cortisol and prolactin. This one is researched as the quieter knock: "
        "GH up, those axes more still. The pulse is short. GH then talks to the liver in IGF-1. "
        "Selectivity is the headline: a GH ask without the older side-axis chatter. "
        "Gym daylight. Short pulse. Then the liver hears IGF-1. That is the walk."
    ),
    "PEP-011": (
        "CJC with no DAC is a GHRH analog. It binds pituitary receptors and asks for a growth-hormone pulse. "
        "With no drug-affinity complex, it does not hang around for days: a knock, a rise, then back toward the body's rhythm. "
        "GH then tells the liver to talk in IGF-1. Same GHRH family as the other releasing analogs. "
        "Short pulse. Then clear. That is the shape labs watch. Iron. Wood. A knock, a rise, a clear. "
        "No DAC means it does not camp out."
    ),
    "PEP-012": (
        "Tesamorelin is a stabilized GHRH analog. It binds pituitary GHRH receptors, asks for growth hormone, "
        "and GH tells the liver to raise IGF-1. Clinical literature has watched visceral fat and IGF-1 on this pathway. "
        "Ask the pituitary, follow GH, then follow IGF-1 and body-composition markers. "
        "Stabilized GHRH. That is the trail from this mesa to the papers. Warm sandstone. Same ask every step. "
        "Pituitary. GH. IGF-1. Markers. In that order."
    ),
    "PEP-013": (
        "KPV is the three-amino-acid tip of alpha-MSH. The full hormone can drive pigment. "
        "This short tip is researched for the anti-inflammatory half of melanocortin signaling "
        "in gut and skin models. A tiny calm-down message. Labs follow barrier and inflammatory-switch models. "
        "Three letters. Melanocortin calm-down only. That is the half they measure. "
        "Ferns in the mist. Barrier models. Skin models. Keep the tanning hormone out of the sentence."
    ),
    "PEP-014": (
        "NAD+ is the coenzyme cells use to move electrons. Mitochondria use that shuttle to make ATP. "
        "It also feeds sirtuins and PARP enzymes that watch gene expression and DNA-repair talk. "
        "Levels fall with age. Electrons in, ATP out, sirtuins listening. "
        "Battery shuttle. Redox coin cells spend to keep themselves. That is the whole NAD story on this bike. "
        "Cadence is a joke. The shuttle is the point. Electrons move. ATP gets made."
    ),
    "PEP-015": (
        "Two repair stories. BPC-157 is a gastric fragment studied as a local repair signal "
        "for gut lining, tendon, and new vessels. TB-500 is a thymosin beta-4 fragment studied for actin binding, "
        "so cells can crawl into a damaged area. Neighborhood restore plus cell migration. "
        "Gastric fragment plus thymosin fragment. Two mechanisms. One shelf. That is the pair. "
        "Ropes can stay on the turf. Local restore. Crawl path. Two jobs. Say them in that order."
    ),
    "PEP-016": (
        "Three mechanisms. BPC-157 is a gastric repair signal for lining, tendon, and vessels. "
        "TB-500 is studied for actin binding so cells can migrate. "
        "GHK-Cu is a copper tripeptide researched for collagen gene expression. "
        "Protect, crawl, remodel. Copper is the gene-expression piece. The others are protection and migration. "
        "Lantern light is just the set. Three jobs. Keep copper last so collagen has somewhere to land."
    ),
    "PEP-017": (
        "MOTS-C is a short peptide written in mitochondrial DNA, not the cell nucleus. "
        "It is researched for turning on AMPK, the fuel-gauge enzyme, and for cleaner glucose handling. "
        "An exercise-mimetic note from the powerhouses. A stress-and-fuel message from the mitochondria themselves. "
        "AMPK on, glucose handled more steadily. Encoded in mtDNA. Mito-peptide. "
        "Brick loft. Medicine balls. The message still comes from the mitochondria, not the nucleus."
    ),
    "PEP-018": (
        "Two knocks on the pituitary. CJC with no DAC is a GHRH analog that asks for a short GH pulse, then clears. "
        "Ipamorelin is a ghrelin-receptor agonist researched for a selective GH pulse with less cortisol noise. "
        "Together they are studied for a more natural-shaped pulse, then IGF-1. "
        "GHRH plus ghrelin path. Two knocks, one pituitary. That is the stack. "
        "Assault bike stays in the shot. CJC asks. Ipamorelin knocks. Pulse, then IGF-1."
    ),
    "PEP-019": (
        "SS-31 is a mitochondria-targeting tetrapeptide. It binds cardiolipin in the inner membrane "
        "that holds the electron-transport chain together. When that fat is messy, electrons leak. "
        "This peptide is researched for stabilizing the membrane and cleaner ATP. "
        "The target is cardiolipin. Stamina papers follow membrane integrity. Inner-membrane wrench. Less leak. "
        "Canvas corner. Keep shuffling. The wrench is for the wall of the mitochondrion, and that is the whole clip."
    ),
    "PEP-020": (
        "Sermorelin is the first twenty-nine amino acids of growth-hormone-releasing hormone. "
        "That fragment binds GHRH receptors on the pituitary and asks for a GH pulse. "
        "It does not stay around like a DAC analog. Researchers watch a rise, then IGF-1 downstream. "
        "Same GHRH family as the other releasing analogs, just the original short fragment. "
        "Ask. Pulse. Clear. Mist on the lake. Original fragment. That is sermorelin, said once."
    ),
}


# Unique ~20-word spoken beat so 60s hits 140–150 without cloning the 30s closer.
BEAT_60 = {
    "PEP-001": "Researchers keep coming back to lining and tendon after a local insult. That is the paper trail. Hear it once.",
    "PEP-002": "If the cell cannot crawl, the repair zone stays empty. Actin is the track. I'm still jogging.",
    "PEP-003": "Collagen talk is the headline. Copper is the delivery. Age drops measured GHK, so papers keep watching that drop.",
    "PEP-004": "Native GLP-1 is gone in minutes. This analog stays. Insulin when sugar is high. That is the meal talk.",
    "PEP-005": "Name the receptors. GIP. GLP-1. One molecule knocks both. That is tirzepatide, said without a brochure. Two knocks. One walk along this crashing water. Stay with me.",
    "PEP-006": "Dual incretin stops at two. This one adds glucagon for energy spend. Three levers. One analog. Keep hiking. Count three.",
    "PEP-007": "Labs follow lipolysis in fat-cell models. Fragment of the tail. The rest of HGH stays off this page. One note. Morning miles. That's the fragment.",
    "PEP-008": "Neurotrophins first. BDNF. NGF. Cognition models. That is Semax without caffeine in the sentence. Learning signal. Keep moving through the meadow. Lights on now.",
    "PEP-009": "Mood-model endpoints sit next to immune markers because tuftsin started this analog. Quiet on purpose. Deck still. GABA first. Easy morning on this water deck.",
    "PEP-010": "Older GHRPs made more noise on cortisol. This knock is researched as the quieter GH ask. Short pulse.",
    "PEP-011": "No DAC means a short visit. Knock. Rise. Back toward rhythm.",
    "PEP-012": "Body-composition markers sit downstream of IGF-1. Follow that order and the mesa hike makes sense. Pituitary first. Then GH.",
    "PEP-013": "Pigment is the other half of alpha-MSH. This clip only carries the calm-inflammation tip. Three letters. Gut and skin models. That's KPV.",
    "PEP-014": "Sirtuins listen. PARP listens. The shuttle still has to move electrons or ATP does not get made.",
    "PEP-015": "Say gastric fragment, then thymosin fragment. Restore, then crawl. Two stories. I will not mash them.",
    "PEP-016": "Protect, crawl, remodel. That order is the stack. Copper last so collagen has a job at the end. Three jobs. Lanterns stay.",
    "PEP-017": "Nucleus DNA does not write this one. Mitochondria do. AMPK is the gauge. That is MOTS-C. Fuel message. Keep jogging this loft. AMPK on.",
    "PEP-018": "GHRH analog plus ghrelin agonist. Two knocks, one gland. Natural-shaped pulse is the reason they sit together.",
    "PEP-019": "Cardiolipin is the fat in the wall. Messy wall, leaky electrons. This tetrapeptide is researched as the tidy-up. Keep shuffling. Canvas holds.",
    "PEP-020": "Twenty-nine amino acids. Original GHRH fragment. Ask the pituitary. Watch the rise. Then IGF-1. Dock done. Original fragment. Mist holds. Ask once.",
}


def pitch_60(s: dict) -> str:
    cid = s["creation_id"]
    science = f"{SCIENCE_60[cid]} {BEAT_60[cid]}"
    return assemble(s["hook"], science, s["say"], s["benefit"])


def main() -> None:
    lines = [
        "# 20 × 60s human Pep scripts — review only",
        "",
        "Do **not** import this into the live `150-pb-pep-scenes` tab. Live talking clips stay **30s / 65–74 words / 1080p**.",
        "These 60s scripts are for a later 720p mint or a two-clip stitch if Sal asks.",
        "",
        f"Target **140–150 words** (~{140 / WPS:.0f}–{150 / WPS:.1f}s at {WPS} wps). Same locked studies + COA + CTA.",
        "Spec: `marketing/HUMAN_SCRIPT_AGENT.md`.",
        "",
        "Builder: `python3 marketing/scripts/build_pep_60s_human.py`",
        "",
    ]
    scripts: list[tuple[str, str, str, int]] = []
    firsts: list[str] = []
    for s in SCENES_DATA:
        cid = s["creation_id"]
        vo = pitch_60(s)
        n = wc(vo)
        problems = lint_script(vo, duration=60)
        if problems:
            raise SystemExit(f"{cid} {s['compound_name']} {n} words: {'; '.join(problems)}\n{vo}")
        firsts.append(first_sentence(vo).lower())
        scripts.append((cid, s["compound_name"], vo, n))
        lines += [
            f"## {cid} — {s['compound_name']} ({n} words, ~{n / WPS:.1f}s)",
            f"**Set:** {s['surface']}",
            f"**30s live set stays:** `{s['suffix']}`",
            "",
            vo,
            "",
        ]
    if len(set(firsts)) != 20:
        raise SystemExit(f"duplicate 60s first sentences: {firsts}")
    REVIEW.write_text("\n".join(lines), encoding="utf-8")
    print("ok 60s review", REVIEW)
    print("words min", min(n for *_, n in scripts), "max", max(n for *_, n in scripts))
    for cid, name, _, n in scripts:
        print(f"  {n:3d}  {cid}  {name}")


if __name__ == "__main__":
    main()
