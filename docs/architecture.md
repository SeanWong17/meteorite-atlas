# Architecture

**English** | [简体中文](architecture.zh-CN.md)

[Live atlas](https://seanwong17.github.io/meteorite-atlas/) · [Documentation index](README.md)

Meteorite Atlas is a backend-free Vite and React static site. JSON content is imported at build time, while the Three.js globe is loaded on demand. It can be deployed to GitHub Pages or any static host.

## Data Flow

1. `data/meteorites.json` stores official records, spatial evidence, Chinese summaries, and sources.
2. `data/meteorites.en.json` provides a complete English content record for every curated ID.
3. `data/wikimedia-images.json` stores image licenses, review status, and local cache paths.
4. `src/App.jsx` owns search, filters, sorting, URL state, language, details, guides, and comparison.
5. `src/GlobeScene.jsx` converts coordinates and coverage geometry into Three.js objects.
6. `scripts/validate-data.mjs` applies JSON Schema and cross-file record, translation, image, and geometry checks.

## Frontend Boundary

`App.jsx` owns user-visible state. `GlobeScene.jsx` receives records, visible IDs, selected ID, layer state, locale, and narrowly scoped callbacks. The globe exposes only `focusOn` and `resetView`; it does not read filters or URL state.

Three.js is loaded with `React.lazy`. The scene renders on demand while stationary. OrbitControls changes, resize, filtering, selection, and focus transitions request frames. Auto-rotation is optional and hidden tabs pause rendering.

The globe's control target always remains at the origin. Selection moves the camera around that fixed center, and manual control input disables auto-rotation. This preserves map orientation without allowing free roll to disorient beginners.

## Internationalization

The Chinese primary dataset and English translation layer share stable meteorite IDs. `src/i18n.js` localizes record fields and interface copy; `src/content.js` localizes learning paths, glossary, filters, evidence labels, and observation prompts. English URLs include `lang=en`, and the active locale updates `<html lang>`, metadata, and local preference.

## Spatial Rendering

| Type | Rendering |
| --- | --- |
| `point` | Representative point only |
| `line` | Dashed strewn-field axis |
| `circle` | Converted reference circle |
| `ellipse` | Published summary ellipse |
| `multi-point` | Several find points |
| `polygon` | Closed boundary when three or more verified points exist |

`pending-digitization` can retain a coverage type without geometry. The page explains the missing boundary instead of inventing one.

## Static Assets

All public assets resolve through `import.meta.env.BASE_URL`. CI sets `BASE_PATH`, so the same build works at a domain root or repository subpath. Only images with `reviewStatus: approved` and an existing local file pass validation and reach the interface.
