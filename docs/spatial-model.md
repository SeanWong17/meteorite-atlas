# Spatial Evidence Model

**English** | [简体中文](spatial-model.zh-CN.md)

[Live atlas](https://seanwong17.github.io/meteorite-atlas/) · [Documentation index](README.md)

Not every meteorite belongs on the map as the same kind of pin. Database coordinates can represent a find, fall, strewn-field reference, or administrative locality rather than an exact atmospheric endpoint.

## Supported Shapes

| `coverage.kind` | Appropriate evidence | Map expression |
| --- | --- | --- |
| `point` | One reliable locality or one mass preserved in place | Marker |
| `circle` | Published center and radius | Translucent circle |
| `ellipse` | Published major/minor axes and direction | Oriented translucent ellipse |
| `polygon` | Published or reproducible strewn-field boundary | Translucent polygon |
| `line` | Reproducible strewn axis without reliable width | Dashed axis |
| `multi-point` | Several published find points without a boundary | Multiple markers |

## Evidence Levels

- `official-coordinate`: coordinate directly supplied by the MBDB or an equivalent source.
- `reported-extent`: a source gives length, area, or extent but not enough detail to reconstruct the boundary.
- `verified-boundary`: a published or reproducible boundary that can be rendered directly.
- `editorial-approximation`: a necessary conversion, clearly labeled and never presented as measurement.
- `pending-digitization`: a distribution is known but reliable geometry is not yet available.

## Design Constraints

1. Never replace an unknown distribution with an arbitrary circle.
2. A reported length without endpoints, direction, or width remains textual evidence; it does not justify a line or ellipse.
3. Record details must distinguish a find area, fall strewn field, impact-crater relation, and museum location.
4. The globe shows representative points by default; users opt into extent layers to avoid first-view overload.
5. The camera orbits a fixed globe center. Geographic direction remains stable and free roll is disabled.

## Dimensions

`majorAxisKm`, `minorAxisKm`, `radiusKm`, and `areaKm2` are included only when directly reported or reproducibly converted. `dimensionStatus` distinguishes `reported`, `estimated`, and `unknown`; `boundaryConfidence` prevents a summary length from being mistaken for a mapped boundary.
