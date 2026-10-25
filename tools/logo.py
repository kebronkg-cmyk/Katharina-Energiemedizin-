"""Erzeugt die Bildmarke als Vektor (vier Spiralarme, um 90° rotiert).

Aufruf:  python3 tools/logo.py
Ausgabe: img/logo-mark.svg und favicon.svg

Nachbau des Originallogos (img/logo.webp): Jeder Arm beginnt im
Mittelpunkt, steigt auf und rollt sich im Uhrzeigersinn ein. Der Strich
ist zur Mitte hin kräftig und läuft in der Spirale fein aus. Die drei
anderen Arme sind dieselbe Form, um 90°, 180° und 270° gedreht.
"""
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GOLD = "#A9844A"

SIZE = 100
CX = CY = SIZE / 2
# Drehpunkt der Spirale eines Arms, relativ zum Mittelpunkt
CURL = (6.0, -28.0)
TURNS = 1.75
R_END = 2.0
DECAY = 3.4
STEPS = 160


def arm_points():
    px, py = CX + CURL[0], CY + CURL[1]
    r0 = math.hypot(CX - px, CY - py)
    a0 = math.atan2(CY - py, CX - px)
    pts = []
    for i in range(STEPS + 1):
        t = i / STEPS
        # Radius fällt erst schnell (Stiel), dann ruhig (Einrollung)
        r = R_END + (r0 - R_END) * math.exp(-DECAY * t) - (r0 - R_END) * math.exp(-DECAY) * t
        a = a0 + t * TURNS * 2 * math.pi
        pts.append((px + r * math.cos(a), py + r * math.sin(a)))
    return pts


def tapered_outline(pts, w_start, w_end):
    """Umriss eines Strichs, der von w_start auf w_end ausläuft."""
    left, right = [], []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        x0, y0 = pts[max(0, i - 1)]
        x1, y1 = pts[min(n - 1, i + 1)]
        dx, dy = x1 - x0, y1 - y0
        length = math.hypot(dx, dy) or 1
        nx, ny = -dy / length, dx / length
        t = i / (n - 1)
        half = (w_start + (w_end - w_start) * t ** 0.7) / 2
        left.append((x + nx * half, y + ny * half))
        right.append((x - nx * half, y - ny * half))
    ring = left + right[::-1]
    d = f"M{ring[0][0]:.2f} {ring[0][1]:.2f}" + "".join(f"L{x:.2f} {y:.2f}" for x, y in ring[1:])
    end = pts[-1]
    cap = w_end / 2
    return d + "Z", f'<circle cx="{end[0]:.2f}" cy="{end[1]:.2f}" r="{cap:.2f}"/>'


def center_weave(radius, width):
    """Feines, nach innen gewölbtes Viereck, in dem sich die Arme treffen."""
    pts = arm_points()
    # Punkt jedes Arms, der den gewünschten Abstand zur Mitte hat
    near = next(p for p in pts if math.hypot(p[0] - CX, p[1] - CY) >= radius)
    corners = []
    for k in range(4):
        a = k * math.pi / 2
        x, y = near[0] - CX, near[1] - CY
        corners.append((CX + x * math.cos(a) - y * math.sin(a), CY + x * math.sin(a) + y * math.cos(a)))
    d = f"M{corners[0][0]:.2f} {corners[0][1]:.2f}"
    for k in range(1, 5):
        x, y = corners[k % 4]
        d += f"Q{CX:.2f} {CY:.2f} {x:.2f} {y:.2f}"
    return f'<path d="{d}" fill="none" stroke="{GOLD}" stroke-width="{width}"/>'


def svg(w_start, w_end, title=True, weave=True):
    d, cap = tapered_outline(arm_points(), w_start, w_end)
    arms = "\n".join(
        f'    <g transform="rotate({deg} {CX} {CY})"><path d="{d}"/>{cap}</g>'
        for deg in (0, 90, 180, 270)
    )
    t = "  <title>Weg der vier Winde</title>\n" if title else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" '
        f'role="img" aria-label="Weg der vier Winde">\n{t}'
        f'  <g fill="{GOLD}">\n{arms}\n  </g>\n'
        + (f"  {center_weave(11, 0.7)}\n" if weave else "")
        + "</svg>\n"
    )


if __name__ == "__main__":
    (ROOT / "img/logo-mark.svg").write_text(svg(4.0, 1.1))
    (ROOT / "favicon.svg").write_text(svg(7, 2.8, title=False, weave=False))
    print("logo-mark.svg und favicon.svg geschrieben")
