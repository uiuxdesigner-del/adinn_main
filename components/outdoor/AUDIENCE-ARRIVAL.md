# Audience arrival (Roadshow opening)

**Status: DISABLED (walking incomplete).** The articulated 2D walk did not pass the quality gate (see below), so the grounded stationary audience is shown. The code and assets are kept for a future real-footage version.

## Why it failed
- The audience's feet sit at the very bottom of the frame. For most of the walk the feet are below the viewport, so only rigid torsos and trouser columns rise: a floating cut-out.
- When a lifted shoe is visible, the single back-view still has no knee bend, heel roll or sole, so the shoe translates and separates from the trouser leg.
- Walkers must start nearer the camera than the crowd, so they read as oversized.

## What would fix it
Real footage or a coherent frame sequence of people walking away from the camera, on this plaza's ground plane, with the feet inside the frame (which also needs the audience framed higher in the viewport).

Image-based 2D walk of two people from the supplied audience photo. No 3D, no video.

## Files (everything for this feature)
- `audience-arrival.ts`: switch, gait maths, DOM layers. Single call site in `outdoor-story.tsx` (marked "audience arrival feature").
- `audience-walkers.manifest.ts`: generated layer boxes and joints.
- `public/outdoor/roadshow/walkers/*.webp`: the layers. `crowd-d-right-rest.webp`: the right crowd without the two walkers.
- `scripts/prepare-audience-walkers.py`: regenerates all of the above from `crowd-d-right.webp` (never modified).

## Switch
`enableAudienceArrivalAnimation` in `audience-arrival.ts`.
- `false`: the original stationary audience (`crowd-d-right.webp`) from the opening; no walker code, layers or listeners run. Later parallax and the LED approach are unchanged.
- To remove entirely ("revert the human animation"): set it false, or delete the files above and the marked lines in `outdoor-story.tsx`.

## How it walks
- One input: the distance walked. A step table (full steps, then one closing half step) is built from the path length and perspective scale; legs are functions of distance only.
- Stance foot: moves back relative to the body at exactly the body's speed, so it stays planted. Swing foot: moves forward with a small lift. Both end level in the stationary pose.
- Parts per person: torso (head, torso, arms, pelvis), and per leg thigh / shank / shoe. Hip = pelvis cut line, knee = thigh/shank split, ankle = shank/shoe split. Legs foreshorten vertically as the foot moves along the ground (the person walks away from the camera). Torso sways about the pelvis by 0.4 degrees.
- Perspective: people start nearer the camera (larger) and shrink as they walk away.
- Scroll: arrival progress is latched. Fast scrolling settles straight into the watching pose; scrolling back holds the settled audience (no backwards walking) and the arrival resets only near the top.

## People used / blocked
Used: the man in the blue shirt (dark trousers) and the man in the cream shirt (grey trousers). Both have full legs and shoes and are not overlapped by neighbours.
Not used: the saree and kurta wearers (legs hidden by garments), and people in the left crowd whose legs overlap each other or neighbours (a lifted leg would expose pixels the photo does not contain).
