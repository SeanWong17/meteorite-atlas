import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { compactThumbnailUrl, writeImageCredits } from "./image-manifest.mjs";

const root = new URL("../", import.meta.url);
const dataUrl = new URL("data/wikimedia-images.json", root);
const meteoritesUrl = new URL("data/meteorites.json", root);
const creditsUrl = new URL("docs/image-sources.md", root);
const outputDirectory = new URL("public/assets/meteorites/", root);
const manifest = JSON.parse(readFileSync(dataUrl, "utf8"));
const { meteorites } = JSON.parse(readFileSync(meteoritesUrl, "utf8"));

mkdirSync(outputDirectory, { recursive: true });

const fetchWithRetry = async (url, attempt = 1) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "MeteoriteAtlas/0.2 (educational data curation; contact maintainers through the source repository)",
    },
  });
  if (response.status === 429 && attempt < 4) {
    await delay(attempt * 5000);
    return fetchWithRetry(url, attempt + 1);
  }
  return response;
};

for (const image of manifest.images) {
  if (image.reviewStatus !== "approved") continue;

  const extension = extname(new URL(image.originalUrl).pathname).toLowerCase();
  const safeExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
    ? extension
    : ".jpg";
  const fileName = `${image.id}${safeExtension}`;
  const localUrl = new URL(fileName, outputDirectory);
  image.localPath = `assets/meteorites/${fileName}`;
  if (existsSync(localUrl)) continue;

  const response = await fetchWithRetry(compactThumbnailUrl(image.thumbnailUrl));

  if (!response.ok) {
    throw new Error(`${image.id}: ${response.status} ${response.statusText}`);
  }

  writeFileSync(localUrl, Buffer.from(await response.arrayBuffer()));
  await delay(1600);
}

manifest.generatedAt = new Date().toISOString();
writeFileSync(dataUrl, `${JSON.stringify(manifest, null, 2)}\n`);
const publishedIds = new Set(
  manifest.images
    .filter((image) => image.reviewStatus === "approved")
    .map((image) => image.id),
);
const failures = meteorites
  .filter((meteorite) => !publishedIds.has(meteorite.id))
  .map((meteorite) => `${meteorite.name.en}: no approved image`);
writeImageCredits({ images: manifest.images, failures }, creditsUrl);
console.log(`Cached ${manifest.images.filter((image) => image.reviewStatus === "approved").length} approved images.`);
