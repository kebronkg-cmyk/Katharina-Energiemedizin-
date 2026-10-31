"""Stellt das Originallogo aus einem Screenshot frei.

Aufruf:  python3 tools/logo_raster.py [raw/logo-screenshot.png]

Sucht die helle Logo-Fläche zwischen den schwarzen Screenshot-Rändern,
macht den cremefarbenen Hintergrund transparent und speichert:
  img/logo.webp             komplettes Logo (Bildmarke, Schriftzug, Zeile, Bogen)
  img/logo-mark.webp        nur die vier Spiralen
  img/logo-schriftzug.webp  nur „Weg der vier Winde“
  img/logo-original.webp    unveränderter Ausschnitt zum Vergleich

Sobald Katharina eine Vektordatei oder ein hochaufgelöstes Logo liefert,
diese Dateien einfach durch die neuen ersetzen.
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "img"

# Teilbereiche in % des Logo-Ausschnitts (x von, y von, x bis, y bis)
PARTS = {
    "logo-mark.webp": (35.5, 8.0, 64.5, 49.5),
    "logo-schriftzug.webp": (3.5, 46.0, 96.5, 69.0),
}
# Bereich, der vor dem Schriftzug-Ausschnitt geleert wird: das untere
# Ende der Bildmarke ragt zwischen die Oberlängen der Schrift
MARK_TAIL = (40.0, 44.0, 60.0, 51.0)


def find_panel(img):
    """Größte helle, warmtonige Fläche (cremefarben, nicht grau)."""
    px = img.load()
    w, h = img.size

    def cream(x, y):
        r, g, b = px[x, y]
        return r + g + b > 600 and r - b > 12

    # Zeile gehört zur Fläche, wenn mehr als die Hälfte cremefarben ist
    # (die Logo-Striche selbst unterbrechen sie so nicht)
    bright = [y for y in range(h) if sum(cream(x, y) for x in range(0, w, 8)) > w / 16]
    # längster zusammenhängender Block heller Zeilen
    best, start = (0, 0), None
    for i, y in enumerate(bright):
        if start is None or y != bright[i - 1] + 1:
            start = y
        if y - start > best[1] - best[0]:
            best = (start, y)
    top, bottom = best
    mid = (top + bottom) // 2
    cols = [x for x in range(w) if cream(x, top + 4)]
    # 3 px Sicherheitsabstand gegen Kantenartefakte
    return img.crop((cols[0] + 3, top + 3, cols[-1] - 2, bottom - 2))


def knock_out(img):
    """Cremigen Hintergrund transparent machen, Gold erhalten."""
    img = img.convert("RGB")
    w, h = img.size
    # Hintergrundfarbe aus den Ecken schätzen
    corners = [img.getpixel(p) for p in [(4, 4), (w - 5, 4), (4, h - 5), (w - 5, h - 5)]]
    bg = tuple(sum(c[i] for c in corners) / 4 for i in range(3))
    ink_b = 60.0  # Blaukanal des dunkelsten Golds
    out = Image.new("RGBA", (w, h))
    src, dst = img.load(), out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            a = (bg[2] - 14 - b) / (bg[2] - 14 - ink_b)
            a = max(0.0, min(1.0, a))
            if a <= 0:
                dst[x, y] = (0, 0, 0, 0)
                continue
            # Farbe vom Hintergrund „entmischen“
            rr, gg, bb = ((c - (1 - a) * bc) / a for c, bc in zip((r, g, b), bg))
            dst[x, y] = (
                int(max(0, min(255, rr))),
                int(max(0, min(255, gg))),
                int(max(0, min(255, bb))),
                int(a * 255),
            )
    return out


def trim(img, pad=6):
    box = img.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    l, t, r, b = box
    return img.crop((max(0, l - pad), max(0, t - pad), min(img.width, r + pad), min(img.height, b + pad)))


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "raw" / "logo-screenshot.png"
    panel = find_panel(Image.open(src).convert("RGB"))
    OUT.mkdir(parents=True, exist_ok=True)
    panel.save(OUT / "logo-original.webp", "WEBP", quality=90)
    clear = knock_out(panel)
    trim(clear).save(OUT / "logo.webp", "WEBP", quality=92)
    w, h = clear.size
    for name, (x0, y0, x1, y1) in PARTS.items():
        src_img = clear
        if name == "logo-schriftzug.webp":
            src_img = clear.copy()
            mx0, my0, mx1, my1 = MARK_TAIL
            src_img.paste((0, 0, 0, 0), (round(w * mx0 / 100), round(h * my0 / 100), round(w * mx1 / 100), round(h * my1 / 100)))
        part = src_img.crop((round(w * x0 / 100), round(h * y0 / 100), round(w * x1 / 100), round(h * y1 / 100)))
        trim(part).save(OUT / name, "WEBP", quality=92)
    for name in ["logo.webp", *PARTS]:
        print(name, Image.open(OUT / name).size)


if __name__ == "__main__":
    main()
