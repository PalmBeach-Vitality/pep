#!/usr/bin/env python3
"""Build 150 unique Palm Beach Pep scenes in 9-lab / high-quality vid-gen format."""

from __future__ import annotations

import csv
import re
from collections import Counter
from pathlib import Path

DISCLAIMER = (
    "For laboratory research use only. Not for human use or consumption. "
    "Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA."
)
PEP_LOCK = (
    "CHARACTER LOCK — Palm Beach Pep: anthropomorphic clear 10mL sterile injectable-style glass vial, "
    "rubber stopper + silver aluminum crimp seal (NOT screw-cap, NOT black twist cap), white mid-body label "
    "with cheerful cartoon face (large round eyes, open smile with pink tongue, rosy cheeks) and bold '10ml' text, "
    "white baseball cap with Palm Beach Vitality sunset and palm-tree logo on the crimp cap, simple gray tube arms and legs, "
    "white cartoon gloves, rounded white sneakers, optimistic thumbs-up energy. Clean sticker/clip-art style with thick outlines. "
    "No humans. No doctor offices. No hospitals."
)
VIAL_SPEC = (
    "VIAL SPEC: 10mL sterile injectable-style clear glass vial, rubber stopper + aluminum crimp only. "
    "FORBIDDEN: black twist caps, screw caps, droppers."
)
SIGNAGE = (
    "SIGNAGE RULE: premium clean set only. No safety placards, no industrial alert graphics, no trefoil icons, "
    "no striped floor tape, no danger banners. No alert words on walls, floors, labels, or posters. "
    "LOCATION RULE: no doctor offices, no hospitals, no clinical exam rooms."
)
MATERIAL = (
    "10mL sterile injectable-style glass vial with rubber stopper and aluminum crimp seal "
    "(NOT screw-cap, NOT black twist cap); Palm Beach Pep mascot form"
)

COLS = [
    "creation_id",
    "rank",
    "category",
    "material_detail",
    "compound_id",
    "compound_name",
    "canonical_url",
    "caption_lock",
    "shot_family",
    "camera_angle",
    "camera_direction",
    "framing",
    "scene_brief",
    "quality_var_count",
    "quality_suffix",
    "aspect_ratio",
    "duration_seconds",
    "resolution",
    "model_still",
    "model_video",
    "still_resolution",
    "video_prompt",
    "video_motion_prompt",
    "status",
    "times_used",
    "last_used_at",
    "reel_still_url",
    "video_url",
    "surface",
    "lighting",
    "camera_move",
    "color_grade",
    "hero_style",
    "source_id",
    "vibe",
    "theme",
    "workflow",
    "voice_over",
    "pep_script",
    "product_description",
    "disclaimer_short",
]

