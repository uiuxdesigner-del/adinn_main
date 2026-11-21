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

## Regression check: Outdoor banner -> Havells signage -> shop (white-screen handoff)

Run this after ANY change to `components/shop/shop-story.tsx`, `shop-config.ts` (`R.swap`, camera keys), `storefront-scene.tsx`, `components/outdoor/*` or `components/motion/smooth-scroll.tsx`.

Sequence that must hold: banner zoom -> Havells board enters from the RIGHT while the Adinn art leaves left -> brief hold -> zoom out to the shop. No frame may be blank/white.

Past causes (do not reintroduce):
1. The shop stage is revealed by `syncStage` in `shop-story.tsx`. Never gate it on `scroll() >= start`: `onEnter` fires a few px early (`anticipatePin`), the compare fails, nothing re-runs it, and the stage stays at opacity 0 (white page) for the whole chapter. Gate on `isActive || progress > 0` and re-sync in `onUpdate`.
2. Sign slide distances are in storefront units while the camera is zoomed ~3.9x (view ~370 units wide). Distances must be sized to the visible width (`slide.out` / `slide.inn`), and the board must start entering before the art has fully left.
3. Grey tiles / a torn sign during the zoom-out (the storefront photo and interior unpainted, the TV floating alone). Cause: the Havells board was live CSS (blurred multi-layer `box-shadow`, masked image, clipped rounded corners) inside the world layer, which the camera scales every frame, so the browser repainted it at every new scale and slower machines fell behind. The board is now painted once into a canvas (`components/shop/board-art.ts`, baked in `shop-story.tsx` before the stage is revealed); the compositor only scales the bitmap. The CSS layers (`.sh-board-drop/-frame/-in`) remain only as the fallback until the canvas has painted. Do not move blurred shadows, masks or clip-heavy content back into live CSS inside `.sh-world`. The doorway photo is a light copy (always there) under the HD copy (shown only once decoded; never waited for).

How to verify (real wheel input, not only `scrollTo`, which skips the crossing): scroll slowly with `mouse.wheel` from p = -0.04 to 0.2 at desktop and ~390px width, then back; fast 500px wheel flicks across the boundary and stop mid-swap; reload at p = -0.01, 0.03, 0.06, 0.1, 0.2. Screenshot every step; each frame below the header needs real content (the Adinn art, the red board, or the shop). Also read `#shop-story [data-stage]` `style.opacity`: it must be `1` while the pin is active.
