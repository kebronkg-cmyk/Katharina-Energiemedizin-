"""Bereitet die gemalten Himmelsszenen für /v3/ auf.

Aufruf:  python3 tools/scenes.py
Quelle:  raw/szene-<name>-quer.jpg   (mitte, sueden, westen, norden, osten)
Ausgabe: v3/img/szene-<name>.webp        (max. 2560 px breit)
         v3/img/szene-<name>-1280.webp   (für Handys)
         v3/img/medaillon-<name>.webp    (quadratischer Ausschnitt für den Kompass)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
OUT = ROOT / "v3" / "img"

# Mittelpunkt des Medaillon-Ausschnitts in Bildanteilen (x, y)
FOCUS = {
    "mitte": (0.505, 0.5),
    "sueden": (0.66, 0.5),
    "westen": (0.47, 0.5),
    "norden": (0.70, 0.5),
    "osten": (0.55, 0.5),
}


def soften(img, box, amount):
    """Mildert den Kontrast einer Form zum Himmel, ohne die Pinselstruktur
    zu verwischen: eine stark weichgezeichnete Fassung wird nur leicht
    und mit weich auslaufender Maske darübergelegt."""
    w, h = img.size
    mask = Image.new("L", img.size, 0)
    x0, y0, x1, y1 = (round(v * s) for v, s in zip(box, (w, h, w, h)))
    ImageDraw.Draw(mask).ellipse((x0, y0, x1, y1), fill=round(255 * amount))
    mask = mask.filter(ImageFilter.GaussianBlur(radius=w // 30))
    blurred = img.filter(ImageFilter.GaussianBlur(radius=w // 60))
    return Image.composite(blurred, img, mask)


def prepare(name, img):
    if name == "westen":
        # kräftiges Orange an der Wolkenunterseite etwas zurücknehmen
        img = ImageEnhance.Color(img).enhance(0.88)
    if name == "osten":
        # Kondor einen Hauch natürlicher: Form leicht ins Licht verblenden
        img = soften(img, (0.06, 0.02, 0.97, 0.5), 0.3)
    return img


def save(img, path, width=None, quality=85):
    if width and img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    img.save(path, "WEBP", quality=quality, method=6)
    return img.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (fx, fy) in FOCUS.items():
        img = prepare(name, Image.open(RAW / f"szene-{name}-quer.jpg").convert("RGB"))
        print(name, save(img, OUT / f"szene-{name}.webp", 2560),
              save(img, OUT / f"szene-{name}-1280.webp", 1280, 80))
        side = img.height
        cx = min(max(round(img.width * fx), side // 2), img.width - side // 2)
        sq = img.crop((cx - side // 2, 0, cx + side // 2, side))
        save(sq, OUT / f"medaillon-{name}.webp", 640, 82)


if __name__ == "__main__":
    main()