PRODUCTS = {
    "BPC-157": (
        "V-BPC-001",
        "BPC-157",
        "https://www.palmbeach-vitality.store/products/bpc-157",
        "BPC-157 research vial. Laboratory research material in a 10mL sterile crimp-seal format.",
    ),
    "TB-500": (
        "V-TB5-001",
        "TB-500",
        "https://www.palmbeach-vitality.store/products/tb-500",
        "TB-500 research vial for laboratory research. Not for human use.",
    ),
    "GHK-Cu": (
        "V-GHK-001",
        "GHK-Cu",
        "https://www.palmbeach-vitality.store/products/ghk-cu",
        "GHK-Cu research vial. Laboratory research material only.",
    ),
    "Semaglutide": (
        "V-SEM-001",
        "Semaglutide",
        "https://www.palmbeach-vitality.store/products/semaglutide",
        "Semaglutide research vial for laboratory research. Not a medicine.",
    ),
    "Tirzepatide": (
        "V-TIR-001",
        "Tirzepatide",
        "https://www.palmbeach-vitality.store/products/tirzepatide",
        "Tirzepatide research vial. Not a drug. For laboratory research use only.",
    ),
    "Retatrutide": (
        "V-RET-001",
        "Retatrutide",
        "https://www.palmbeach-vitality.store/products/retatrutide",
        "Retatrutide research vial. Intended for laboratory research use only.",
    ),
    "AOD-9604": (
        "V-AOD-001",
        "AOD-9604",
        "https://www.palmbeach-vitality.store/products/aod-9604",
        "AOD-9604 research vial for laboratory research. Not for human consumption.",
    ),
    "Semax": (
        "P-SMX-001",
        "Semax",
        "https://www.palmbeach-vitality.store/products/semax-pen",
        "Semax research material. For laboratory research use only.",
    ),
    "Selank": (
        "V-SEL-001",
        "Selank",
        "https://www.palmbeach-vitality.store/products/selank",
        "Selank research vial. Intended for laboratory research use only.",
    ),
    "Ipamorelin": (
        "V-IPA-001",
        "Ipamorelin",
        "https://www.palmbeach-vitality.store/products/cjc-ipamorelin",
        "Ipamorelin research material. Laboratory research use only.",
    ),
    "CJC-1295 (DAC)": (
        "V-CJC-001",
        "CJC (no DAC)",
        "https://www.palmbeach-vitality.store/products/cjc",
        "CJC (no DAC) research vial. For laboratory research use only.",
    ),
    "CJC (no DAC)": (
        "V-CJC-001",
        "CJC (no DAC)",
        "https://www.palmbeach-vitality.store/products/cjc",
        "CJC (no DAC) research vial. For laboratory research use only.",
    ),
    "Tesamorelin": (
        "V-TES-001",
        "Tesamorelin",
        "https://www.palmbeach-vitality.store/products/tesamorelin",
        "Tesamorelin research vial. For laboratory research use only.",
    ),
    "KPV": (
        "P-KPV-001",
        "KPV",
        "https://www.palmbeach-vitality.store/products/kpv",
        "KPV research material. For laboratory research use only.",
    ),
    "NAD+": (
        "V-NAD-001",
        "NAD+",
        "https://www.palmbeach-vitality.store/products/nad-1",
        "NAD+ research vial for laboratory research. Not a supplement or drug.",
    ),
    "Wolverine (BPC-157 / TB-500)": (
        "V-WOL-001",
        "BPC-157 / TB-500",
        "https://www.palmbeach-vitality.store/products/wolverine-stack",
        "BPC-157 / TB-500 research blend vial. Chemical names only. Laboratory research use only.",
    ),
    "BPC-157 / TB-500": (
        "V-WOL-001",
        "BPC-157 / TB-500",
        "https://www.palmbeach-vitality.store/products/wolverine-stack",
        "BPC-157 / TB-500 research blend vial. Chemical names only. Laboratory research use only.",
    ),
    "GLOW": (
        "V-GLO-001",
        "BPC-157 / TB-500 / GHK-Cu",
        "https://www.palmbeach-vitality.store/products/glow",
        "BPC-157 / TB-500 / GHK-Cu research blend vial. Chemical names only. Laboratory research use only.",
    ),
    "BPC-157 / TB-500 / GHK-Cu": (
        "V-GLO-001",
        "BPC-157 / TB-500 / GHK-Cu",
        "https://www.palmbeach-vitality.store/products/glow",
        "BPC-157 / TB-500 / GHK-Cu research blend vial. Chemical names only. Laboratory research use only.",
    ),
    "KLOW": (
        "V-KLO-001",
        "KPV / BPC-157 / TB-500 / GHK-Cu",
        "https://www.palmbeach-vitality.store/products/klow-kpv-bpc-157-tb-500-ghk",
        "KPV / BPC-157 / TB-500 / GHK-Cu research blend vial. Chemical names only. Laboratory research use only.",
    ),
    "KPV / BPC-157 / TB-500 / GHK-Cu": (
        "V-KLO-001",
        "KPV / BPC-157 / TB-500 / GHK-Cu",
        "https://www.palmbeach-vitality.store/products/klow-kpv-bpc-157-tb-500-ghk",
        "KPV / BPC-157 / TB-500 / GHK-Cu research blend vial. Chemical names only. Laboratory research use only.",
    ),
    "MOTS-C": (
        "V-MOT-001",
        "MOTS-C",
        "https://www.palmbeach-vitality.store/products/mots-c-10mg-5ml-vial",
        "MOTS-C metabolic research peptide in vial format. For laboratory research use only.",
    ),
    "SS-31": (
        "V-SS3-001",
        "SS-31",
        "https://www.palmbeach-vitality.store/products/ss-31",
        "SS-31 mitochondrial research peptide vial. Laboratory research use only.",
    ),
    "Sermorelin": (
        "V-SER-001",
        "Sermorelin",
        "https://www.palmbeach-vitality.store/products/sermorelin",
        "Sermorelin research vial. For laboratory research use only.",
    ),
    "Thymosin Alpha-1": (
        "V-TA1-001",
        "Thymosin Alpha-1",
        "https://www.palmbeach-vitality.store/products/ta-1",
        "Thymosin Alpha-1 research vial. Laboratory research use only.",
    ),
    "PT-141": (
        "V-PT1-001",
        "PT-141",
        "https://www.palmbeach-vitality.store/products/pt-141",
        "PT-141 research vial. For laboratory research use only. Not evaluated by the FDA.",
    ),
    "CJC (no DAC)/Ipamorelin": (
        "V-CII-001",
        "CJC (no DAC)/Ipamorelin",
        "https://www.palmbeach-vitality.store/products/cjc-ipamorelin",
        "CJC (no DAC)/Ipamorelin research blend vial. Laboratory research use only.",
    ),
}

