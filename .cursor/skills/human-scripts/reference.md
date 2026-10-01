# Human Script Agent — reference

Load this when writing or linting a Pep VO. SKILL.md is the entry.

## Banned openers

Do not start a script or section with:

- In today's video / In this article / In this post
- Have you ever wondered
- What if I told you
- Picture this
- Let's dive in / Let's dive deep
- Welcome back to the channel
- Without further ado
- In a world where
- In today's fast-paced / ever-evolving landscape
- Don't scroll (overused; banned as a default)

## Banned vocabulary

Do not use these unless they appear in a required quote or product name:

delve, tapestry, testament, underscore, pivotal, intricate, meticulously,
garner, vibrant, bolster, interplay, exemplify, renowned, groundbreaking,
nestled, realm, embark, leverage, elevate, unlock, unleash, harness,
robust, seamless, holistic, myriad, plethora, cornerstone, beacon,
game-changer, paradigm, synergy, ecosystem (figurative), landscape (figurative),
empower, utilize, facilitate, comprehensive, cutting-edge, revolutionary,
innovative (as filler), noteworthy, crucial, vital role, foster, showcase

## Banned phrases

Do not use:

- it's not X, it's Y
- it's not just X, it's Y
- not X. Y.
- the real question isn't X, it's Y
- at the end of the day
- when it comes to
- it's important to note that
- it is worth noting
- in order to
- due to the fact that
- plays a vital/crucial role
- serves as a testament
- marks a pivotal moment
- navigate the
- unlock the power of
- in conclusion / to summarize / ultimately (as a closer)
- furthermore / moreover / additionally as sentence openers
- rest assured
- look no further
- the good news is / the bad news is (as a formula)

## Banned structures

- Rule of three used as decoration
- Perfect parallel lists where every item is the same length and grammar
- Rhetorical Q then immediate tidy answer, over and over
- Section that restates the title before saying anything new
- Fake warmth: "Great question!", "I'd be happy to help", "Let's explore"
- Em dash chains. One dash is fine. A paragraph full of them is not. Prefer none in spoken VO.
- Cartoon fillers (um, uh, like, you know) unless Sal asks for a messy read.

## Spoken / TTS rules

When the output will be said out loud or sent to TTS:

- Short lines. One idea per sentence most of the time.
- Put a line break where a breath belongs.
- Write numbers the way a mouth says them: "twenty four" or "24" plus a hint if the TTS needs it.
- Avoid tongue twisters, stacked sibilants, and long clause piles.
- Prefer "here's the thing" / "so" / "look" over "additionally."
- Do not add cartoon fillers (um, uh, like, you know) unless the user explicitly wants a messy conversational read.
- Do not add fake laugh tracks or stage directions like [chuckles] unless the user asked for performance markup.
- If using emotion tags for a TTS model, keep them sparse and only where a real speaker would shift.

Spoken VO must never include: for laboratory research use only, not for human use or consumption, not evaluated by the FDA, research use only, treat/cure/diagnose/prevent. Those stay on `caption_lock`.

## Cloned Pep intro

Do not open with `I'm Palm Beach Pep, [verb]ing this [noun]`. Weave identity after a set-specific hook.

Lint lives in `marketing/scripts/human_script_lib.py` (`CLONED_INTRO`, `lint_script()`).

## What similar agents get wrong for this brand

- Viral script agents invent hooks from trends. We cannot invent peptide claims.
- Humanizer prompts want to kill "studies have shown." Our studies line is locked legal/brand copy.
- 75–85 word 30s scripts 422 OmniHuman at 1080p. Pep TTS is ~2.51 wps. Stay 65–74.
- Adding um/uh or slang to "sound human" is a different fake. Do not.

Humanizing is not adding slang, typos, or "um." The real tells are structure: tidy contrasts, identical list items, throat-clearing openings, and words nobody says out loud.

If the draft is empty of specifics, a rewrite will still sound generic. Put in a real example, a real constraint, or a real opinion first.

## Prompt library

Copy any prompt. Always include: who is speaking, who they are talking to, whether this will be **read** or **spoken / TTS**, facts that must not change.

### 1. One-shot rewrite (most used)

```text
Rewrite the text below so it sounds like a real person talking, not an AI draft.

Keep every fact, name, number, claim, and citation. Do not add new claims or stories. If a human detail would help and I did not give one, insert [NEED: short note] instead of inventing it.

Write for the ear. Contractions on. Mix short and long sentences. Kill banned AI words and "it's not X, it's Y" constructions. No "in today's video" openers. No "in conclusion."

Audience: [who]
Speaker: [who is talking, in one line]
Use: [YouTube / ad / TTS voiceover / email / landing page / Reel]

TEXT:
[paste]
```

### 2. Spoken script pass (YouTube, Reels, TTS)

