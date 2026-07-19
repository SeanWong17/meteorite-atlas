# Data Contribution Guide

**English** | [简体中文](data-contribution.zh-CN.md)

[Live atlas](https://seanwong17.github.io/meteorite-atlas/) · [Documentation index](README.md)

## Add a Record

1. Confirm the official English name, classification, event type, and reference coordinates in the MBDB.
2. Find papers or institutional sources for claims about mass, history, distribution, or collection location.
3. Add the Chinese primary record to `data/meteorites.json`; coordinates must use `[longitude, latitude]`.
4. Add every required English field under the same ID in `data/meteorites.en.json`.
5. Select a coverage type and evidence level using the [spatial model](spatial-model.md).
6. Run `npm run validate:data`.

Never invent a boundary to make the map look complete. If a strewn field is known but reproducible geometry is not available, retain a representative point or use `pending-digitization` with an explicit explanation. Sericho is an example: the MBDB reports an extent over 45 km but not enough geometry to draw a reliable line or polygon.

## Image Curation

1. Add official English names and necessary aliases to `image.searchTerms`.
2. Run `npm run fetch:images`; new results are always `needs-review`.
3. Open the Commons file page and confirm the subject is the exact meteorite, not a person, place, monument, or unrelated document with the same name.
4. Verify author, license, original file page, and image description.
5. Mark a correct candidate `approved` and add `reviewedAt` and `reviewedBy`.
6. Run `npm run cache:images` to create the local file and bilingual attribution documents.
7. Run `npm run validate:data` again.

Use the verified-image placeholder whenever identity remains uncertain.

## Spatial Field Checks

- `circle` requires `radiusKm`.
- `ellipse` requires major and minor axes.
- `line` requires at least two reproducible points.
- A `verified-boundary` polygon requires at least three points.
- Editorial conversions use `editorial-approximation` and must be explicitly labeled in both languages.