SCIENCE = {
    "BPC-157": "BPC-157 is a synthetic fifteen-amino-acid peptide studied in laboratory and preclinical models. Published work has examined cellular signaling pathways and tissue-related experimental systems.",
    "TB-500": "TB-500 is a research peptide fragment studied in laboratory models related to actin-binding and cell-migration pathways. Literature focuses on basic science mechanisms.",
    "GHK-Cu": "GHK-Cu is a copper-binding tripeptide examined in laboratory research for interactions with copper ions and extracellular-matrix related models.",
    "Semaglutide": "Semaglutide is an incretin-pathway research peptide studied in laboratory and experimental models. Molecule and documentation facts only.",
    "Tirzepatide": "Tirzepatide is a dual-incretin pathway research compound examined in experimental literature. Laboratory research material with documentation focus.",
    "Retatrutide": "Retatrutide is a multi-agonist incretin-pathway research peptide appearing in laboratory-focused literature.",
    "AOD-9604": "AOD-9604 is a research peptide fragment studied in metabolic pathway laboratory models.",
    "Semax": "Semax is a synthetic peptide analog examined in cognitive and neurological laboratory research models.",
    "Selank": "Selank is a synthetic peptide analog studied in laboratory models connected to cognitive and stress-response research pathways.",
    "Ipamorelin": "Ipamorelin is a selective ghrelin-receptor pathway research peptide examined in growth-hormone axis laboratory models.",
    "CJC (no DAC)": "CJC (no DAC) is a growth-hormone releasing hormone analog used in laboratory research settings.",
    "Tesamorelin": "Tesamorelin is a growth-hormone releasing hormone analog studied in laboratory and experimental research contexts.",
    "KPV": "KPV is a tripeptide research compound examined in laboratory inflammation-pathway and epithelial models.",
    "NAD+": "NAD+ is a cellular cofactor widely studied in laboratory metabolic and mitochondrial research models.",
    "BPC-157 / TB-500": "This research blend combines BPC-157 and TB-500 for laboratory study. Chemical names only.",
    "BPC-157 / TB-500 / GHK-Cu": "This research blend combines BPC-157, TB-500, and GHK-Cu for laboratory study. Chemical names only — no nicknames.",
    "KPV / BPC-157 / TB-500 / GHK-Cu": "This research blend combines KPV, BPC-157, TB-500, and GHK-Cu for laboratory study. Chemical names only.",
    "MOTS-C": "MOTS-C is a mitochondrial-derived research peptide examined in metabolic laboratory models.",
    "SS-31": "SS-31 is a mitochondria-targeted research peptide studied in cellular bioenergetics laboratory models.",
    "Sermorelin": "Sermorelin is a growth-hormone releasing hormone analog used in laboratory research contexts.",
    "Thymosin Alpha-1": "Thymosin Alpha-1 is an immune-pathway research peptide examined in laboratory models.",
    "PT-141": "PT-141 is a melanocortin pathway research peptide studied in laboratory settings.",
    "CJC (no DAC)/Ipamorelin": "This research blend pairs CJC (no DAC) with Ipamorelin for laboratory GH-pathway study. Chemical names only.",
}