```text
Turn this into a spoken script.

Rules:
- One idea per line.
- Line break = breath.
- Hook in the first 8 seconds without a cliche opener.
- Talk to one person.
- No listicle cadence unless I asked for a list.
- Mark optional pause points with / 
- Keep it under [X] words.
- Do not add um/uh.
- End on a clear next step, not a recap paragraph.

TEXT:
[paste]
```

### 3. TTS / Orpheus-ready pass

```text
Rewrite this for text-to-speech.

Goals: easy mouth shapes, natural pacing, no robotic lists.

Rules:
- Sentences mostly under 16 words.
- No stacked clauses.
- Spell tricky words the way they should be said if pronunciation will break.
- Write "mg" as "milligrams" if it will be spoken.
- Keep product names exact.
- Sparse emotion only if it helps the line, using simple tags the model accepts, such as <laugh> or <sigh>. Do not sprinkle tags on every sentence.
- Output plain script only, ready to paste into TTS.

TEXT:
[paste]
```

### 4. Keep my voice

```text
Use the writing sample as the voice source of truth. Match rhythm, vocabulary, humor, and punctuation. Do not copy sentences.

Then rewrite the draft in that voice. Same facts. No new stories.

VOICE SAMPLE:
[paste 2-4 paragraphs you actually wrote]

DRAFT:
[paste]
```

### 5. Cut 30 percent without losing the point

```text
Cut this by about 30 percent.

Delete throat-clearing, repeated ideas, and any sentence that only announces what the next sentence will say. Keep the claims. Make what remains sound spoken.
```

### 6. Diff mode (when you want to learn the tells)

```text
Humanize the draft. Then show:
1. The rewritten script
2. A short bullet list of the AI tells you removed
3. Any line you wanted to make more human but could not without a missing fact
```

### 7. Hook killer

```text
Write 8 alternative openings for this script.

Each hook must be 1-2 sentences, specific, and say something a viewer could repeat. None may use: have you ever, what if I told you, picture this, in today's, let's dive, welcome back.

Then pick the strongest one and write the first 20 seconds of the script from it.
```

### 8. Compliance-safe health / peptide voice

```text
Rewrite this for a wellness brand audience that is smart and skeptical.

Tone: calm, direct, no miracle language.
Do not add medical claims. Do not say treat, cure, diagnose, or prevent.
Keep research wording hedged only where the source is actually hedged.
No hype adjectives. No "unlock your body's potential."
Sound like a knowledgeable person, not a brochure and not a bro-science rant.

TEXT:
[paste]
```

Cursor prompt names: `humanize` `spoken` `tts` `voice-match` `cut30` `tells` `hooks` `wellness-safe`.

## Read-aloud checklist

- [ ] First line would not fit every other video on the internet
- [ ] You can say the first 10 seconds in one breath plus one pause
- [ ] At least one short punch sentence per section
- [ ] No banned opener
- [ ] No "it's not X, it's Y"
- [ ] No delve / leverage / tapestry / seamless / unlock / game-changer
- [ ] Contractions present where a person would use them
- [ ] No invented anecdote
- [ ] Numbers and product names still accurate
- [ ] Ending is a next step, not "in conclusion"
- [ ] You would not be embarrassed to say this to one smart friend
- [ ] 30s is 65–74 words; 60s is 140–150 words
- [ ] Locked studies + COA + store CTA are verbatim
- [ ] Contains `I'm Palm Beach Pep`
- [ ] No FDA / lab-only / not-for-human-use in spoken VO

## Files

| File | Role |
|---|---|
| `.cursor/skills/human-scripts/SKILL.md` | This skill |
| `.cursor/rules/human-scripts.mdc` | Cursor rule (marketing globs) |
| `marketing/HUMAN_SCRIPT_AGENT.md` | Full agent spec |
| `marketing/scripts/human_script_lib.py` | Word count, locked lines, lint |
| `marketing/scripts/build_20_pep_scenes.py` | Live 20 × 30s sheet + VO review |
| `marketing/scripts/build_pep_60s_human.py` | Review-only 20 × 60s |
| `marketing/n8n-pep-20-vo-review.md` | Sal's 30s read list |
| `marketing/n8n-pep-60s-human-vo.md` | Sal's 60s read list |
| `marketing/scripts/test_human_scripts.py` | Lint both buckets |
| `marketing/sheets/150-pb-pep-scenes.csv` | Live `voice_over` |

CSV blob (this branch):

https://github.com/PalmBeach-Vitality/pep/blob/cursor/human-script-agent-0411/marketing/sheets/150-pb-pep-scenes.csv

Raw:

https://raw.githubusercontent.com/PalmBeach-Vitality/pep/cursor/human-script-agent-0411/marketing/sheets/150-pb-pep-scenes.csv
