"""Legt ruhige Platzhalterbilder für noch fehlende Ausschnitte an.

Aufruf:  python3 tools/placeholders.py
Nur Dateien, die in img/ noch nicht existieren, werden erzeugt.
Sobald tools/crop.py mit den echten Postern läuft, werden sie überschrieben.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "img"

# Ziel -> (Breite, Höhe), grob nach den Zuschnitten aus crop.py
SIZES = {
    "portrait-willkommen.webp": (900, 1100),
    "portrait-tiefe.webp": (800, 900),
    "portrait-weide.webp": (800, 1100),
    "portrait-weide-ganz.webp": (700, 1000),
    "portrait-ueber-mich.webp": (420, 520),
    "eisberg.webp": (900, 900),
    "trommel.webp": (1600, 900),
    "passionsblume.webp": (800, 900),
    "weide-natur.webp": (1000, 1000),
    "mesa.webp": (1600, 700),
    "klaerung.webp": (1600, 600),
    "kreativ.webp": (700, 1100),
    "gemaelde.webp": (800, 1000),
    "seil.webp": (1600, 800),
    "feder.webp": (400, 400),
    "landschaft.webp": (1600, 900),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default(size=28)
    for name, (w, h) in SIZES.items():
        path = OUT / name
        if path.exists():
            continue
        img = Image.new("RGB", (w, h), (233, 222, 203))
        d = ImageDraw.Draw(img)
        d.rectangle((12, 12, w - 13, h - 13), outline=(200, 184, 158), width=2)
        label = f"Platzhalter\n{name}"
        d.multiline_text((w / 2, h / 2), label, fill=(120, 98, 74), font=font, anchor="mm", align="center")
        img.save(path, "WEBP", quality=70)
        print("Platzhalter", name)


if __name__ == "__main__":
    main()