# 150 unique settings (landscape / lab / fitness). No hospitals or doctor offices.
PLACES: list[tuple[str, str, str]] = [
    ("soft pale sand near a turquoise shoreline with gentle rolling waves", "Coastal", "Beach & Ocean"),
    ("pristine white research lab bench with neat empty glassware", "Clean", "Energy & Cellular Power"),
    ("modern fitness center rubber mat with soft-focus dumbbell rack", "Powerful", "Resilience & Strength"),
    ("lush botanical garden path with dappled morning light", "Fresh", "Nature Regeneration"),
    ("premium analytical research bay with soft blue instrument glow", "Crisp", "Focus & Clarity"),
    ("calm stretch studio with light wood floor and rolled mats", "Calm", "Focus & Clarity"),
    ("sunlit wooden boardwalk with ocean horizon and palm shadows", "Warm", "Beach & Ocean"),
    ("sterile-looking white prep bench with organized research tools", "Clean", "Stacks & Synergy"),
    ("boutique gym weight area with daylight from high windows", "Bright", "Resilience & Strength"),
    ("mountain overlook rock with distant soft peaks and drifting clouds", "Serene", "Energy & Cellular Power"),
    ("research cold-storage glass door with soft blue interior light", "Cool", "Longevity & Anti-Aging"),
    ("indoor running track curve with clean lane lines", "Fresh", "Fat Loss & Metabolism"),
    ("quiet lakeside wooden dock with clear water reflections", "Calm", "Nature Escape"),
    ("organized research glassware station with white trays", "Funny", "Stacks & Synergy"),
    ("upscale fitness recovery lounge with plants and warm light", "Warm", "Stacks & Synergy"),
    ("wide open green field under soft blue sky and tall grass", "Open", "Open Land"),
    ("bright research prep station with plain lab tools only", "Clean", "Focus & Clarity"),
    ("outdoor fitness park under coastal morning light", "Coastal", "Fat Loss & Metabolism"),
    ("soft forest path with filtered green light and drifting leaves", "Lush", "Forest"),
    ("premium research QC bay with soft white light and blank clipboard", "Crisp", "Focus & Clarity"),
    ("rooftop terrace at blue hour with distant city bokeh", "Cool", "Nature Escape"),
    ("luxury car passenger seat at dusk with soft dashboard glow", "Warm", "Focus & Clarity"),
    ("poolside cabana with filtered sunlight and calm water", "Coastal", "Beach & Ocean"),
    ("white cyclorama photo studio with softbox key light", "Clean", "Focus & Clarity"),
    ("sleek charcoal studio set with dramatic side rim light", "Dramatic", "Energy & Cellular Power"),
    ("outdoor teak table under soft shade with green foliage behind", "Fresh", "Fields & Gardens"),
    ("quiet study nook with open research papers and soft desk lamp", "Calm", "Focus & Clarity"),
    ("HPLC-adjacent analytical counter with soft UI glow and no hazard marks", "Crisp", "Focus & Clarity"),
    ("yoga deck overlooking calm water at sunrise", "Serene", "Nature Escape"),
    ("climbing-gym crash-pad corner with soft colorful holds blurred", "Bright", "Resilience & Strength"),
    ("greenhouse aisle with misted glass and hanging ferns", "Lush", "Nature Regeneration"),
    ("desert overlook with warm sandstone and wide sky", "Warm", "Desert"),
    ("pine forest clearing with soft shafts of light", "Lush", "Forest"),
    ("modern pilates reformer studio with bright windows", "Fresh", "Resilience & Strength"),
    ("marina dock with gently rocking boats in soft focus", "Coastal", "Beach & Ocean"),
    ("clean lyophilizer observation window in a research suite", "Cool", "Energy & Cellular Power"),
    ("coastal bike path railing with sea oats and breeze", "Coastal", "Beach & Ocean"),
    ("black acrylic riser on a brushed steel research cart", "Crisp", "Focus & Clarity"),
    ("sunset dune ridge with long soft shadows", "Golden", "Beach & Ocean"),
    ("bright cafe-style wellness counter with no medical cues", "Bright", "Stacks & Synergy"),
    ("indoor rock-garden atrium with raked sand patterns", "Zen", "Nature Escape"),
    ("row of empty clean vial trays on a packing bench", "Clean", "Focus & Clarity"),
    ("meadow boardwalk through tall wildflowers", "Pastoral", "Fields & Gardens"),
    ("rain-kissed city balcony with soft droplets on glass", "Moody", "Nature Escape"),
    ("saltwater infinity edge with soft horizon haze", "Coastal", "Beach & Ocean"),
    ("resistance-band wall in a boutique training studio", "Powerful", "Resilience & Strength"),
    ("frosted glass partition research corridor with soft daylight", "Cool", "Focus & Clarity"),
    ("olive-grove dirt path with warm Mediterranean light", "Mediterranean", "Fields & Gardens"),
    ("nighttime pier end with string lights bokeh", "Warm", "Beach & Ocean"),
    ("mass-spec instrument bay with soft teal LEDs and no warning labels", "Crisp", "Energy & Cellular Power"),
    ("turf sprint lane outdoors with stadium lights soft above", "Powerful", "Resilience & Strength"),
    ("koi pond wooden bridge with rippled reflections", "Serene", "Lakes & Water"),
    ("white glove-box exterior view through clear panels", "Clean", "Focus & Clarity"),
    ("canyon trail switchback with warm late light", "Warm", "Open Land"),
    ("foam-roller corner of a recovery gym in an athletic club", "Calm", "Resilience & Strength"),
    ("orchid greenhouse bench with soft pink blooms", "Soft", "Nature Regeneration"),
    ("cliff overlook above coastal water with open sky", "Epic", "Beach & Ocean"),
    ("clean centrifuge bay with soft amber standby lights", "Cool", "Energy & Cellular Power"),
    ("bamboo grove path with vertical green rhythm", "Zen", "Forest"),
    ("mirror-walled dance fitness studio with soft daylight", "Bright", "Resilience & Strength"),
    ("tidal rock shelf with gentle splash pools", "Coastal", "Beach & Ocean"),
    ("label-proofing light table in a documentation room", "Crisp", "Focus & Clarity"),
    ("lavender field edge under pale sky", "Soft", "Fields & Gardens"),
    ("cable-machine corridor in an empty premium gym", "Powerful", "Resilience & Strength"),
    ("alpine lake shoreline with still turquoise water", "Serene", "Lakes & Water"),
    ("clean pass-through window between research rooms", "Clean", "Focus & Clarity"),
    ("surfboard rack alley with sandy wood decks", "Coastal", "Beach & Ocean"),
    ("vibration-plate studio corner with subtle accent light", "Fresh", "Resilience & Strength"),
    ("birch forest boardwalk with pale trunks", "Airy", "Forest"),
    ("COA binder shelf beside a clean research desk", "Crisp", "Focus & Clarity"),
    ("wheat field dirt track under wide clouds", "Pastoral", "Open Land"),
    ("sauna anteroom bench in a spa-fitness athletic club", "Warm", "Resilience & Strength"),
    ("moonlit courtyard fountain with soft ripples", "Moody", "Nature Escape"),
    ("clean utility niche near research equipment with no hazard icons", "Clean", "Energy & Cellular Power"),
    ("paddleboard beach staging area at golden hour", "Golden", "Beach & Ocean"),
    ("TRX suspension bay in a bright functional gym", "Powerful", "Resilience & Strength"),
    ("mossy creek stepping stones with soft mist", "Lush", "Lakes & Water"),
    ("spectrophotometer bench with soft green status light", "Crisp", "Focus & Clarity"),
    ("red-rock mesa overlook at late afternoon", "Dramatic", "Desert"),
    ("spin studio with empty bikes and cool blue wash", "Cool", "Resilience & Strength"),
    ("cherry-blossom path with petals drifting in air", "Soft", "Nature Regeneration"),
    ("clean vial-capping demo jig on a white bench with no hands", "Clean", "Focus & Clarity"),
    ("cliffside hiking trail with ocean far below", "Epic", "Mountains"),
    ("plyometric box corner in a performance gym", "Bright", "Resilience & Strength"),
    ("japanese dry garden with stone and raked gravel", "Zen", "Nature Escape"),
    ("refrigerated sample tower exterior with soft blue wash", "Cool", "Longevity & Anti-Aging"),
    ("vineyard gravel lane between green rows", "Pastoral", "Fields & Gardens"),
    ("boxing-ring corner stool in an empty boutique gym", "Powerful", "Resilience & Strength"),
    ("waterfall viewing deck with soft spray mist", "Atmospheric", "Lakes & Water"),
    ("plain research cabinet exterior with no hazard diamonds", "Clean", "Focus & Clarity"),
    ("snow-dusted evergreen ridge under clear sky", "Crisp", "Mountains"),
    ("battle-rope lane on outdoor artificial turf", "Powerful", "Resilience & Strength"),
    ("urban pocket park with native grasses and benches", "Fresh", "Nature Escape"),
    ("microbalance enclosure with soft side lighting", "Crisp", "Focus & Clarity"),
    ("hot-air balloon field at dawn with soft baskets distant", "Airy", "Open Land"),
    ("rower bank in a quiet cardio bay", "Calm", "Resilience & Strength"),
    ("cactus garden courtyard with warm stucco walls", "Warm", "Desert"),
    ("clean vial carton staging table with plain kraft boxes", "Clean", "Focus & Clarity"),
    ("ferry deck railing with open water wake", "Coastal", "Beach & Ocean"),
    ("medicine-ball wall in a functional fitness loft", "Bright", "Resilience & Strength"),
    ("rainforest boardwalk with dense green canopy", "Lush", "Forest"),
    ("pH meter calibration station on white epoxy top", "Crisp", "Focus & Clarity"),
    ("lavender-and-stone patio with soft shade cloth", "Soft", "Fields & Gardens"),
    ("sled-push turf lane indoors with soft end-wall light", "Powerful", "Resilience & Strength"),
    ("glacier viewpoint railing with cool blue ice distant", "Cool", "Mountains"),
    ("stability-ball studio with soft pastel walls", "Soft", "Resilience & Strength"),
    ("tidal marsh boardwalk with egrets far away", "Coastal", "Lakes & Water"),
    ("clean barcode scan station for research inventory", "Crisp", "Focus & Clarity"),
    ("sunflower field edge with bright late light", "Bright", "Fields & Gardens"),
    ("assault-bike corner with industrial loft windows", "Powerful", "Resilience & Strength"),
    ("foggy redwood trail with soft volumetric light", "Atmospheric", "Forest"),
    ("lyophilized cake visualizer lightbox as a research demo prop", "Clean", "Energy & Cellular Power"),
    ("cliff cart path overlook with ocean and no people", "Coastal", "Beach & Ocean"),
    ("kettlebell rack aisle in a quiet strength studio", "Powerful", "Resilience & Strength"),
    ("rice-terrace overlook with layered green steps", "Lush", "Fields & Gardens"),
    ("clean research-prep carton staging table", "Clean", "Focus & Clarity"),
    ("night desert camp lantern glow with wide stars", "Moody", "Desert"),
    ("stretch-cage mobility bay in a performance center", "Fresh", "Resilience & Strength"),
    ("hidden waterfall grotto pool with soft emerald water", "Lush", "Lakes & Water"),
    ("plain-panel research cart in an analytical aisle", "Crisp", "Focus & Clarity"),
    ("coastal rosemary hedge path with soft distant motion", "Mediterranean", "Fields & Gardens"),
    ("ski-chalet deck with snowy pines at an athletic lodge", "Crisp", "Mountains"),
    ("sand-pit training lane at an outdoor athletic park", "Bright", "Resilience & Strength"),
    ("crystal-clear spring pool with pale limestone", "Serene", "Lakes & Water"),
    ("research library carrel with scientific books stacked", "Calm", "Focus & Clarity"),
    ("lighthouse keeper path with wind-bent grasses", "Windswept", "Beach & Ocean"),
    ("empty gymnastics foam pit edge in a training gym", "Bright", "Resilience & Strength"),
    ("terraced hillside olive press courtyard", "Mediterranean", "Fields & Gardens"),
    ("clean particle counter stand in a soft white room", "Clean", "Focus & Clarity"),
    ("moonlit salt flat with mirror reflections", "Otherworldly", "Desert"),
    ("hydro-row tank studio with glass water channel", "Cool", "Resilience & Strength"),
    ("bamboo tea-garden stone lantern path", "Zen", "Nature Escape"),
    ("clean cryo-dewar bay with soft frost wisp and no hazard art", "Cool", "Energy & Cellular Power"),
    ("wild coast sea-stack overlook with crashing whitewater", "Epic", "Beach & Ocean"),
    ("empty cardio-wall studio with climbing treadmill silhouette", "Fresh", "Resilience & Strength"),
    ("high-altitude meadow with scattered wildflowers", "Open", "Mountains"),
    ("clean research balance room with soft side bounce", "Crisp", "Focus & Clarity"),
    ("lantern-lit evening boardwalk through palms", "Warm", "Beach & Ocean"),
    ("mobility-flow turf with cones and soft dawn light", "Fresh", "Resilience & Strength"),
    ("underground spring cavern walkway with soft LEDs", "Atmospheric", "Lakes & Water"),
    ("clean vial-label applicator bench with precision guides", "Clean", "Focus & Clarity"),
    ("windswept ridge trail with open sky", "Windswept", "Mountains"),
    ("bouldering cave soft-light corner with empty pads", "Powerful", "Resilience & Strength"),
    ("sakura riverside path with soft petal current", "Soft", "Nature Regeneration"),
    ("clean research receiving dock table with plain crates", "Clean", "Focus & Clarity"),
    ("bioluminescent shoreline at night with soft teal glow", "Otherworldly", "Beach & Ocean"),
    ("empty fencing-strip gym with long linear lights", "Crisp", "Resilience & Strength"),
    ("misty highland loch pier with dark water", "Moody", "Lakes & Water"),
    ("clean optical comparator booth for label print checks", "Crisp", "Focus & Clarity"),
    ("sunlit citrus grove ladder lane", "Bright", "Fields & Gardens"),
]

