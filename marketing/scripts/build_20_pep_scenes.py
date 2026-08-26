#!/usr/bin/env python3
"""20 unique 30s Pep clips: human hook, easy science, locked studies + COA + CTA.

TTS rate ~2.51 wps. 65–74 words ≈ 26–29.5s so 1080p OmniHuman (30s audio cap) does not 422.
Human Script Agent: marketing/HUMAN_SCRIPT_AGENT.md
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

ROOT = Path("/workspace/marketing")
sys.path.insert(0, str(ROOT / "scripts"))
from human_script_lib import (  # noqa: E402
    CTA,
    COA,
    WPS,
    assemble,
    lint_script,
    wc,
)

SCENES = ROOT / "sheets" / "150-pb-pep-scenes.csv"
POOL = ROOT / "sheets" / "pep-blocking-pool.csv"
REVIEW = ROOT / "n8n-pep-20-vo-review.md"

TARGET_MIN = 65
TARGET_MAX = 74

FIELDS = [
    "creation_id", "rank", "category", "material_detail", "compound_id", "compound_name",
    "canonical_url", "caption_lock", "shot_family", "camera_angle", "camera_direction",
    "framing", "scene_brief", "quality_var_count", "quality_suffix", "aspect_ratio",
    "duration_seconds", "resolution", "model_still", "model_video", "still_resolution",
    "video_prompt", "video_motion_prompt", "status", "times_used", "last_used_at",
    "reel_still_url", "video_url", "surface", "lighting", "camera_move", "color_grade",
    "hero_style", "source_id", "vibe", "theme", "workflow", "voice_over", "product_description",
]

MATERIAL = (
    "10mL sterile injectable-style glass vial with rubber stopper and aluminum crimp seal "
    "(NOT screw-cap, NOT black twist cap); Palm Beach Pep mascot form"
)


def pitch(hook: str, science: str, say: str, benefit: str) -> str:
    return assemble(hook, science, say, benefit)


# 20 unique products. Hook first. Easy science. Action matched to set.
SCENES_DATA = [
    dict(
        creation_id="PEP-001", compound_id="V-BPC-001", compound_name="BPC-157",
        url="https://www.palmbeach-vitality.store/products/bpc-157",
        verb="walks", action="walking this sunlit wooden boardwalk toward camera, sneakers planting every step",
        surface="Sunlit wooden boardwalk with ocean horizon, palm shadows, and weathered planks underfoot",
        lighting="warm coastal key with soft sky fill",
        camera_move="follow-walk handheld energy, low-angle hero",
        grade="sunlit coastal grade, soft aqua highlights",
        vibe="Coastal", theme="Beach & Ocean", suffix="boardwalk-walk",
        angle="eye-level", direction="front",
        hook="Salt on these boards. I'm Palm Beach Pep.",
        science="BPC-157 is a short gut-protein fragment labs watch as a local lining and tendon repair signal.",
        say="BPC-157", benefit="gut lining and tendon-repair research",
        desc="BPC-157 research vial. 10mL sterile crimp-seal format.",
    ),
    dict(
        creation_id="PEP-002", compound_id="V-TB5-001", compound_name="TB-500",
        url="https://www.palmbeach-vitality.store/products/tb-500",
        verb="jogs", action="jogging the turf sprint lane toward camera, sneakers planting, talking the whole time",
        surface="Outdoor turf sprint lane with soft stadium lights and empty hash marks",
        lighting="strong key with defined rim",
        camera_move="tracking jog toward camera, slight handheld shake",
        grade="crisp athletic grade, cool turf greens",
        vibe="Powerful", theme="Resilience & Strength", suffix="turf-jog",
        angle="low-angle", direction="front",
        hook="Hash marks, empty lane. I'm Palm Beach Pep.",
        science="TB-500 is a thymosin beta-4 piece labs study when cells need a track to crawl into a repair zone.",
        say="TB-500", benefit="cell-migration and recovery research",
        desc="TB-500 research vial for laboratory research.",
    ),
    dict(
        creation_id="PEP-003", compound_id="V-GHK-001", compound_name="GHK-Cu",
        url="https://www.palmbeach-vitality.store/products/ghk-cu",
        verb="dances", action="two-step dancing in place under drifting petals, sneakers planted, hat brim bouncing, talking",
        surface="Cherry-blossom path with petals in the air and warm dusk lanterns",
        lighting="warm golden key, soft fill",
        camera_move="slow orbit while he grooves, stay mid-ground",
        grade="warm honey grade, pink petal highlights",
        vibe="Warm", theme="Nature Regeneration", suffix="blossom-dance",
        angle="eye-level", direction="slight-right",
        hook="Petals in the air. I'm Palm Beach Pep, and this hat's bouncing.",
        science="GHK-Cu is three amino acids holding copper. Labs watch collagen talk in skin.",
        say="GHK-Cu", benefit="collagen remodeling and skin-repair research",
        desc="GHK-Cu copper-tripeptide research vial.",
    ),
    dict(
        creation_id="PEP-004", compound_id="V-SEM-001", compound_name="Semaglutide",
        url="https://www.palmbeach-vitality.store/products/semaglutide",
        verb="walks", action="power-walking the coastal bike path toward camera, gloves swinging, talking",
        surface="Coastal bike path with sea oats, railing, and breeze-bent grasses",
        lighting="warm coastal key with soft sky fill",
        camera_move="follow-walk along the path, ocean in the deep background",
        grade="bright coastal grade, clean contrast",
        vibe="Fresh", theme="Fat Loss & Metabolism", suffix="bikepath-walk",
        angle="eye-level", direction="slight-left",
        hook="Keep the pace. I'm Palm Beach Pep.",
        science="Semaglutide copies GLP-1, the meal hormone. After food it helps insulin when sugar is high and slows emptying.",
        say="Semaglutide", benefit="appetite and metabolic-marker research",
        desc="Semaglutide research vial.",
    ),
    dict(
        creation_id="PEP-005", compound_id="V-TIR-001", compound_name="Tirzepatide",
        url="https://www.palmbeach-vitality.store/products/tirzepatide",
        verb="walks", action="striding a wild-coast overlook toward camera, wind on the hat brim, talking",
        surface="Wild coast sea-stack overlook with crashing whitewater and open sky",
        lighting="hard clean key with soft fill",
        camera_move="hero low-angle follow-walk, horizon hold",
        grade="dramatic coastal grade, deep blues",
        vibe="Epic", theme="Beach & Ocean", suffix="seastack-walk",
        angle="low-angle", direction="front",
        hook="That water's loud. I'm Palm Beach Pep.",
        science="Tirzepatide knocks two meal-hormone receptors, GIP and GLP-1. One molecule. Labs watch insulin and appetite on both.",
        say="Tirzepatide", benefit="dual-incretin metabolic research",
        desc="Tirzepatide research vial.",
    ),
    dict(
        creation_id="PEP-006", compound_id="V-RET-001", compound_name="Retatrutide",
        url="https://www.palmbeach-vitality.store/products/retatrutide",
        verb="hikes", action="hiking the cliff trail toward camera, planted steps on dirt, talking",
        surface="Cliffside hiking trail with ocean far below and wind-bent grasses",
        lighting="bright even key, soft white bounce",
        camera_move="tracking hike, slight handheld, stay full body",
        grade="open-air grade, warm rock and cool water",
        vibe="Epic", theme="Mountains", suffix="cliff-hike",
        angle="low-angle", direction="slight-right",
        hook="Cliff dirt under the sneakers. I'm Palm Beach Pep.",
        science="Retatrutide talks to GIP, GLP-1, and glucagon. Two say the meal arrived. The third is studied for energy spend.",
        say="Retatrutide", benefit="triple-agonist metabolic research",
        desc="Retatrutide research vial.",
    ),
    dict(
        creation_id="PEP-007", compound_id="V-AOD-001", compound_name="AOD-9604",
        url="https://www.palmbeach-vitality.store/products/aod-9604",
        verb="jogs", action="easy jogging the outdoor fitness park toward camera, sneakers on rubber, talking",
        surface="Outdoor fitness park under coastal morning light with empty bars and rubber chips",
        lighting="high-key soft daylight",
        camera_move="jog-follow, bright and punchy",
        grade="clean daylight grade, warm wood and rubber",
        vibe="Bright", theme="Fat Loss & Metabolism", suffix="fitpark-jog",
        angle="eye-level", direction="front",
        hook="Morning rubber chips. I'm Palm Beach Pep, jogging this park.",
        science="AOD-9604 is a tail-piece of growth hormone. Labs follow the fat-breakdown note from that fragment.",
        say="AOD-9604", benefit="fat-metabolism and lipolysis research",
        desc="AOD-9604 research vial.",
    ),
    dict(
        creation_id="PEP-008", compound_id="P-SMX-001", compound_name="Semax",
        url="https://www.palmbeach-vitality.store/products/semax-pen",
        verb="walks", action="brisk walking a meadow boardwalk through wildflowers, talking to camera",
        surface="Meadow boardwalk through tall wildflowers with a wide bright sky",
        lighting="airy soft key, gentle rim",
        camera_move="forward walk through flowers, slight sway",
        grade="pastoral grade, saturated blooms",
        vibe="Bright", theme="Focus & Clarity", suffix="meadow-walk",
        angle="eye-level", direction="slight-left",
        hook="Keep moving. Wildflowers, wide sky. I'm Palm Beach Pep.",
        science="Semax is an ACTH-fragment analog. Labs study BDNF, the brain's learning signal, in cognition models.",
        say="Semax", benefit="BDNF and cognitive-research endpoints",
        desc="Semax research product.",
    ),
    dict(
        creation_id="PEP-009", compound_id="V-SEL-001", compound_name="Selank",
        url="https://www.palmbeach-vitality.store/products/selank",
        verb="dances", action="gentle groove dancing on a sunrise yoga deck, sneakers planted, talking",
        surface="Sunrise yoga deck over calm water with long warm reflections",
        lighting="warm golden key, soft fill",
        camera_move="slow side drift while he grooves in place",
        grade="golden hour grade, soft water highlights",
        vibe="Zen", theme="Focus & Clarity", suffix="yoga-groove",
        angle="eye-level", direction="slight-right",
        hook="Easy morning. Water's still. I'm Palm Beach Pep, on this deck.",
        science="Selank is a tuftsin analog. Labs watch the brain's GABA calm-down conversation.",
        say="Selank", benefit="calm-focus and GABA-pathway research",
        desc="Selank research vial.",
    ),
    dict(
        creation_id="PEP-010", compound_id="V-IPA-001", compound_name="Ipamorelin",
        url="https://www.palmbeach-vitality.store/products/cjc-ipamorelin",
        verb="walks", action="walking the boutique gym floor toward camera past a soft-focus dumbbell rack, talking",
        surface="Boutique gym weight floor with daylight from high windows and a soft-focus dumbbell rack",
        lighting="bright even key, soft white bounce",
        camera_move="walk-and-talk down the aisle, racks stay background",
        grade="clean athletic grade, warm wood and iron",
        vibe="Powerful", theme="Resilience & Strength", suffix="gym-walk",
        angle="eye-level", direction="front",
        hook="Daylight off the racks. I'm Palm Beach Pep.",
        science="Ipamorelin knocks the ghrelin receptor and asks for a short growth-hormone pulse. Quieter than older GHRPs.",
        say="Ipamorelin", benefit="selective growth-hormone pulse research",
        desc="Ipamorelin research vial.",
    ),
    dict(
        creation_id="PEP-011", compound_id="V-CJC-001", compound_name="CJC (no DAC)",
        url="https://www.palmbeach-vitality.store/products/cjc",
        verb="trains", action="athletic stance in a kettlebell aisle, small planted steps, gloves at hips, talking like a coach",
        surface="Kettlebell rack aisle in a quiet strength studio with warm wood and iron",
        lighting="strong key with defined rim",
        camera_move="low-angle hero, slight push while he steps",
        grade="moody gym grade, warm metal highlights",
        vibe="Powerful", theme="Resilience & Strength", suffix="kettlebell-sport",
        angle="low-angle", direction="oblique right",
        hook="Iron and wood. I'm Palm Beach Pep.",
        science="CJC with no DAC is a GHRH analog. It asks the pituitary for a growth-hormone pulse, then it clears.",
        say="CJC (no DAC)", benefit="growth-hormone pulse and recovery research",
        desc="CJC (no DAC) research vial.",
    ),
    dict(
        creation_id="PEP-012", compound_id="V-TES-001", compound_name="Tesamorelin",
        url="https://www.palmbeach-vitality.store/products/tesamorelin",
        verb="hikes", action="hiking a red-rock mesa path toward camera, planted sneakers on sandstone, talking",
        surface="Red-rock mesa overlook at late afternoon with wide sky and warm sandstone",
        lighting="warm golden key, soft fill",
        camera_move="hike-follow, epic wide set, Pep mid-ground",
        grade="desert gold grade, long shadows",
        vibe="Dramatic", theme="Desert", suffix="mesa-hike",
        angle="low-angle", direction="front",
        hook="Sandstone's warm. I'm Palm Beach Pep, hiking this mesa.",
        science="Tesamorelin is a stabilized GHRH analog. Pituitary asks for GH, then IGF-1. Labs have watched body-composition markers.",
        say="Tesamorelin", benefit="IGF-1 and visceral-fat research",
        desc="Tesamorelin research vial.",
    ),
    dict(
        creation_id="PEP-013", compound_id="P-KPV-001", compound_name="KPV",
        url="https://www.palmbeach-vitality.store/products/kpv",
        verb="walks", action="walking a misted greenhouse aisle toward camera, ferns hanging, talking",
        surface="Greenhouse aisle with misted glass, hanging ferns, and wet stone under sneakers",
        lighting="lush soft key, gentle rim",
        camera_move="walk through mist, leaves in foreground",
        grade="lush green grade, dewy highlights",
        vibe="Lush", theme="Nature Regeneration", suffix="greenhouse-walk",
        angle="eye-level", direction="slight-left",
        hook="Ferns in the mist. I'm Palm Beach Pep.",
        science="KPV is three amino acids from alpha-MSH. Labs study the calm-inflammation half in gut and skin models.",
        say="KPV", benefit="gut and skin inflammation-pathway research",
        desc="KPV research vial.",
    ),
    dict(
        creation_id="PEP-014", compound_id="V-NAD-001", compound_name="NAD+",
        url="https://www.palmbeach-vitality.store/products/nad-1",
        verb="pedals", action="pedaling an empty spin bike, sneakers on the pedals, talking to camera, cool blue wash",
        surface="Spin studio with empty bikes, cool blue wash, and a single lit bike in the mid-ground",
        lighting="cool soft key + clean rim light",
        camera_move="slight orbit around the bike, Pep stays mid-ground",
        grade="cool energy grade, electric blues",
        vibe="Cool", theme="Energy & Cellular Power", suffix="spin-sport",
        angle="slightly elevated", direction="slight-right",
        hook="Blue wash, empty bikes. I'm Palm Beach Pep.",
        science="NAD+ is the shuttle cells use to move electrons and make ATP. The redox coin mitochondria spend.",
        say="NAD+", benefit="cellular-energy and mitochondrial research",
        desc="NAD+ research vial.",
    ),
    dict(
        creation_id="PEP-015", compound_id="V-WOL-001", compound_name="BPC-157 / TB-500",
        url="https://www.palmbeach-vitality.store/products/wolverine-stack",
        verb="trains", action="planted athletic stance on battle-rope turf, small bounce in the knees, talking, gloves at hips",
        surface="Battle-rope lane on outdoor artificial turf with ropes resting on the ground",
        lighting="hard clean key with soft fill",
        camera_move="punchy handheld, low-angle, keep full body",
        grade="high-contrast athletic grade",
        vibe="Powerful", theme="Resilience & Strength", suffix="ropes-sport",
        angle="low-angle", direction="front",
        hook="Ropes on the turf. I'm Palm Beach Pep.",
        science="BPC-157 is a local repair signal. TB-500 is studied for helping cells migrate. Two jobs, one walk.",
        say="BPC-157 and TB-500", benefit="tissue-repair and cell-migration research",
        desc="BPC-157 / TB-500 research stack vial.",
    ),
    dict(
        creation_id="PEP-016", compound_id="V-GLO-001", compound_name="BPC-157 / TB-500 / GHK-Cu",
        url="https://www.palmbeach-vitality.store/products/glow",
        verb="dances", action="groove-dancing a lantern-lit evening boardwalk through palms, sneakers planted then small steps, talking",
        surface="Lantern-lit evening boardwalk through palms with warm pools of light on the planks",
        lighting="warm golden key, soft fill",
        camera_move="night-walk groove, lantern bokeh, stay mid-ground",
        grade="warm night grade, amber lanterns",
        vibe="Warm", theme="Stacks & Synergy", suffix="lantern-dance",
        angle="eye-level", direction="slight-right",
        hook="Lanterns on the planks. I'm Palm Beach Pep.",
        science="BPC-157 repairs locally. TB-500 helps cells migrate. GHK-Cu is copper for collagen talk.",
        say="BPC-157, TB-500, and GHK-Cu", benefit="repair, migration, and collagen research",
        desc="Glow stack research vial.",
    ),
    dict(
        creation_id="PEP-017", compound_id="V-MOT-001", compound_name="MOTS-C",
        url="https://www.palmbeach-vitality.store/products/mots-c-10mg-5ml-vial",
        verb="jogs", action="jogging a medicine-ball loft toward camera, sneakers on wood, talking",
        surface="Medicine-ball wall in a functional fitness loft with brick and warm wood",
        lighting="warm golden key, soft fill",
        camera_move="jog-in, loft depth, full body",
        grade="loft grade, warm brick",
        vibe="Powerful", theme="Energy & Cellular Power", suffix="loft-jog",
        angle="eye-level", direction="front",
        hook="Brick loft, medicine balls. I'm Palm Beach Pep.",
        science="MOTS-C is a short peptide written in mitochondrial DNA. Labs study AMPK, the cell's fuel gauge.",
        say="MOTS-C", benefit="AMPK and metabolic-homeostasis research",
        desc="MOTS-C research vial.",
    ),
    dict(
        creation_id="PEP-018", compound_id="V-CII-001", compound_name="CJC (no DAC)/Ipamorelin",
        url="https://www.palmbeach-vitality.store/products/cjc-ipamorelin",
        verb="pedals", action="driving an assault bike, sneakers on the pedals, talking, industrial windows behind",
        surface="Assault-bike corner with industrial loft windows and a rubber floor",
        lighting="strong key with defined rim",
        camera_move="side 3/4 on the bike, slight push-in",
        grade="industrial athletic grade, cool window light",
        vibe="Powerful", theme="Resilience & Strength", suffix="assault-sport",
        angle="low-angle", direction="oblique right",
        hook="Assault bike, rubber floor. I'm Palm Beach Pep.",
        science="CJC asks for a short GH pulse. Ipamorelin knocks ghrelin. Together they shape a natural pulse.",
        say="CJC (no DAC) and Ipamorelin", benefit="combined growth-hormone pulse research",
        desc="CJC (no DAC)/Ipamorelin research vial.",
    ),
    dict(
        creation_id="PEP-019", compound_id="V-SS3-001", compound_name="SS-31",
        url="https://www.palmbeach-vitality.store/products/ss-31",
        verb="boxes", action="planted boxer's shuffle in an empty ring corner, sneakers on canvas, gloves up at chest not thumbs-up, talking",
        surface="Empty boutique boxing-ring canvas corner with ropes behind and a stool off to the side",
        lighting="hard clean key with soft fill",
        camera_move="ring-level handheld, shuffle in place, stay mid-ground",
        grade="punchy gym grade, warm canvas",
        vibe="Powerful", theme="Resilience & Strength", suffix="ring-sport",
        angle="low-angle", direction="front",
        hook="Canvas corner. I'm Palm Beach Pep, still moving.",
        science="SS-31 parks on cardiolipin in the mitochondrial wall. Labs study cleaner ATP when that membrane stays tidy.",
        say="SS-31", benefit="mitochondrial-membrane and bioenergetics research",
        desc="SS-31 research vial.",
    ),
    dict(
        creation_id="PEP-020", compound_id="V-SER-001", compound_name="Sermorelin",
        url="https://www.palmbeach-vitality.store/products/sermorelin",
        verb="jogs", action="jogging a lakeside wooden dock toward camera, sneakers on wet boards, talking",
        surface="Quiet lakeside wooden dock with clear water reflections and morning mist",
        lighting="airy soft key, gentle rim",
        camera_move="dock jog toward camera, water bokeh",
        grade="misty water grade, cool silvers",
        vibe="Fresh", theme="Lakes & Water", suffix="dock-jog",
        angle="eye-level", direction="front",
        hook="Mist on the lake. I'm Palm Beach Pep.",
        science="Sermorelin is the first twenty-nine amino acids of GHRH. It asks the pituitary for a GH pulse, then clears.",
        say="Sermorelin", benefit="pituitary growth-hormone pulse research",
        desc="Sermorelin research vial.",
    ),
]


def scene_brief(s: dict) -> str:
    return (
        f"9:16 vertical Pep social clip. Palm Beach Pep {s['verb']} mid-ground on this unique set: {s['surface']}. "
        f"Action: {s['action']}. Full body visible. Mouth open mid-word. No people. No medical settings. "
        f"Vibe: {s['vibe']}. Theme: {s['theme']}. Product lock: {s['compound_name']} ({s['compound_id']}). "
        f"Keep Pep identical to master. Type on the label is exactly 10ml. HARD FAIL hover, thumbs-up, 10mlz."
    )


def video_prompt(s: dict) -> str:
    return (
        f"Animate this 9:16 still. Palm Beach Pep {s['action']}. Unique set: {s['surface']}. "
        f"He talks the whole clip. Camera: {s['camera_move']}. Lighting: {s['lighting']}. "
        f"No humans. No hospitals. No new text. No thumbs-up."
    )


def video_motion(s: dict) -> str:
    return (
        f"{s['camera_move']}; Pep {s['action']}; preserve Pep identity; sneakers stay on the set; "
        f"talking mouth the whole clip; no thumbs-up; no new text; no humans"
    )


def caption_lock(s: dict) -> str:
    return (
        f"Captions MUST be only about {s['compound_name']} ({s['compound_id']}) and {s['url']}. "
        f"Include research-use-only framing. No disease, treatment, or human-use claims. No nicknames."
    )


def hero(s: dict) -> str:
    return (
        f"Palm Beach Pep (10mL crimp-seal vial mascot) mid-ground featuring {s['compound_name']}; "
        f"never black twist/screw cap; full body; no humans"
    )


def make_row(i: int, s: dict) -> dict:
    vo = pitch(s["hook"], s["science"], s["say"], s["benefit"])
    n = wc(vo)
    problems = lint_script(vo, duration=30)
    if problems:
        raise SystemExit(f"{s['creation_id']} {s['compound_name']} {n} words: {'; '.join(problems)}\n{vo}")
    if not (TARGET_MIN <= n <= TARGET_MAX):
        raise SystemExit(f"{s['creation_id']} {s['compound_name']} is {n} words (need {TARGET_MIN}–{TARGET_MAX}): {vo}")
    if "palm beach pep" not in vo.lower():
        raise SystemExit(f"{s['creation_id']} missing Pep name")
    if CTA not in vo or COA not in vo:
        raise SystemExit(f"{s['creation_id']} missing COA/CTA")
    return {
        "creation_id": s["creation_id"],
        "rank": str(i + 1),
        "category": "vial_10ml",
        "material_detail": MATERIAL,
        "compound_id": s["compound_id"],
        "compound_name": s["compound_name"],
        "canonical_url": s["url"],
        "caption_lock": caption_lock(s),
        "shot_family": "pep_mascot",
        "camera_angle": s["angle"],
        "camera_direction": s["direction"],
        "framing": "9:16 vertical Pep-mascot framing, mid-ground hero, full body, full scene depth",
        "scene_brief": scene_brief(s),
        "quality_var_count": "1",
        "quality_suffix": s["suffix"],
        "aspect_ratio": "9:16",
        "duration_seconds": "30",
        "resolution": "1080p",
        "model_still": "grok-imagine-image",
        "model_video": "fal-omnihuman-v1.5",
        "still_resolution": "1k",
        "video_prompt": video_prompt(s),
        "video_motion_prompt": video_motion(s),
        "status": "Active",
        "times_used": "0",
        "last_used_at": "",
        "reel_still_url": "",
        "video_url": "",
        "surface": s["surface"],
        "lighting": s["lighting"],
        "camera_move": s["camera_move"],
        "color_grade": s["grade"],
        "hero_style": hero(s),
        "source_id": f"P20-{i + 1}",
        "vibe": s["vibe"],
        "theme": s["theme"],
        "workflow": "vid_gen_palm_beach_pep",
        "voice_over": vo,
        "product_description": s["desc"],
    }


POOL_ROWS = [
    ["row_id", "active", "type", "id", "still", "motion", "brief", "omni"],
    ["BLK-W01", "TRUE", "body", "walking",
     "POSE: mid-stride WALKING toward camera, slight 3/4. One white sneaker stepping forward, one sneaker back. BOTH sneakers firmly on the ground with contact shadows. HARD FAIL hover. Not the master thumbs-up.",
     "walk toward camera slight 3/4, each step plants, talking the whole time",
     "walking mid-stride toward camera",
     "walking toward camera, sneakers planted, talking"],
    ["BLK-W06", "TRUE", "body", "running",
     "POSE: JOGGING toward camera, slight 3/4. Mid-stride, one sneaker forward, one back. BOTH sneakers touching the ground with contact shadows. Athletic lean. Mouth open. HARD FAIL hover. Not thumbs-up.",
     "jog toward camera, each step plants hard, talking the whole time",
     "jogging toward camera, sneakers on the ground",
     "jogging toward camera, planted steps, talking"],
    ["BLK-W07", "TRUE", "body", "dancing",
     "POSE: DANCING two-step / groove in place, slight 3/4. Knees soft, hat brim alive, BOTH sneakers planted on the set with contact shadows. Mouth open mid-word. HARD FAIL hover, moonwalk, floating. Not thumbs-up.",
     "groove and two-step in place while talking, sneakers stay planted, hat brim bounces",
     "dancing in place, sneakers planted",
     "dancing groove in place, planted sneakers, talking"],
    ["BLK-W08", "TRUE", "body", "sports_ready",
     "POSE: athletic SPORTS stance for this set (boxer shuffle, bike pedals, turf bounce, kettlebell aisle coach). BOTH sneakers contact the set. Full body. Mouth open. HARD FAIL hover. Not master thumbs-up. Gloves not a salute.",
     "keep the sport motion of this set while talking: shuffle, pedal, or planted athletic bounce. Sneakers stay on the set",
     "sports motion on this set while talking",
     "sports motion, sneakers on the set, talking"],
    ["BLK-W09", "TRUE", "body", "hiking",
     "POSE: HIKING mid-stride on trail dirt or rock, slight 3/4 toward camera. One sneaker forward uphill. BOTH sneakers on the ground with contact shadows. Mouth open. HARD FAIL hover.",
     "hike toward camera, planted trail steps, talking the whole time",
     "hiking toward camera",
     "hiking, planted steps, talking"],
    ["BLK-W02", "FALSE", "body", "sitting",
     "POSE: SITTING on a set perch. Seat and sneakers contact the set. HARD FAIL hovering.",
     "stay seated, talk",
     "sitting (inactive for weekly social)",
     "sitting"],
    ["BLK-W03", "FALSE", "body", "standing",
     "POSE: STANDING at ease. HARD FAIL hover.",
     "stand in place, sway, talk",
     "standing (inactive — boring for social)",
     "standing still talking"],
    ["BLK-W04", "FALSE", "body", "stopping",
     "POSE: STOPPING mid-walk.",
     "two steps then stop, talk",
     "stopping (inactive)",
     "stopping"],
    ["BLK-W05", "FALSE", "body", "turning",
     "POSE: TURNING toward camera.",
     "turn, settle, talk",
     "turning (inactive)",
     "turning"],
    ["BLK-G03", "TRUE", "gesture", "walk_swing",
     "HANDS: both white gloves in a natural walk or jog swing at hip height. Neither hand raised. NO thumbs-up.",
     "both gloves swing at hip height while talking",
     "walk swing",
     "walk/jog swing at hip height"],
    ["BLK-G09", "TRUE", "gesture", "dance_groove",
     "HANDS: white gloves groove at hip-to-chest height, small musical bounce. Not above the brim. NO thumbs-up. NO salute.",
     "gloves groove with the dance, stay close to the body",
     "dance groove",
     "gloves groove at hip height"],
    ["BLK-G10", "TRUE", "gesture", "sport_guard",
     "HANDS: athletic guard at chest, or on handlebars/hips for the sport. Never a thumbs-up. Never a high wave.",
     "keep a compact sport guard while talking",
     "sport guard",
     "compact athletic guard, no thumbs-up"],
    ["BLK-G04", "TRUE", "gesture", "hip_rest",
     "HANDS: one white glove on a hip, the other hangs relaxed. NO thumbs-up.",
     "one glove on hip, other punctuates speech",
     "hip rest",
     "one glove on hip"],
    ["BLK-G01", "FALSE", "gesture", "present_label",
     "HANDS: present 10ml label.", "present label", "present label (inactive)", "present"],
    ["BLK-G02", "FALSE", "gesture", "point_10ml",
     "HANDS: point at 10ml.", "point", "point (inactive — weird OmniHuman arms)", "point"],
    ["BLK-G05", "FALSE", "gesture", "count_fingers",
     "HANDS: count.", "count", "count (inactive)", "count"],
    ["BLK-G06", "FALSE", "gesture", "low_wave",
     "HANDS: low wave.", "wave", "wave (inactive)", "wave"],
    ["BLK-G07", "TRUE", "gesture", "palms_out",
     "HANDS: both palms out at waist, friendly present of the vial body. NO thumbs-up.",
     "palms-out present, then relax into the motion",
     "palms out",
     "palms-out present"],
    ["BLK-G08", "TRUE", "gesture", "label_glance",
     "HANDS: one glove taps or frames the 10ml label. Other glove down. NO thumbs-up.",
     "tap the 10ml label once, keep the body moving",
     "label glance",
     "tap 10ml, keep moving"],
    ["BLK-A01", "TRUE", "angle", "slight 3/4 screen-right", "ANGLE: slight 3/4 screen-right.", "camera holds slight 3/4 screen-right", "slight 3/4 screen-right", "slight 3/4 screen-right"],
    ["BLK-A02", "TRUE", "angle", "slight 3/4 screen-left", "ANGLE: slight 3/4 screen-left.", "camera holds slight 3/4 screen-left", "slight 3/4 screen-left", "slight 3/4 screen-left"],
    ["BLK-A03", "TRUE", "angle", "eye-level front 3/4", "ANGLE: eye-level front 3/4.", "camera holds eye-level front 3/4", "eye-level front 3/4", "eye-level front 3/4"],
    ["BLK-A05", "TRUE", "angle", "low-angle hero", "ANGLE: low-angle hero, Pep looks tall in 9:16.", "camera holds low-angle hero", "low-angle hero", "low-angle hero"],
]


def write_review(rows: list[dict]) -> None:
    lines = [
        "# 20 × 30s Pep scripts — read and mark tweaks",
        "",
        "Human Script Agent pass. Unique set-specific hooks. Easy science. Locked studies + COA + store CTA still close every clip.",
        "Spec: `marketing/HUMAN_SCRIPT_AGENT.md`.",
        "",
        f"Target **{TARGET_MIN}–{TARGET_MAX} words** (~{TARGET_MIN / WPS:.0f}–{TARGET_MAX / WPS:.1f}s at Pep TTS). OmniHuman **1080p** (30s audio cap).",
        "",
        "Re-import tab `150-pb-pep-scenes` from the CSV. Blocking pool: `pep-blocking-pool`.",
        "",
    ]
    for r in rows:
        n = wc(r["voice_over"])
        lines += [
            f"## {r['creation_id']} — {r['compound_name']} ({n} words, ~{n / WPS:.1f}s)",
            f"**Set:** {r['surface']}",
            f"**Action / vibe:** {r['quality_suffix']} · {r['vibe']} · camera `{r['camera_move']}`",
            "",
            r["voice_over"],
            "",
        ]
    REVIEW.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    rows = [make_row(i, s) for i, s in enumerate(SCENES_DATA)]
    assert len(rows) == 20
    ids = [r["creation_id"] for r in rows]
    assert len(set(ids)) == 20
    names = [r["compound_name"] for r in rows]
    assert len(set(names)) == 20
    surfaces = [r["surface"] for r in rows]
    assert len(set(surfaces)) == 20, "every clip needs a unique set"
    firsts = [r["voice_over"].split(".")[0].strip().lower() for r in rows]
    assert len(set(firsts)) == 20, f"duplicate first sentences: {firsts}"

    with SCENES.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, quoting=csv.QUOTE_ALL)
        w.writeheader()
        w.writerows(rows)

    with POOL.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerows(POOL_ROWS)

    write_review(rows)
    print("ok 20 rows", SCENES)
    print("ok pool", POOL)
    print("ok review", REVIEW)
    print("words min", min(wc(r["voice_over"]) for r in rows), "max", max(wc(r["voice_over"]) for r in rows))
    for r in rows:
        print(f"  {wc(r['voice_over']):3d}  {r['creation_id']}  {r['compound_name']}")


if __name__ == "__main__":
    main()
