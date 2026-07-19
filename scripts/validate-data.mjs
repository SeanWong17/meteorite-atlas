import { existsSync, readFileSync } from "node:fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = new URL("../", import.meta.url);
const data = JSON.parse(readFileSync(new URL("data/meteorites.json", root), "utf8"));
const schema = JSON.parse(readFileSync(new URL("data/meteorites.schema.json", root), "utf8"));
const imageManifest = JSON.parse(readFileSync(new URL("data/wikimedia-images.json", root), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const errors = [];

if (!ajv.validate(schema, data)) {
  for (const error of ajv.errors ?? []) {
    errors.push(`${error.instancePath || "/"} ${error.message}`);
  }
}

const ids = new Set();
for (const meteorite of data.meteorites) {
  const prefix = `[${meteorite.id ?? "unknown"}]`;
  if (ids.has(meteorite.id)) errors.push(`${prefix} id must be unique`);
  ids.add(meteorite.id);

  const coverage = meteorite.map.coverage;
  if (coverage.kind === "circle" && !coverage.dimensions?.radiusKm) {
    errors.push(`${prefix} circle coverage requires dimensions.radiusKm`);
  }
  if (
    coverage.kind === "ellipse" &&
    (!coverage.dimensions?.majorAxisKm || !coverage.dimensions?.minorAxisKm)
  ) {
    errors.push(`${prefix} ellipse coverage requires majorAxisKm and minorAxisKm`);
  }
  if (coverage.kind === "line" && (coverage.points?.length ?? 0) < 2) {
    errors.push(`${prefix} line coverage requires at least two points`);
  }
  if (
    coverage.kind === "polygon" &&
    coverage.confidence === "verified-boundary" &&
    (coverage.points?.length ?? 0) < 3
  ) {
    errors.push(`${prefix} a verified polygon requires at least three points`);
  }
}

const imageIds = new Set();
for (const image of imageManifest.images) {
  const prefix = `[image:${image.id ?? "unknown"}]`;
  if (!ids.has(image.id)) errors.push(`${prefix} has no matching meteorite record`);
  if (imageIds.has(image.id)) errors.push(`${prefix} image id must be unique`);
  imageIds.add(image.id);
  if (!image.author || !image.license || !image.filePageUrl?.startsWith("https://")) {
    errors.push(`${prefix} author, license and HTTPS source page are required`);
  }
  if (!new Set(["approved", "needs-review"]).has(image.reviewStatus)) {
    errors.push(`${prefix} reviewStatus must be approved or needs-review`);
  }
  if (image.reviewStatus === "approved") {
    if (!image.reviewedAt || !image.reviewedBy || !image.localPath) {
      errors.push(`${prefix} approved images require reviewer metadata and localPath`);
    } else if (!existsSync(new URL(`public/${image.localPath}`, root))) {
      errors.push(`${prefix} local file is missing: public/${image.localPath}`);
    }
  }
}

for (const meteorite of data.meteorites) {
  const hasApprovedImage = imageManifest.images.some(
    (image) => image.id === meteorite.id && image.reviewStatus === "approved",
  );
  const expectedStatus = hasApprovedImage ? "curated" : "not-yet-curated";
  if (meteorite.image.status !== expectedStatus) {
    errors.push(`[${meteorite.id}] image.status must be ${expectedStatus}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const countBy = (records, getKey) =>
  records.reduce((totals, record) => {
    const key = getKey(record);
    totals[key] = (totals[key] ?? 0) + 1;
    return totals;
  }, {});

console.log(JSON.stringify({
  records: data.meteorites.length,
  categories: countBy(data.meteorites, ({ category }) => category),
  events: countBy(data.meteorites, ({ event }) => event.kind),
  coverage: countBy(data.meteorites, ({ map }) => map.coverage.kind),
  approvedImages: imageManifest.images.filter((image) => image.reviewStatus === "approved").length,
}, null, 2));