# Keep exactly 150 unique places for the sheet.
PLACES = PLACES[:150]

ANGLES = [
    ("eye-level", "front"),
    ("eye-level", "slight-left"),
    ("eye-level", "slight-right"),
    ("eye-level", "profile-left"),
    ("eye-level", "profile-right"),
    ("low-angle", "front"),
    ("low-angle", "slight-left"),
    ("low-angle", "oblique right"),
    ("high-angle", "front"),
    ("high-angle", "slight-right"),
    ("high-angle", "oblique left"),
    ("slightly elevated", "front"),
    ("slightly elevated", "slight-left"),
    ("slightly elevated", "oblique right"),
    ("slightly elevated", "profile-right"),
]

MOVES = [
    "slow push-in",
    "gentle pull-out",
    "subtle orbit right",
    "subtle orbit left",
    "subtle drift right",
    "subtle drift left",
    "gentle rise",
    "subtle tracking right",
    "subtle tracking left",
    "slow push-in with parallax",
    "micro push then settle",
    "gentle arc right",
    "locked tripod with subject micro-motion",
    "soft crane-down settle",
]

VIBE_PACK = {
    "Funny": ("funny", "bright practicals with playful rim accents", "punchy contrast grade, playful light accents without cartoon look"),
    "Cool": ("cool", "cool soft key + clean rim light", "cool teal-silver grade, clean sterile highlights"),
    "Coastal": ("coastal", "warm coastal key with soft sky fill", "sunlit coastal grade, soft aqua highlights"),
    "Clean": ("clean", "bright even key, soft white bounce", "crisp clean grade, soft neutral whites"),
    "Fresh": ("fresh", "airy soft key, gentle rim", "fresh green-blue grade, light and open"),
    "Calm": ("calm", "soft diffused key, low contrast fill", "calm muted grade, gentle highlights"),
    "Bright": ("bright", "high-key soft daylight", "bright open grade, clean whites"),
    "Warm": ("warm", "warm golden key, soft fill", "warm honey grade, soft contrast"),
    "Crisp": ("crisp", "hard clean key with soft fill", "crisp high-clarity grade, cool edges"),
    "Powerful": ("powerful", "strong key with defined rim", "bold contrast grade, grounded tones"),
    "Serene": ("serene", "soft ambient key, quiet fill", "serene low-saturation grade"),
    "Open": ("open", "wide soft daylight key, airy fill", "open airy grade, soft sky tones"),
    "Lush": ("lush", "filtered green key, soft dappled fill", "lush green grade, gentle contrast"),
    "Dramatic": ("dramatic", "dramatic keyed light with controlled haze and strong speculars", "high-contrast cinematic grade, deep shadows, specular highlights"),
    "Golden": ("golden", "warm golden-hour key, long soft shadows", "golden hour grade, amber highlights"),
    "Zen": ("zen", "soft even daylight, quiet fill", "low-saturation zen grade, gentle contrast"),
    "Pastoral": ("pastoral", "soft natural skylight, warm bounce", "pastoral soft grade, gentle greens"),
    "Moody": ("moody", "low-key soft practicals, cool fill", "moody low-contrast grade, deep blues"),
    "Mediterranean": ("mediterranean", "warm sun key, terracotta bounce", "mediterranean warm grade, soft contrast"),
    "Epic": ("epic", "broad directional key, atmospheric haze", "epic wide grade, rich depth"),
    "Soft": ("soft", "soft overcast key, gentle wrap", "soft pastel-leaning grade, low contrast"),
    "Airy": ("airy", "bright open skylight, minimal shadow", "airy high-key grade, pale tones"),
    "Atmospheric": ("atmospheric", "volumetric soft shafts, gentle haze", "atmospheric mist grade, soft bloom"),
    "Windswept": ("windswept", "hard daylight key, moving air cues", "windswept crisp grade, cool edges"),
    "Otherworldly": ("otherworldly", "unusual soft color key, gentle glow", "stylized night/aurora grade, controlled saturation"),
}

