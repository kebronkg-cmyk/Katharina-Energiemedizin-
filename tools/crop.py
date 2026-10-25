"""Schneidet die textfreien Bildteile aus Katharinas Postern aus.

Aufruf:
    pip install Pillow
    python3 tools/crop.py            # alle Ausschnitte
    python3 tools/crop.py eisberg    # nur Ausschnitte, deren Ziel 'eisberg' enthält

Ablauf je Poster:
  1. schwarze Screenshot-Ränder entfernen (Zeilen/Spalten fast reines Schwarz)
  2. nach den Prozentwerten aus CROPS zuschneiden
  3. leicht angleichen (wärmer, bei KI-Bildern etwas weniger Sättigung)
  4. auf max. 1600 px Breite skalieren, als WebP (Qualität 82) speichern

Danach tools/preview.html im Browser öffnen und prüfen: Kein Ausschnitt
darf Text, Logos oder Ränder enthalten. Sonst Werte in CROPS anpassen und
neu schneiden.
"""
import html
import sys
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
OUT = ROOT / "site" / "img"
PREVIEW = ROOT / "tools" / "preview.html"

MAX_WIDTH = 1600
QUALITY = 82
MIN_SHARP_WIDTH = 700
# Ein Pixel gilt als "schwarz", wenn alle Kanäle darunter liegen
BLACK_LEVEL = 18
# Anteil schwarzer Pixel, ab dem eine Zeile/Spalte als Rand gilt
BLACK_SHARE = 0.97

# (Poster, Ziel, x von, x bis, y von, y bis, KI-Bild?)
# Werte in % nach dem Entfernen der schwarzen Ränder.
CROPS = [
    # Ausschnitte an den gelieferten Postern ausgemessen
    ("willkommen.jpg", "portrait-willkommen.webp", 53, 100, 0, 100, False),
    ("mut-zur-tiefe.jpg", "portrait-tiefe.webp", 58, 100, 21.5, 68, False),
    # Eisberg-Grafik aus „Mut zur Tiefe“, bis ein eigenes Eisberg-Poster da ist
    ("mut-zur-tiefe.jpg", "eisberg.webp", 15, 48, 28.3, 45.3, False),
    ("energetische-arbeit.jpg", "portrait-weide.webp", 57, 100, 0, 97.5, False),
    ("landkarte-arbeit.jpg", "portrait-weide-ganz.webp", 61, 100, 23, 99, False),
    # vorläufiges Porträt aus „Herzlich willkommen“, bis „Über mich“ da ist
    ("willkommen.jpg", "portrait-ueber-mich.webp", 63, 88, 6, 47.5, False),
    ("ueber-mich-persoenlich.jpg", "portrait-ueber-mich.webp", 2, 22, 23, 71, False),
    ("eisberg.jpg", "eisberg.webp", 22, 78, 34, 68, True),
    ("schamanisch-einzigartig.jpg", "trommel.webp", 50, 100, 0, 47, True),
    ("heilung.jpg", "passionsblume.webp", 56, 100, 30, 85, True),
    ("natur.jpg", "weide-natur.webp", 46, 100, 0, 100, True),
    ("mesa.jpg", "mesa.webp", 0, 100, 58, 83, False),
    ("klaerung.jpg", "klaerung.webp", 0, 100, 66, 90.5, True),
    ("kreativ.jpg", "kreativ.webp", 5, 42, 18, 98, True),
    ("alles-ist-energie.jpg", "gemaelde.webp", 54, 100, 0, 79, False),
    ("cord-cutting.jpg", "seil.webp", 0, 100, 12, 40, True),
    ("seelenanteile.jpg", "feder.webp", 48, 70, 15, 33, True),
    ("logo-seite.jpg", "landschaft.webp", 0, 100, 60, 100, True),
]


