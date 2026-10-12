# Halloween Game Jam - Prototype

A cozy, spooky potion-shop prototype. Hold a colored vial to pour into the
cauldron, match the customer's request, then click the cauldron to serve.

This is a work-in-progress prototype, not a finished game.

## Credits

Original game code and g.js engine by Kirk Roerig
([mrpossoms](https://github.com/mrpossoms)); artwork and prototype iteration by
Phing1337. Derived from the shared SpookyJam 26 project. Background music:
SoulfulJamTracks, "Halloween Background Spooky" (612356).
Pixel fonts: Jacquard 12 by Sarah Cadigan-Fried and Pixelify Sans by Stefie
Justprince, distributed under the SIL Open Font License
([Jacquard 12](assets/fonts/jacquard12-OFL.txt),
[Pixelify Sans](assets/fonts/pixelifysans-OFL.txt)).

## Temporary placard editor

Press **D** on the intro screen to toggle the layout editor. Select a text
block to edit its wording, font, position, width, size, alignment, and line
spacing, or drag the outlined text directly. Play is disabled while editing.
The story and instructions are one **Body text** block, so you can balance
them together.
Use the **Line length** slider or the selected block's side handles to control
wrapping. The slider keeps centered/right-aligned text anchored. **Join lines**
removes manual breaks so text reflows; Enter in the text field forces a break.
Press D or Close / preview to check the result. **Copy layout** exports the
settings to paste into chat. Edits last until the page is refreshed; copy them
before leaving. Positions and sizes use the original 300 by 300 art canvas.

## Publishing

Pushes to `main` run the color-mixing and intro-animation tests, bake a self-contained `index.html`,
and deploy it to GitHub Pages. Code, art, and music are included with the
project owner's confirmation that they may be publicly shared.

## Setup

**Requirements**
1. python3
1. [nodejs (>= 20)](https://nodejs.org/en/download)
1. [gitman (pip)](https://pypi.org/project/gitman/)

```sh
gitman install       # Installs g.js as a git submodule in deps/g.js
npm install          # links deps/g.js into node_modules and installs its dependencies
npm run dev          # http://localhost:3001
npm run bake         # Bake as a self-contained html doc dist/my-game.html
```

The engine revision is pinned in `gitman.yml` for reproducible builds.
Run `npm test` for the color-mixing and intro-animation tests.