OPENERS = [
    "Hey, I'm Palm Beach Pep — quick research rundown.",
    "Palm Beach Pep here with a calm catalog check-in.",
    "What's up — Pep with a simple research snapshot.",
    "Alright team, Palm Beach Pep on the mic for research only.",
    "Hey hey — Pep checking in from today's set.",
    "Yo — Palm Beach Pep with a clean laboratory note.",
    "Good look — Pep here for a short research breakdown.",
    "Hey friends — Palm Beach Pep, keeping it simple.",
    "Research desk with Pep — let's look at the molecule.",
    "Palm Beach Pep rolling through with catalog facts.",
    "Quick one from Pep.",
    "Hey what's good — Pep with another research snapshot.",
    "Stay curious — Palm Beach Pep on a research note.",
    "Pep here. Short story, clear rules, research focus.",
    "What's cracking — Pep with a laboratory rundown.",
]

CLOSERS = [
    "That's the research snapshot. Stay curious — and keep it lab-only.",
    "Simple facts, clean documentation. Research use only.",
    "That's the rundown from Pep. For laboratory research use only.",
    "Catalog clear, claims out. Research use only.",
    "Thanks for hanging with Pep. Laboratory research use only.",
]

MICROS = [
    "He tips his Palm Beach Vitality hat once.",
    "He glances at his 10ml label, then smiles.",
    "He settles his sneakers, then thumbs-up.",
    "A soft breeze moves his hat brim.",
    "He points to the environment, then thumbs-up.",
    "He does a tiny bounce, then holds.",
    "Light sweeps across his crimp seal.",
    "He waves once, then returns to thumbs-up.",
]


def scrub_nick(text: str) -> str:
    t = text
    for a, b in [
        (r"\bWolverine\b", "BPC-157 / TB-500"),
        (r"\bGLOW\b", "BPC-157 / TB-500 / GHK-Cu"),
        (r"\bKLOW\b", "KPV / BPC-157 / TB-500 / GHK-Cu"),
        (r"CJC-1295 \(DAC\)", "CJC (no DAC)"),
        (r"CJC-1295", "CJC (no DAC)"),
    ]:
        t = re.sub(a, b, t)
    return t