def trim_black(img):
    """Entfernt umlaufende Zeilen/Spalten, die fast nur aus Schwarz bestehen."""
    gray = img.convert("RGB")
    w, h = gray.size
    px = gray.load()

    def is_black(x, y):
        r, g, b = px[x, y]
        return r < BLACK_LEVEL and g < BLACK_LEVEL and b < BLACK_LEVEL

    # jede 2. Stichprobe reicht und spart Zeit bei großen Screenshots
    def row_black(y):
        n = sum(is_black(x, y) for x in range(0, w, 2))
        return n >= BLACK_SHARE * len(range(0, w, 2))

    def col_black(x):
        n = sum(is_black(x, y) for y in range(0, h, 2))
        return n >= BLACK_SHARE * len(range(0, h, 2))

    top = 0
    while top < h - 1 and row_black(top):
        top += 1
    bottom = h
    while bottom - 1 > top and row_black(bottom - 1):
        bottom -= 1
    left = 0
    while left < w - 1 and col_black(left):
        left += 1
    right = w
    while right - 1 > left and col_black(right - 1):
        right -= 1
    return img.crop((left, top, right, bottom))


def warm(img, ai):
    """Leicht wärmerer Weißabgleich; KI-Bilder etwas entsättigen."""
    r, g, b = img.split()
    r = r.point(lambda v: min(255, int(v * 1.03)))
    b = b.point(lambda v: int(v * 0.95))
    img = Image.merge("RGB", (r, g, b))
    if ai:
        img = ImageEnhance.Color(img).enhance(0.88)
    return img


def crop_one(src, dst, x0, x1, y0, y1, ai):
    img = Image.open(RAW / src).convert("RGB")
    img = trim_black(img)
    w, h = img.size
    box = (round(w * x0 / 100), round(h * y0 / 100), round(w * x1 / 100), round(h * y1 / 100))
    img = warm(img.crop(box), ai)
    if img.width > MAX_WIDTH:
        img = img.resize((MAX_WIDTH, round(img.height * MAX_WIDTH / img.width)), Image.LANCZOS)
    img.save(OUT / dst, "WEBP", quality=QUALITY, method=6)
    return img.size


def write_preview(results):
    cards = []
    for src, dst, size, error in results:
        if error:
            body = f'<p class="err">{html.escape(error)}</p>'
        else:
            w, h = size
            warn = (
                f'<p class="warn">Nur {w} px breit – nur klein verwenden (Kreis, Karte, Akzent).</p>'
                if w < MIN_SHARP_WIDTH else ""
            )
            body = f'<img src="../site/img/{dst}" alt=""><p>{w} × {h} px</p>{warn}'
        cards.append(
            f"<figure><figcaption><b>{dst}</b><br><small>aus raw/{src}</small></figcaption>{body}</figure>"
        )
    PREVIEW.write_text(f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kontrolle Bildausschnitte</title>
<style>
  body {{ font: 15px/1.5 system-ui, sans-serif; background: #f3eadc; color: #2a231e; margin: 0; padding: 24px; }}
  h1 {{ font-size: 20px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }}
  figure {{ margin: 0; background: #fff; padding: 12px; border: 1px solid #e2d6c3; }}
  img {{ width: 100%; height: auto; display: block; outline: 1px dashed #c00; }}
  .warn {{ color: #8a5a00; }} .err {{ color: #b00020; }}
  .logos {{ display: flex; gap: 24px; align-items: center; background: #fbf8f2; padding: 16px; margin-bottom: 24px; flex-wrap: wrap; }}
  .logos img {{ width: auto; height: 160px; outline: none; }}
</style></head><body>
<h1>Kontrolle der Bildausschnitte</h1>
<p>Prüfen: kein eingebrannter Text, kein Logo, kein schwarzer Rand. Sonst Werte in <code>tools/crop.py</code> anpassen und neu schneiden.</p>
<h2>Logo-Vergleich: Nachbau (SVG) und Original</h2>
<div class="logos"><img src="../site/img/logo-mark.svg" alt="Nachbau"><img src="../site/img/logo-original.webp" alt="Original"></div>
<div class="grid">
{chr(10).join(cards)}
</div>
</body></html>
""")


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    for src, dst, x0, x1, y0, y1, ai in CROPS:
        if only and only not in dst:
            continue
        if not (RAW / src).exists():
            results.append((src, dst, None, f"raw/{src} fehlt"))
            print(f"FEHLT  raw/{src}")
            continue
        size = crop_one(src, dst, x0, x1, y0, y1, ai)
        note = "  (unter 700 px – nur klein verwenden)" if size[0] < MIN_SHARP_WIDTH else ""
        print(f"ok     {dst:28s} {size[0]}×{size[1]}{note}")
        results.append((src, dst, size, None))
    write_preview(results)
    print(f"Kontrollseite: {PREVIEW.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
