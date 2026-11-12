"""Suchmaschinen-Optimierung der Website: Seitentitel, Beschreibungen, Ort (München),
Bildbeschreibungen und strukturierte Daten. Katharinas Texte bleiben unverändert.

Aufruf:  python3 tools/seo_variante.py           (auf die Hauptseite anwenden)
         python3 tools/seo_variante.py --kopie   (als Kopie unter eigenem Pfad bauen)

Die Variante übernimmt den aktuellen Stand aller Seiten und ändert nur, was für Google
zählt: Seitentitel, Beschreibungen, Hinweis auf den Ort (München), Fachbegriffe, nach denen
gesucht wird, Bildbeschreibungen und strukturierte Daten (Unternehmen, Häufige Fragen).
Sie bleibt wie die Hauptseite für Suchmaschinen gesperrt (_headers und meta robots).
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "site"
SLUG = "q6r5z428uxjbr3"
PAGES = ["", "ueber-mich/", "kreative-integration/", "lebensspuren/", "impressum/", "datenschutz/", "danke/"]
ASSET = r"(?:css|js|img|assets|v3|fonts)/|favicon\.svg"

TITLES = {
    "": ("Weg der vier Winde · Schamanismus & Energiearbeit in München · Katharina",
         # Wortlaut von Katharina
         "Schamanische Energiearbeit in München – in der Tradition der Anden und des Amazonas. "
         "Energie- und Körperarbeit für Klarheit, Wandlung und neue Lebendigkeit."),
    "ueber-mich/": ("Über mich · Katharina · Schamanische Energiearbeit München · Weg der vier Winde",
                    "Katharina, schamanische Energiearbeit in München-Pasing: ihr persönlicher Weg zum Schamanismus "
                    "und zur indigenen Heilkunst der Anden und des Amazonas."),
    "kreative-integration/": ("Kreative Integration in der Energiearbeit · Weg der vier Winde München",
                              "Kreative Integration in der schamanischen Energiearbeit in München: authentische Bewegung, "
                              "Tanz, intuitives Malen, Klang und das Sandbild."),
    "lebensspuren/": ("Kunstausstellung Lebensspuren · Bilder von Katharina · Weg der vier Winde",
                      "Kunstausstellung Lebensspuren: Gemälde von Katharina, Energiearbeit in München."),
}

# kleine, sichtbare Änderungen auf der Startseite (alt -> neu)
INDEX_EDITS = [
    ('alt="Katharina mit langem roten Haar und hellem Haarband, lächelnd"',
     'alt="Katharina, schamanische Energiearbeit in München, mit langem roten Haar und hellem Haarband, lächelnd"'),
    ('alt="Katharinas Mesa: ein gewebtes rotes Tuch mit den Kuyas, den Steinen der Kraft, draußen am Wasser"',
     'alt="Katharinas Mesa für die schamanische Energiearbeit: ein gewebtes rotes Tuch mit den Kuyas, den Steinen der Kraft, draußen am Wasser"'),
]


def rewrite_paths(text, depth):
    """Pfade zu Dateien der Hauptseite eine Ebene tiefer setzen."""

    def fix(url):
        m = re.match(r"((?:\.\./)*)(" + ASSET + r")(.*)", url)
        if not m:
            return url
        return "../" + m.group(1) + m.group(2) + m.group(3) if depth == 0 or m.group(1) else url

    def attr(m):
        name, val = m.group(1), m.group(2)
        if name == "srcset":
            parts = [p.strip() for p in val.split(",")]
            val = ", ".join(" ".join([fix(p.split()[0])] + p.split()[1:]) for p in parts)
        else:
            val = fix(val)
        return f'{name}="{val}"'

    return re.sub(r'\b(src|href|srcset|data-full)="([^"]*)"', attr, text)


def faq_schema(text):
    items = []
    for q, a in re.findall(r"<summary>(.*?)</summary>(.*?)</details>", text, re.S):
        answer = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", a))).strip()
        items.append({"@type": "Question", "name": html.unescape(q.strip()),
                      "acceptedAnswer": {"@type": "Answer", "text": answer}})
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": items}


BASE = "https://wegdervierwinde.de/"

# Orte rund um Pasing, für die Google die Seite kennen soll (nur in den unsichtbaren Daten)
AREAS = ["München", "München-Pasing", "Pasing-Obermenzing", "Laim", "Aubing", "Neuhausen-Nymphenburg",
         "Gräfelfing", "Planegg", "Germering", "Puchheim", "Gröbenzell", "Fürstenfeldbruck", "Starnberg",
         "Landkreis München", "Landkreis Fürstenfeldbruck", "Landkreis Starnberg", "Oberbayern"]

TOPICS = ["Schamanismus", "Schamanische Energiearbeit", "Andenschamanismus", "Schamanische Reise",
          "Energiearbeit", "Energiemedizin", "Körperarbeit", "Medizinrad", "Weg der vier Winde", "Mesa",
          "Munay-Ki", "Illumination", "Cord Cutting", "Entkopplung", "Extraktion", "Seelenrückholung",
          "Schattenarbeit", "Dramadreieck", "Glaubenssätze verändern", "Kreative Integration"]

BUSINESS = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "name": "Weg der vier Winde · Katharina",
    "alternateName": "Weg der vier Winde",
    "url": BASE,
    "image": BASE + "img/logo-mark.webp",
    "description": "Schamanismus und schamanische Energiearbeit, Körperarbeit und kreative Integration in München-Pasing "
                   "nach der Tradition der Anden und des Amazonas.",
    "telephone": "+49 1573 4359358",
    "email": "energie.medizin@web.de",
    "address": {"@type": "PostalAddress", "addressLocality": "München", "addressRegion": "Bayern", "addressCountry": "DE"},
    "areaServed": [{"@type": "Place", "name": a} for a in AREAS],
    "knowsAbout": TOPICS,
    "keywords": ", ".join(TOPICS + [t + " München" for t in ("Schamanismus", "Energiearbeit", "Schamanische Energiearbeit")]),
    "sameAs": ["https://www.instagram.com/katharinawegdervierwinde/"],
    "makesOffer": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "url": BASE + u}} for n, u in [
        ("Illumination", "energetische-reinigung-illumination/"), ("Cord Cutting – energetische Bänder lösen", "loslassen-cord-cutting/"),
        ("Entkopplung", "stress-loslassen-entkopplung/"), ("Extraktion", "belastende-energien-loesen-extraktion/"),
        ("Rückverbindung mit Anteilen (Seelenrückholung)", "seelenrueckholung/"),
        ("Täter-Opfer-Retter-Dreieck", "opferrolle-verlassen-dramadreieck/"),
        ("Arbeit mit der inneren Landkarte", "glaubenssaetze-veraendern/")]],
}


def build(main=True):
    """main=True: Änderungen direkt in die Hauptseite schreiben (mehrfach ausführbar).
    main=False: Kopie unter SLUG bauen."""
    out_root = ROOT if main else ROOT / SLUG
    for page in PAGES:
        text = (ROOT / page / "index.html").read_text(encoding="utf-8")
        depth = page.count("/")
        if not main:
            text = rewrite_paths(text, depth)
        if page in TITLES:
            title, desc = TITLES[page]
            text = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title, quote=False)}</title>", text, count=1)
            text = re.sub(r'<meta name="description" content="[^"]*">',
                          f'<meta name="description" content="{html.escape(desc)}">', text, count=1)
        if page == "":
            for old, new in INDEX_EDITS:
                assert old in text or new in text, old[:60]
                text = text.replace(old, new)
            text = re.sub(r'\n  <script type="application/ld\+json">.*?</script>', "", text)
            ld = "".join(f'\n  <script type="application/ld+json">{json.dumps(d, ensure_ascii=False)}</script>'
                         for d in (BUSINESS, faq_schema(text)))
            text = text.replace("</head>", ld + "\n</head>", 1)
            text = re.sub(r'\n\s*\n(\s*<script type="application/ld\+json">)', r"\n\1", text)
        target = out_root / page / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")
        print("geschrieben", target.relative_to(ROOT))


if __name__ == "__main__":
    import sys
    build(main="--kopie" not in sys.argv)