def unique_script(i: int, chemical_name: str, science: str, surface: str) -> tuple[str, str]:
    opener = OPENERS[(i * 3 + len(chemical_name)) % len(OPENERS)]
    closer = CLOSERS[i % len(CLOSERS)]
    science = scrub_nick(science)
    pep_bit = [
        f"Thumbs up — {chemical_name} for the research bench.",
        f"{chemical_name}: clear label, research format, lab only.",
        f"Pep tip: chemical names only. {chemical_name} stays research-focused.",
        f"Keep it curious. {chemical_name} is laboratory research material.",
        f"Friendly reminder from Pep — {chemical_name} is not for people.",
    ][i % 5]
    # Keep VO as one tight spreadsheet line (no embedded newlines).
    script = (
        f"{opener} "
        f"Today we're looking at {chemical_name}. "
        f"{science} "
        f"Today's unique set: {surface}. "
        "Everything stays in the research and laboratory space. No treatment claims. No human-use advice. "
        "Palm Beach Vitality focuses on documentation, purity verification, and clear catalog labeling. "
        f"{pep_bit} "
        f"{closer} "
        f"{DISCLAIMER}"
    )
    return script, pep_bit


def build_row(
    idx: int,
    compound_id: str,
    compound_name: str,
    url: str,
    product_desc: str,
    surface: str,
    theme: str,
    vibe_name: str,
    source_id: str,
    voice_over: str,
    pep_script: str,
    visual_extra: str = "",
) -> dict[str, str]:
    qs, lighting, grade = VIBE_PACK.get(vibe_name, VIBE_PACK["Clean"])
    ang, direc = ANGLES[(idx - 1) % len(ANGLES)]
    move = MOVES[(idx - 1) % len(MOVES)]
    micro = MICROS[(idx - 1) % len(MICROS)]
    visual = (
        f"Palm Beach Pep stands mid-ground in this unique set: {surface}. {micro} {visual_extra} "
        "Environment motion is specific to this location only. No people. No medical settings."
    )
    framing = (
        f"9:16 vertical Pep-mascot framing, {ang} {direc}, "
        "Palm Beach Pep mid-ground hero, full scene depth not extreme macro"
    )
    scene_brief = (
        f"9:16 vertical creation for workflow vid_gen_palm_beach_pep. Visual+motion: {visual} "
        f"Vibe: {vibe_name}. Theme: {theme}. Product lock: {compound_name} ({compound_id}). "
        f"Material: {MATERIAL}. {PEP_LOCK} Keep a full environmental scene — not an isolated void packshot. "
        f"{VIAL_SPEC} {SIGNAGE}"
    )
    hero = (
        f"Palm Beach Pep (10mL crimp-seal vial mascot) mid-ground featuring {compound_name}; "
        "never black twist/screw cap; not extreme macro; no humans"
    )
    video_prompt = (
        f"Animate this 9:16 vertical still. Character: Palm Beach Pep. Product: {compound_name}. Category: vial_10ml. "
        f"Source motion intent: {visual} Hero style: {hero}. Lighting: {lighting}. Grade: {grade}. "
        f"{VIAL_SPEC} {SIGNAGE} Camera move: {move}."
    )
    video_motion = (
        f"{move}; preserve Palm Beach Pep character identity and product lock; "
        f"emphasize unique environmental motion for: {surface}; Pep may gesture thumbs-up; "
        "no new text; no humans; no doctor offices; no hospitals"
    )
    return {
        "creation_id": f"PEP-{idx:03d}",
        "rank": str(idx),
        "category": "vial_10ml",
        "material_detail": MATERIAL,
        "compound_id": compound_id,
        "compound_name": compound_name,
        "canonical_url": url,
        "caption_lock": (
            f"Captions MUST be only about {compound_name} ({compound_id}) and {url}. "
            "Include research-use-only framing. No disease, treatment, or human-use claims. No nicknames."
        ),
        "shot_family": "pep_mascot",
        "camera_angle": ang,
        "camera_direction": direc,
        "framing": framing,
        "scene_brief": scene_brief,
        "quality_var_count": "1",
        "quality_suffix": qs,
        "aspect_ratio": "9:16",
        "duration_seconds": "70",
        "resolution": "1080p",
        "model_still": "grok-imagine-image-quality",
        "model_video": "grok-imagine-video-1.5",
        "still_resolution": "2k",
        "video_prompt": video_prompt,
        "video_motion_prompt": video_motion,
        "status": "Active",
        "times_used": "0",
        "last_used_at": "",
        "reel_still_url": "",
        "video_url": "",
        "surface": surface[:1].upper() + surface[1:],
        "lighting": lighting,
        "camera_move": move,
        "color_grade": grade,
        "hero_style": hero,
        "source_id": str(source_id),
        "vibe": vibe_name,
        "theme": theme,
        "workflow": "vid_gen_palm_beach_pep",
        "voice_over": voice_over,
        "pep_script": pep_script,
        "product_description": product_desc,
        "disclaimer_short": DISCLAIMER,
    }


