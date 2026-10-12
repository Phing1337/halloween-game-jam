# Halloween Game Jam - Prototype

A cozy, spooky potion-shop prototype. Hold a colored vial to pour into the
cauldron, match the customer's request, then click the cauldron to serve.

This is a work-in-progress prototype, not a finished game.

## Credits

Original game code and g.js engine by Kirk Roerig
([mrpossoms](https://github.com/mrpossoms)); artwork and prototype iteration by
Phing1337. Derived from the shared SpookyJam 26 project. Background music:
SoulfulJamTracks, "Halloween Background Spooky" (612356).
The Gothic heading uses UnifrakturCook by j. 'mach' wust and Peter Wiegel,
distributed under the [SIL Open Font License](assets/fonts/unifrakturcook-OFL.txt).

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
