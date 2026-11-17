"""
Prepares the articulated walker layers for the Roadshow audience arrival.

Source: public/outdoor/roadshow/crowd-d-right.webp (never modified).
Output:
  public/outdoor/roadshow/walkers/<id>-<part>.webp   one transparent layer per body part
  public/outdoor/roadshow/crowd-d-right-rest.webp    the original crowd with the walkers removed
  components/outdoor/audience-walkers.manifest.ts    layer boxes + joints (generated, do not edit)

Parts per walker: torso (head, torso, arms, pelvis), and for each leg a thigh, a shank and a shoe.
They are cut from the person's own alpha silhouette: the leg split follows the real gap/crease
between the legs, not a rectangle, and neighbouring people are excluded by their own boundaries.
Layers overlap by a few pixels at the joints so that, at rest, they re-assemble the original photo.

Run:  python scripts/prepare-audience-walkers.py     (needs Pillow + numpy)
"""
import json
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public/outdoor/roadshow/crowd-d-right.webp")
OUT = os.path.join(ROOT, "public/outdoor/roadshow/walkers")
REST = os.path.join(ROOT, "public/outdoor/roadshow/crowd-d-right-rest.webp")
MANIFEST = os.path.join(ROOT, "components/outdoor/audience-walkers.manifest.ts")
OVERLAP = 7

WALKERS = [
    {
        "id": "a",  # man in the blue shirt, dark trousers: legs clearly apart, full shoes
        "x": (262, 575),
        # where this man's sleeve overlaps the neighbouring woman's dupatta (x 535-575, y<560) the
        # man's pixels are the blue ones; elsewhere right of x=535 belongs to the woman
        "color_zone": ((535, 575), (300, 560)),
        "hip": 582,  # torso/leg cut line (pelvis pivot)
        "knee": 710,
        "ankle": 870,
        # centre line of the gap between the legs: (y, x)
        "split": [(540, 449), (592, 449), (700, 450), (800, 430), (870, 417), (940, 417)],
    },
    {
        "id": "b",  # man in the cream shirt, grey trousers: legs together, loafers
        "x": (766, 948),
        "hip": 590,
        "knee": 715,
        "ankle": 872,
        # the visible crease between the trouser legs, then the boundary between the two shoes
        "split": [(540, 875), (580, 877), (700, 882), (800, 888), (850, 893), (940, 894)],
    },
]


def split_x(split, h):
    ys = [p[0] for p in split]
    xs = [p[1] for p in split]
    ys_full = np.arange(h)
    return np.interp(ys_full, ys, xs)


def save_layer(rgba, mask, name, entries):
    """Crop the masked layer to its bounding box, save, and record its box."""
    layer = rgba.copy()
    layer[..., 3] = np.where(mask, layer[..., 3], 0)
    ys, xs = np.where(layer[..., 3] > 0)
    if len(xs) == 0:
        raise SystemExit("empty layer " + name)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    img = Image.fromarray(layer[y0:y1, x0:x1], "RGBA")
    img.save(os.path.join(OUT, name + ".webp"), quality=94, method=6, alpha_quality=100)
    entries[name] = {"file": f"/outdoor/roadshow/walkers/{name}.webp", "x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}


def main():
    os.makedirs(OUT, exist_ok=True)
    src = np.array(Image.open(SRC).convert("RGBA"))
    H, W = src.shape[:2]
    alpha = src[..., 3] > 0
    rows = np.arange(H)[:, None]
    cols = np.arange(W)[None, :]
    rest_alpha = src[..., 3].copy()
    manifest = {}
    for w in WALKERS:
        person = alpha & (cols >= w["x"][0]) & (cols < w["x"][1])
        if "color_zone" in w:
            (zx0, zx1), (zy0, zy1) = w["color_zone"]
            r, b = src[..., 0].astype(int), src[..., 2].astype(int)
            in_zone = (cols >= zx0) & (cols < zx1) & (rows >= zy0) & (rows < zy1)
            right_of = cols >= zx0
            person = person & ~(right_of & ~(in_zone & (b > r + 8)))
        sx = split_x(w["split"], H)[:, None]
        left = cols < sx
        hip, knee, ankle = w["hip"], w["knee"], w["ankle"]
        entries = {}
        save_layer(src, person & (rows < hip), f"{w['id']}-torso", entries)
        for side, sidemask in (("l", left), ("r", ~left)):
            leg = person & sidemask
            save_layer(src, leg & (rows >= hip - OVERLAP) & (rows < knee + OVERLAP), f"{w['id']}-thigh-{side}", entries)
            save_layer(src, leg & (rows >= knee - OVERLAP) & (rows < ankle + OVERLAP), f"{w['id']}-shank-{side}", entries)
            save_layer(src, leg & (rows >= ankle), f"{w['id']}-shoe-{side}", entries)
        ys, xs = np.where(person)
        shoe_rows = person & (rows >= ankle)
        sy, sx2 = np.where(shoe_rows)
        manifest[w["id"]] = {
            "parts": entries,
            "joints": {"hip": hip, "knee": knee, "ankle": ankle, "overlap": OVERLAP},
            "feet": {"x": int((sx2.min() + sx2.max()) // 2), "y": int(sy.max())},
            "pelvisX": int((xs.min() + xs.max()) // 2),
        }
        rest_alpha = np.where(person, 0, rest_alpha)
        if "color_zone" in w:  # dark anti-aliased sleeve fringe left on the neighbour's edge
            fringe = (cols >= w["x"][0]) & (cols < w["color_zone"][0][0] + 6) & (rows < w["hip"])
            rest_alpha = np.where(fringe, 0, rest_alpha)
    rest = src.copy()
    rest[..., 3] = rest_alpha
    Image.fromarray(rest, "RGBA").save(REST, quality=94, method=6, alpha_quality=100)
    with open(MANIFEST, "w", encoding="utf8") as f:
        f.write("/* Generated by scripts/prepare-audience-walkers.py. Do not edit. */\n")
        f.write("export type WalkerPart = { file: string; x: number; y: number; w: number; h: number };\n")
        f.write("export type WalkerAssets = {\n  parts: Record<string, WalkerPart>;\n  joints: { hip: number; knee: number; ankle: number; overlap: number };\n  feet: { x: number; y: number };\n  pelvisX: number;\n};\n")
        f.write('export const WALKER_RESTCROWD = "/outdoor/roadshow/crowd-d-right-rest.webp";\n')
        f.write("export const WALKER_ASSETS: Record<string, WalkerAssets> = " + json.dumps(manifest, indent=2) + ";\n")
    print("ok", {k: v["feet"] for k, v in manifest.items()})


main()
