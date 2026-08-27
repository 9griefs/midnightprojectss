# for shreya — apology site

A one-page, scroll-driven site: click a ribbon → HALOOO → a chaotic ranking of
memes → a two-part handwritten-style apology → a soft outro. Music
crossfades automatically as you move through it. No build tools, no
frameworks — just HTML, CSS and vanilla JS.

## Run it locally

You just need a static file server (browsers block audio/fetch on `file://`
in some cases, so don't just double-click `index.html`).

**Option A — Python (already on most machines):**
```bash
cd shreya-site
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

**Option B — Node:**
```bash
cd shreya-site
npx serve .
```

**Option C — VS Code:** install the "Live Server" extension, right-click
`index.html` → "Open with Live Server".

## Deploying

This is a fully static site — drag the `shreya-site` folder into
[Netlify Drop](https://app.netlify.com/drop), or push it to a GitHub repo and
turn on GitHub Pages, or upload it to any static host (Vercel, Cloudflare
Pages, S3, etc). No configuration needed.

## Project structure

```
shreya-site/
├── index.html          all sections/markup
├── style.css            all styling, design tokens at the top
├── script.js             audio manager + interactions
├── assets/
│   ├── img/              the images you supplied, optimized as .jpg
│   │   ├── halooo.jpg
│   │   ├── rank-intro.jpg
│   │   ├── rank-list.jpg
│   │   ├── rank-memes.jpg
│   │   ├── apology-1.jpg
│   │   └── apology-2.jpg
│   └── audio/             the four tracks, renamed to match play order
│       ├── 01-iktara.mp3
│       ├── 02-kyon-na-hum-tum.mp3
│       ├── 03-gucci.mp3
│       └── 04-yaariyan.mp3
└── README.md
```

## How the flow works

1. **Intro** — page loads locked (no scrolling). Clicking the ribbon
   starts `01-iktara.mp3`, fires a quick white flash, then unlocks
   scrolling and glides down to the HALOOO screen.
2. **HALOOO** — clicking "click here!!" crossfades to
   `02-kyon-na-hum-tum.mp3` and scrolls to the ranking section.
3. **Ranking** — a 3-slide carousel through your meme images (dots or the
   "next" button to advance). `03-gucci.mp3` plays for this whole section.
   The last slide's button becomes "keep going" and scrolls into the
   letter.
4. **Letter (apology)** — as soon as this section is ~35% in view, the
   music crossfades to `04-yaariyan.mp3` and paragraphs fade/slide in one
   at a time as you scroll.
5. **Outro** — a short closing line and a "start over" button that resets
   the whole experience back to the locked intro state.

## Editing things

- **Swap an image or song**: just replace the file in `assets/` and keep
  the same filename (or update the `src` in `index.html`).
- **Change the apology text**: edit the `.letter__body` paragraphs in
  `index.html` directly — it's plain text, no build step.
- **Colors/fonts**: everything lives in the `:root { --token: value; }`
  block at the top of `style.css`.
- **Mute default volume**: change `TARGET_VOL` near the top of
  `script.js` (0–1).

## Notes

- Audio only ever starts after the ribbon click (browsers block
  autoplay before a user gesture — this is by design, not a bug).
- Only one track plays at a time; every switch is a proper crossfade,
  never a hard cut or overlap.
- Tested layout down to ~360px wide phones and up through desktop.
