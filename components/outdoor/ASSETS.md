# Roadshow -> Outdoor / OOH chapters: assets and alignment

Enabled by `ENABLE_OOH_STORY = true` in `config/story.ts` (false renders the earlier full story and
nothing here loads). When enabled, this section tells chapters 1-2 (Roadshows, Outdoor) and
`<VisualStory start={2} />` continues with the remaining chapters (Signage onward) unchanged.

## Files

`public/outdoor/aerial/` (one shared canvas, **1672 x 941 px**, full-canvas placement):

| File | Content |
|---|---|
| `background.webp` | Clean aerial environment (road, planting, buildings, sky). No clouds baked in. |
| `hoarding-structure.webp` | Transparent: the unipole only (face left plain for the HTML artwork). |
| `clouds-mist.webp`, `clouds-lower.webp`, `clouds-left.webp`, `clouds-right.webp` | Four cloud groups, drawn in that order. **Derived** from the single supplied cloud image (see below). |

`public/outdoor/roadshow/truck.webp`: the supplied 512 x 288 truck flattened on white and Lanczos-upscaled
3x (1536 x 864). Upscaling does not add detail, so the vehicle is soft when the camera nears the screen.

The earlier ground-level layers in `public/outdoor/*.png` are unused by this version.

## Alignment (all in `outdoor-config.ts`)

- `faceQuad`: advertising-face corners (flood-filled on the structure, inset 3px).
- `base`: pole base, bottom centre of the plinth, (1176, 706).
- `truck.led`: LED panel corners on the 1536 x 864 truck image.
- `ledRegion`: part of the aerial canvas shown on the LED (2:1, matches the panel). When the panel fills the
  viewport this is exactly what is on screen, so the aerial chapter continues from identical pixels.
- `opening`: centre of the cloud opening (clouds scale about it); `desktopFocus` / `mobileFocus`: static crops.
- `motion`: scroll length, scrub, progress breakpoints, per-group cloud travel and growth.

## Cloud limitation (important)

Only one cloud image was supplied (a full-frame veil with a central opening). The four files are a
soft partition of it around that opening, using weights that sum to one and a transmittance-preserving
alpha split, so the opening frame equals the supplied composite. They are NOT independently photographed
groups: where two groups part you can see their soft shared boundary through the cloud. Replace the four
files with truly separate transparent cloud groups on the same canvas for a cleaner result (no code change).

## Other notes

- Artwork is HTML (official `/Adinn.png`, unaltered, Poppins), projected onto `faceQuad`, and shares the
  structure's transform so it stays attached. Without JS the face stays plain.
- Maximum zoom is 1.7x the handoff scale (~1.65x the source pixels): the 1672px layers are soft there.
- The enquiry form cannot preselect Outdoor, so the CTA links to `ENQUIRY_HREF` only.
- Record each asset's source and licence in `IMAGE-SOURCES.md`.
