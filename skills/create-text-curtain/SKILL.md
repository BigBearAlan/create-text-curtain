---
name: create-text-curtain
description: Create or integrate an interactive text curtain whose vertical character columns behave like independent beaded strands disturbed by a gentle breeze. Use when the user asks for a text curtain, beaded text strands, wind-swept typography, swinging columns of characters, pointer-reactive text, or an interaction matching the bundled text-curtain demo in a plain HTML, React, Vue, or other browser project.
---

# Create Text Curtain

Build a canvas-rendered field of vertical character strands. Let pointer movement impart small local impulses, then let tension and damping produce a subtle residual swing.

## Choose the integration path

- For a new standalone demo, copy all files from `assets/vanilla-template/` into the requested destination.
- For an existing web project, inspect its framework and current visual language first. Adapt the engine from `assets/vanilla-template/curtain.js` into the existing component lifecycle and styling; do not replace unrelated files or create a separate app unless requested.
- Keep the effect dependency-free unless the target project already has a rendering or physics library that materially simplifies integration.

## Preserve the motion contract

Implement these behaviors:

- Treat every text column as an independent strand pinned at its top.
- Treat every character as a bead along that strand.
- Respond to pointer movement without requiring a click or drag.
- Apply an impulse only to beads near the pointer path, then spread a smaller impulse to nearby beads on the same strand.
- Continue oscillating briefly after the pointer passes.
- Keep the movement gentle: it should resemble wind, not fabric being grabbed or thrown.
- Return smoothly to the original aligned grid.
- Support pointer and touch events, resize correctly, and respect `prefers-reduced-motion`.

Do not substitute a single radial warp, whole-sheet deformation, or CSS-only hover transform. Those approaches do not produce independently swinging strands.

## Tune conservatively

Start from the bundled values. When adjusting the motion, change one family at a time:

- Lower `glancingPush` and `partingPush` for weaker pointer influence.
- Lower the velocity clamp and `travelLimit` for a smaller swing.
- Increase damping loss for faster settling; decrease it slightly for a longer residual sway.
- Adjust string tension only after pointer intensity and damping feel correct.

Prefer a broad, low-force collision over a narrow, violent strike. Keep maximum travel visually below roughly four character-column gaps unless the user explicitly asks for dramatic motion.

## Adapt the content and appearance

- Replace the bundled Chinese sample string with the user's content when supplied.
- Match the target project's fonts, colors, spacing, and background.
- Preserve an accessible text equivalent outside the canvas.
- Keep the canvas interaction isolated from surrounding controls and page scrolling.
- Do not add decorative architecture, shadows, ceilings, or unrelated scenery unless requested.

## Verify

1. Run the project using its existing development command, or serve the standalone template locally.
2. Confirm the initial text forms straight, evenly spaced columns.
3. Move the pointer across several columns at slow and fast speeds.
4. Confirm only nearby strands move, the movement stays restrained, and the strands continue a small back-and-forth swing after the pointer passes.
5. Confirm the field settles without permanent drift and resizing rebuilds it cleanly.
6. Check the browser console for errors and test the relevant responsive breakpoint.

If the visual result is too strong, reduce impulse and travel before increasing damping. Excess damping hides the swing instead of making it naturally subtle.
