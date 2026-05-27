# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Static multi-page website for **Future Enlightenment**, a North London charity. No build step, no framework — plain HTML, CSS, and vanilla JS served directly from the repo root. The remote is `new-origin` (not `origin`): always push with `git push new-origin main`.

## Development

Open any HTML file directly in a browser. There is no dev server, bundler, or build command. `package.json` only has `jsdom` as a dev dependency (used for any scripted testing).

To preview changes: open `index.html` (or any page) directly in a browser, or use a simple static server:

```
npx serve .
```

## Architecture

### Page structure
Each of the five pages (`index.html`, `events.html`, `about.html`, `contact.html`, `donate.html`) is self-contained. They share:
- A copy-pasted `<header>` with the nav, language switcher, and dark mode toggle
- A copy-pasted `<footer>`
- The same two script tags: `js/translations.js` and `js/main.js`
- The same stylesheet: `css/style.css`

There is no templating or component system — changes to the nav or footer must be made in all five files.

### Internationalisation
`js/translations.js` exports a single global `TRANSLATIONS` object keyed by language code (`en`, `fr`, `ro`, `pl`, `el`, `ln`). Every string that needs translating gets a `data-i18n="key"` attribute in HTML. `main.js` walks all `[data-i18n]` elements on init and on language switch, replacing `textContent` with the looked-up string. Placeholders use `data-i18n-placeholder`, raw HTML uses `data-i18n-html`.

When adding new translatable text:
1. Add the element with `data-i18n="your_key"` in **all pages that show it**.
2. Add `your_key` to **every language block** in `translations.js` (there are 6).

### Dark mode & theming
`[data-theme="dark"]` is set on `<html>`. All colours go through CSS custom properties defined in `:root` and overridden in `[data-theme="dark"]`. Never use hardcoded colour values — always use a token. Key tokens:
- `--ink` / `--ink-soft` — text (flips in dark mode)
- `--bg` / `--paper` — backgrounds (flip in dark mode)
- `--on-warm` — text on butter/mint surfaces (always navy — does **not** flip)
- `--on-accent` — text on red/navy surfaces (always white — does **not** flip)
- `--red-deep` (`#C42836`) — use for primary buttons (passes WCAG AA white-on-red at 5.7:1); `--red` (`#E63946`) is for decorative accents only

User preference is persisted to `localStorage` as `fe_dark` (`'1'` / `'0'`).

### JavaScript
`main.js` is a single IIFE. On `DOMContentLoaded` it calls `init()`, which wires up: dark mode, language switching (including auto-detect banner), mobile nav, contact mode toggle (form vs info panel), topic pills, and the contact form mailto handler. Language preference is persisted to `localStorage` as `fe_lang`.

### CSS conventions
- Single stylesheet `css/style.css`. Sections are delimited with `/* ==== SECTION ==== */` comments.
- Utility shadows use the `--sh` / `--sh-sm` / `--sh-lg` tokens (hard offset, brutalist style).
- The skip link (`.skip-link`) is `position: fixed; top: -100px` and slides to `top: 12px` on `:focus` — do not change this to `absolute` or the animation breaks when the page is scrolled.
- Focus rings use `:focus-visible` with `outline: 3px solid var(--butter); outline-offset: 3px` — applied to a broad selector list near the top of the button section.

### Version-busting
Script and CSS tags use `?v=N` query strings for cache-busting (e.g. `style.css?v=4`, `translations.js?v=2`). Bump the version when making changes that should be picked up by returning users.
