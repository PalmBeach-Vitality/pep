#!/usr/bin/env python3
"""Generate a 1080x1080 Palm Beach Vitality laboratory spotlight PNG."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

NAVY = (10, 22, 40)
TEAL = (13, 148, 136)
SAND = (248, 244, 236)
MUTED = (140, 156, 172)
WHITE = (255, 255, 255)
DISCLAIMER = (
    "For laboratory research use only. Not for human use or consumption. "
    "Not a drug, dietary supplement, or cosmetic. Not evaluated by the FDA."
)

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSansDisplay-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
FONT_REG_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSansDisplay-Regular.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def find_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    if not words:
        return [""]
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def draw_grid(draw: ImageDraw.ImageDraw, size: int = 1080) -> None:
    step = 54
    grid = (16, 30, 48)
    for x in range(0, size, step):
        draw.line([(x, 0), (x, size)], fill=grid, width=1)
    for y in range(0, size, step):
        draw.line([(0, y), (size, y)], fill=grid, width=1)


def generate(
    *,
    headline: str,
    subhead: str,
    bullets: list[str],
    cta: str,
    product_form: str,
    outfile: Path,
) -> Path:
    size = 1080
    img = Image.new("RGB", (size, size), NAVY)
    draw = ImageDraw.Draw(img)
    draw_grid(draw)

    # Soft teal glow (top-right)
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((620, -180, 1280, 480), fill=(13, 148, 136, 38))
    gdraw.ellipse((-200, 720, 420, 1220), fill=(13, 148, 136, 22))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    brand_font = find_font(FONT_CANDIDATES, 28)
    eyebrow_font = find_font(FONT_REG_CANDIDATES, 24)
    headline_font = find_font(FONT_CANDIDATES, 92 if len(headline) < 18 else 72)
    subhead_font = find_font(FONT_REG_CANDIDATES, 34)
    bullet_font = find_font(FONT_REG_CANDIDATES, 28)
    cta_font = find_font(FONT_CANDIDATES, 26)
    disc_font = find_font(FONT_REG_CANDIDATES, 18)

    margin = 72
    y = 70
    draw.text((margin, y), "PALM BEACH VITALITY", font=brand_font, fill=SAND)
    y += 56
    draw.text((margin, y), "Laboratory research material", font=eyebrow_font, fill=TEAL)
    if product_form:
        form_w = draw.textlength(product_form.upper(), font=eyebrow_font)
        draw.text((size - margin - form_w, y), product_form.upper(), font=eyebrow_font, fill=MUTED)
    y += 90

    for line in wrap(draw, headline, headline_font, size - margin * 2):
        draw.text((margin, y), line, font=headline_font, fill=WHITE)
        y += int(headline_font.size * 1.05) if hasattr(headline_font, "size") else 90
    y += 18
    draw.rectangle((margin, y, margin + 120, y + 4), fill=TEAL)
    y += 36

    for line in wrap(draw, subhead, subhead_font, size - margin * 2):
        draw.text((margin, y), line, font=subhead_font, fill=SAND)
        y += 44
    y += 36

    for bullet in bullets[:3]:
        if not bullet:
            continue
        draw.ellipse((margin, y + 10, margin + 10, y + 20), fill=TEAL)
        bx = margin + 28
        for line in wrap(draw, bullet, bullet_font, size - bx - margin):
            draw.text((bx, y), line, font=bullet_font, fill=SAND)
            y += 40
        y += 12

    # CTA + disclaimer pinned near bottom
    cta_y = 880
    draw.rectangle((margin, cta_y, margin + 420, cta_y + 64), outline=TEAL, width=2)
    cta_text = cta or "View laboratory listing"
    tw = draw.textlength(cta_text, font=cta_font)
    draw.text((margin + (420 - tw) / 2, cta_y + 18), cta_text, font=cta_font, fill=TEAL)

    dy = 970
    for line in wrap(draw, DISCLAIMER, disc_font, size - margin * 2):
        draw.text((margin, dy), line, font=disc_font, fill=MUTED)
        dy += 24

    outfile.parent.mkdir(parents=True, exist_ok=True)
    img.save(outfile, "PNG", optimize=True)
    return outfile


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--headline", required=True)
    p.add_argument("--subhead", default="Laboratory research material")
    p.add_argument("--bullet", action="append", default=[])
    p.add_argument("--cta", default="View laboratory listing")
    p.add_argument("--product-form", default="Pen")
    p.add_argument("--out", required=True)
    args = p.parse_args()
    bullets = args.bullet or [
        "Chemical identification for laboratory catalogs",
        f"{args.product_form} research format",
        "Laboratory research use only",
    ]
    path = generate(
        headline=args.headline,
        subhead=args.subhead,
        bullets=bullets,
        cta=args.cta,
        product_form=args.product_form,
        outfile=Path(args.out),
    )
    print(path)


if __name__ == "__main__":
    main()