def main() -> None:
    if len(PLACES) != 150:
        raise SystemExit(f"PLACES count {len(PLACES)} != 150")
    surf_keys = [" ".join(p[0].lower().split()) for p in PLACES]
    dups = [k for k, n in Counter(surf_keys).items() if n > 1]
    if dups:
        raise SystemExit(f"Duplicate places: {dups}")

    upload_path = Path("/home/ubuntu/.cursor/projects/workspace/uploads/Palm_Beach_Pep_100_Scenes_0e93.csv")
    upload = list(csv.DictReader(upload_path.open(newline="", encoding="utf-8")))
    if len(upload) != 100:
        raise SystemExit(f"upload rows {len(upload)}")

    rows: list[dict[str, str]] = []
    for i, u in enumerate(upload, 1):
        surface, vibe, theme = PLACES[i - 1]
        cid, cname, url, pdesc = PRODUCTS[u["Product Name"].strip()]
        raw = scrub_nick(u["Script"])
        parts = [p.strip() for p in re.split(r"\n\s*\n", raw) if p.strip()]
        science = SCIENCE[cname]
        for p in parts:
            if any(
                k in p
                for k in [
                    "peptide",
                    "tripeptide",
                    "cofactor",
                    "analog",
                    "fragment",
                    "amino-acid",
                    "amino acid",
                    "copper",
                    "incretin",
                    "ghrelin",
                    "mitochond",
                ]
            ):
                if "Palm Beach Pep" not in p and "checking in" not in p and "rolling through" not in p:
                    science = p
                    break
        voice, pep = unique_script(i, cname, science, surface)
        rows.append(build_row(i, cid, cname, url, pdesc, surface, theme, vibe, f"UP-{u['Scene #']}", voice, pep))

    extra = [
        "BPC-157",
        "TB-500",
        "MOTS-C",
        "GHK-Cu",
        "Semaglutide",
        "Selank",
        "AOD-9604",
        "CJC (no DAC)/Ipamorelin",
        "Tesamorelin",
        "SS-31",
        "NAD+",
        "Retatrutide",
        "Sermorelin",
        "BPC-157 / TB-500",
        "BPC-157 / TB-500 / GHK-Cu",
        "Thymosin Alpha-1",
        "CJC (no DAC)",
        "Tirzepatide",
        "KPV / BPC-157 / TB-500 / GHK-Cu",
        "PT-141",
        "Ipamorelin",
        "Semax",
        "KPV",
        "MOTS-C",
        "SS-31",
        "GHK-Cu",
        "TB-500",
        "BPC-157",
        "NAD+",
        "AOD-9604",
        "Selank",
        "Tesamorelin",
        "Retatrutide",
        "Semaglutide",
        "Tirzepatide",
        "Sermorelin",
        "Thymosin Alpha-1",
        "PT-141",
        "BPC-157 / TB-500",
        "CJC (no DAC)/Ipamorelin",
        "KPV / BPC-157 / TB-500 / GHK-Cu",
        "BPC-157 / TB-500 / GHK-Cu",
        "Semax",
        "Ipamorelin",
        "KPV",
        "CJC (no DAC)",
        "MOTS-C",
        "SS-31",
        "NAD+",
        "AOD-9604",
    ]
    if len(extra) != 50:
        raise SystemExit(f"extra count {len(extra)}")

    for j, prod in enumerate(extra):
        idx = 101 + j
        surface, vibe, theme = PLACES[idx - 1]
        cid, cname, url, pdesc = PRODUCTS[prod]
        voice, pep = unique_script(idx, cname, SCIENCE[cname], surface)
        rows.append(
            build_row(
                idx,
                cid,
                cname,
                url,
                pdesc,
                surface,
                theme,
                vibe,
                f"GEN-{idx}",
                voice,
                pep,
                visual_extra="This beat uses a one-of-a-kind background detail so it never matches another Pep scene.",
            )
        )

    if len(rows) != 150:
        raise SystemExit(f"row count {len(rows)}")

    surfaces = [" ".join(r["surface"].lower().split()) for r in rows]
    if len(set(surfaces)) != 150:
        raise SystemExit(f"surface unique {len(set(surfaces))}")
    vos = [r["voice_over"] for r in rows]
    if len(set(vos)) != 150:
        c = Counter(vos)
        raise SystemExit(f"voice_over unique {len(set(vos))} dups={[k[:60] for k,n in c.items() if n>1][:3]}")
    if len(set(r["scene_brief"] for r in rows)) != 150:
        raise SystemExit("scene_brief not unique")

    for r in rows:
        blob = r["voice_over"] + r["pep_script"] + r["compound_name"] + r["scene_brief"]
        if "Wolverine" in blob or re.search(r"\bGLOW\b", blob) or re.search(r"\bKLOW\b", blob):
            raise SystemExit(f"nickname leftover in {r['creation_id']}")
        loc_blob = f"{r['surface']} {r['theme']}".lower()
        if "hospital" in loc_blob or "doctor office" in loc_blob or "clinic" in loc_blob:
            raise SystemExit(f"forbidden location in {r['creation_id']}: {r['surface']}")
        if DISCLAIMER not in r["voice_over"]:
            raise SystemExit(f"missing disclaimer {r['creation_id']}")

    out = Path("/workspace/marketing/sheets/150-pb-pep-scenes.csv")
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLS, quoting=csv.QUOTE_ALL)
        w.writeheader()
        w.writerows(rows)

    old = Path("/workspace/marketing/sheets/50_palm_beach_pep_reel_scenes.csv")
    if old.exists():
        old.unlink()

    print(f"Wrote {out} rows={len(rows)} cols={len(COLS)}")
    for i, c in enumerate(COLS, 1):
        print(f"{i}. {c}")
    print("unique_surfaces", len(set(surfaces)))
    print("unique_voice_over", len(set(vos)))
    print(
        "camera_combos",
        len(set((r["camera_angle"], r["camera_direction"], r["camera_move"]) for r in rows)),
    )
    print("products", Counter(r["compound_name"] for r in rows).most_common())


if __name__ == "__main__":
    main()
