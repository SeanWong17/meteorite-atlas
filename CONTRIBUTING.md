# Contributing

**English** | [简体中文](CONTRIBUTING.zh-CN.md)

[Live atlas](https://seanwong17.github.io/meteorite-atlas/) · [Documentation](docs/README.md)

Thank you for improving Meteorite Atlas. The project serves beginner enthusiasts, so accuracy, explanation, and reproducibility matter more than record count.

## Before You Start

1. Search existing issues to confirm the work is not already underway.
2. Read the [data contribution guide](docs/data-contribution.md) for records and the [content guide](docs/content-guide.md) for educational writing.
3. Open an issue before a large UI or data-model change and describe the user problem, proposal, and supporting sources.

## Development

```bash
npm ci
npm run dev
```

Run the full suite before submitting:

```bash
npm run check
```

Keep each pull request focused. Do not combine unrelated refactoring, bulk data expansion, and visual redesign.

## Data Requirements

- Use the MBDB first for official names, classification, events, and reference coordinates.
- Cite the corresponding source for cultural history, mass, distribution, or collection claims.
- Add a complete English counterpart in `data/meteorites.en.json` for every primary record.
- Do not identify meteorites from news illustrations or sales pages.
- Images require author, license, original file page, and a manual subject review.
- Uncertain material can remain in research notes but must not be presented as settled fact.

## Pull Requests

Explain what changed, why it changed, how it was verified, and the sources for data or images. Include desktop and mobile screenshots for visible changes. By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
