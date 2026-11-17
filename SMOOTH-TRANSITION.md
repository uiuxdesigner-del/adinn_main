# Smooth transition

Standing rule for the whole project. When the owner says **"smooth transition"** (or complains about fading or ghosting), apply this.

## The rule

A transition must **change one thing into the next**, not dissolve one picture over another.

- **Morph, don't cross-fade.** Move, scale, clip or reshape the same element from its start state to its end state (position, size, corner radius, shadow, clip). The element stays fully opaque while it moves.
- **Never show two copies at once.** No layer fading out on top of a layer fading in, especially for text, logos or artwork. Two slightly different copies overlapping reads as a double image ("ghosting").
- **No new image for a transition.** Reuse the same asset. Do not add a separate picture, mock-up or plate just to hide a cut.
- **Hand-off must be identical.** If a swap between layers is unavoidable, both layers show the exact same pixels at the exact same transform on that frame, so the swap is invisible.
- **Fade only what is secondary.** Background chrome may dissolve *underneath* the moving element, never over it, and only while the main element covers it.
- **Ease everything** (smoothstep or a critically-damped glide). No linear ramps, no hard cuts, no pop-in. Drive related layers from one progress value so they move together.
- **Check it frame by frame.** Scrub the transition slowly and look for doubled text, flashes, jumps and edges that appear.

## Where this applies

All scroll stories and animated sections (shop story, outdoor billboard, home sections, any new motion).

## Reference fix

`components/shop/shop-art.ts` `drawDigital`: the creative card used to be drawn twice (small card in the page, then a bigger copy fading in over it), which doubled "Be seen / Be chosen". It is now one card that grows from the card position to full screen, while the page dissolves underneath it.
