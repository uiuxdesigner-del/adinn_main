/**
 * Selects the active homepage story. Exactly one is ever rendered.
 *
 * ENABLE_OOH_STORY = false: the earlier multi-vertical photo story
 *   (components/story/visual-story.tsx) renders. No Outdoor code or asset runs.
 * ENABLE_OOH_STORY = true: components/outdoor/outdoor-story.tsx renders chapters 1-2 and
 *   the earlier story continues from chapter 3.
 *
 * true:  Roadshow -> Outdoor (aerial, layered clouds) first, then the earlier story from Signage onward.
 * Assets and alignment: components/outdoor/ASSETS.md.
 */
export const ENABLE_OOH_STORY = true;
