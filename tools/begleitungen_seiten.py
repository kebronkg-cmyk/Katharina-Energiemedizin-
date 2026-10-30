"""Erzeugt für jede Begleitung eine eigene Unterseite, damit Google sie einzeln finden kann.

Aufruf:  python3 tools/begleitungen_seiten.py

Die Texte kommen unverändert aus den ausführlichen Fassungen der Startseite
(dem versteckten Bereich „offer-store“), das Seitengerüst aus der Seite
„Kreative Integration“. Die Seiten sind auf der Website nicht verlinkt; Google findet sie
über die sitemap.xml. Neu erzeugen, wenn sich ein Begleitungstext ändert.
"""
import html
import json
import re
from pathlib import Path

from seo_variante import AREAS, BASE

ROOT = Path(__file__).resolve().parent.parent / "site"

# data-id -> (Pfad, Seitentitel für Google)
PAGES = {
    "illumination": ("energetische-reinigung-illumination", "Energetische Reinigung · Illumination · Energiearbeit München"),
    "cord-cutting": ("loslassen-cord-cutting", "Loslassen von Ex-Partner, Eltern und alten Bindungen · Cord Cutting München"),
    "entkopplung": ("stress-loslassen-entkopplung", "Stress loslassen und zur Ruhe kommen · Entkopplung · Energiearbeit München"),
    "rollen": ("opferrolle-verlassen-dramadreieck", "Raus aus der Opferrolle · Täter-Opfer-Retter-Dreieck (Dramadreieck) · München"),
    "extraktion": ("belastende-energien-loesen-extraktion", "Belastende Energien lösen · Extraktion · Energiearbeit München"),
    "rueckverbindung": ("seelenrueckholung", "Seelenrückholung · Rückverbindung mit Anteilen von dir · München"),
    "landkarte": ("glaubenssaetze-veraendern", "Alte Glaubenssätze verändern · Arbeit mit der inneren Landkarte · München"),
}


def text_of(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def description(body):
    words = text_of(body)
    if len(words) <= 155:
        return words
    cut = words[:152].rsplit(" ", 1)[0]
    return cut + " …"


def build():
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    template = (ROOT / "kreative-integration" / "index.html").read_text(encoding="utf-8")
    head, rest = template.split('  <main id="main">', 1)
    tail = rest.split("  </main>", 1)[1]
    store = index[index.index('<div class="offer-store"'):]
    made = []
    for oid, wind, inner in re.findall(r'<article data-id="([^"]+)" data-wind="([^"]+)">(.*?)</article>', store, re.S):
        slug, title = PAGES[oid]
        tag = re.search(r'<p class="arch-tag">(.*?)</p>', inner, re.S).group(1).strip()
        name = re.search(r"<h3>(.*?)</h3>", inner, re.S).group(1).strip()
        body = re.sub(r'\s*<p class="arch-tag">.*?</p>\s*<h3>.*?</h3>', "", inner, count=1, flags=re.S).strip()
        desc = description(body)
        service = {"@context": "https://schema.org", "@type": "Service", "name": text_of(name),
                   "alternateName": text_of(tag), "description": desc,
                   "url": f"{BASE}{slug}/", "serviceType": "Schamanische Energiearbeit",
                   "provider": {"@type": "LocalBusiness", "name": "Weg der vier Winde · Katharina", "url": BASE,
                                "address": {"@type": "PostalAddress", "addressLocality": "München",
                                            "addressRegion": "Bayern", "addressCountry": "DE"}},
                   "areaServed": [{"@type": "Place", "name": a} for a in AREAS]}
        page_head = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title, quote=False)}</title>", head, count=1)
        page_head = re.sub(r'<link rel="canonical" href="[^"]*">',
                           f'<link rel="canonical" href="https://wegdervierwinde.de/{slug}/">', page_head, count=1)
        page_head = re.sub(r'<meta name="description" content="[^"]*">',
                           f'<meta name="description" content="{html.escape(desc)}">', page_head, count=1)
        page_head = page_head.replace("</head>",
                                      f'  <script type="application/ld+json">{json.dumps(service, ensure_ascii=False)}</script>\n</head>', 1)
        main = f'''  <main id="main">
    <section class="page-head">
      <p class="label rise">{wind}</p>
      <h1 class="rise">{name}</h1>
      <p class="lead rise">{tag}</p>
    </section>

    <section class="page-body">
      <div class="ki-panel offer-page">
        <div class="offer-text rise">
          {body}
        </div>
        <div class="ki-close rise">
          <img src="../img/logo-mark.webp" alt="" width="321" height="275" decoding="async">
          <a class="ki-cta" href="../#kennenlernen">30 Minuten kostenloses Erstgespräch</a>
        </div>
      </div>

      <div class="page-nav">
        <a class="gate" href="../#begleitungen">
          <span class="gate-medal"><img src="../img/logo-mark.webp" alt="" width="321" height="275" loading="lazy" decoding="async"></span>
          <span class="gate-text"><small>Zurück zu den</small>Begleitungen</span>
        </a>
      </div>
    </section>
'''
        out = ROOT / slug / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(page_head + main + "  </main>" + tail, encoding="utf-8")
        made.append(slug)
        print("geschrieben", f"{slug}/index.html")
    return made


if __name__ == "__main__":
    build()
