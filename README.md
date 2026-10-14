# Henok Emyaye — Chalkboard Portfolio

One-page portfolio built with Vite + React. Everything is drawn with SVG chalk strokes and handwritten Google fonts (Kalam, Patrick Hand, Caveat).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

`netlify.toml` is included, so connecting the repo to Netlify deploys it as-is.

## Add your images

Put your files in `public/images/` using these exact names:

| File                         | Used for                                              |
| ---------------------------- | ----------------------------------------------------- |
| `public/images/background.jpg` | Full-page blackboard texture (sits under a vignette) |
| `public/images/hero.png`       | Portrait in the hero section                          |

Until `hero.png` exists, a chalk-sketch placeholder is shown. If `background.jpg` is missing you get a generated dusty blackboard. To use different names or formats, edit `images` in `src/data.js`.

The hero image is blended with `mix-blend-mode: screen`, so a black background in the PNG disappears into the board.

## Edit your content

All text lives in `src/data.js`: profile, socials, projects, skills and experience.

- Leave a social `url` empty to hide that icon (X is empty right now).
- Each project card links to your GitHub profile — replace `url` with the live link.
- Your CV is `public/Henok-Emyaye-CV.pdf`; replace it to update the download.

## How the chalk effect works

- `src/lib/rough.js` generates wobbly, seeded box outlines that overshoot at the corners.
- `src/components/Chalk.jsx` holds the SVG grain/displacement filters, chalk boxes, dividers and the self-drawing underlines.
- `src/components/Icon.jsx` has the hand-drawn line icons.
- Animations respect `prefers-reduced-motion`.
