import { readFileSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { writeImageCredits } from "./image-manifest.mjs";

const root = new URL("../", import.meta.url);
const dataUrl = new URL("data/meteorites.json", root);
const outputUrl = new URL("data/wikimedia-images.json", root);
const creditsUrl = new URL("docs/image-sources.md", root);
const { meteorites } = JSON.parse(readFileSync(dataUrl, "utf8"));
const requestDelayMs = Number(process.env.WIKIMEDIA_DELAY_MS ?? 1500);

let existingImages = [];
try {
  existingImages = JSON.parse(readFileSync(outputUrl, "utf8")).images ?? [];
} catch {
  existingImages = [];
}
const existingById = new Map(existingImages.map((image) => [image.id, image]));

const apiUrl = new URL("https://commons.wikimedia.org/w/api.php");
apiUrl.searchParams.set("action", "query");
apiUrl.searchParams.set("format", "json");
apiUrl.searchParams.set("generator", "search");
apiUrl.searchParams.set("gsrnamespace", "6");
apiUrl.searchParams.set("gsrlimit", "10");
apiUrl.searchParams.set("prop", "imageinfo");
apiUrl.searchParams.set("iiprop", "url|extmetadata");
apiUrl.searchParams.set("iiurlwidth", "1200");

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const metadataValue = (metadata, key) => stripHtml(metadata?.[key]?.value ?? "");

const searchImage = async (meteorite, query) => {
  const requestUrl = new URL(apiUrl);
  requestUrl.searchParams.set("gsrsearch", query);

  const response = await fetch(requestUrl, {
    headers: {
      "User-Agent": "MeteoriteAtlas/0.1 (educational open source project)",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const nameTokens = [meteorite.name.en, ...(meteorite.aliases ?? [])]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
  const candidates = Object.values(payload.query?.pages ?? {})
    .map((page) => ({ page, info: page.imageinfo?.[0] }))
    .filter(({ page, info }) => {
      if (!info?.thumburl || !metadataValue(info.extmetadata, "LicenseShortName")) return false;
      const context = [
        page.title,
        metadataValue(info.extmetadata, "ImageDescription"),
        metadataValue(info.extmetadata, "Categories"),
      ].join(" ").toLowerCase();
      const hasNameMatch = nameTokens.some((token) => context.includes(token));
      const hasMeteoriteContext = /meteorite|pallasite|iron meteorite/u.test(context);
      return hasNameMatch && hasMeteoriteContext;
    });

  candidates.sort((left, right) => {
    const score = ({ page }) => {
      const title = page.title.toLowerCase();
      return nameTokens.filter((token) => title.includes(token)).length +
        (title.includes("meteorite") || title.includes("pallasite") ? 3 : 0);
    };
    return score(right) - score(left);
  });

  const winner = candidates[0];
  if (!winner) {
    return null;
  }

  const metadata = winner.info.extmetadata;
  return {
    id: meteorite.id,
    title: winner.page.title.replace(/^File:/, ""),
    thumbnailUrl: winner.info.thumburl,
    originalUrl: winner.info.url,
    filePageUrl: winner.info.descriptionurl,
    author: metadataValue(metadata, "Artist") || "See Commons file page",
    license: metadataValue(metadata, "LicenseShortName"),
    licenseUrl: metadataValue(metadata, "LicenseUrl"),
    credit: metadataValue(metadata, "Credit"),
    retrievedAt: new Date().toISOString().slice(0, 10),
    reviewStatus: "needs-review",
  };
};

const images = [];
const failures = [];

for (const meteorite of meteorites) {
  const existingImage = existingById.get(meteorite.id);
  if (existingImage?.reviewStatus === "approved") {
    images.push(existingImage);
    continue;
  }

  try {
    const queries = [
      ...(meteorite.image?.searchTerms ?? []),
      `${meteorite.name.en} meteorite`,
      ...(meteorite.aliases ?? []),
    ].filter((query, index, all) => query && all.indexOf(query) === index);
    let image = null;

    for (let index = 0; index < queries.length; index += 1) {
      image = await searchImage(meteorite, queries[index]);
      if (image) break;
      if (index < queries.length - 1) await delay(requestDelayMs);
    }

    if (image) {
      images.push(image);
    } else {
      failures.push(`${meteorite.name.en}: no licensed Commons result`);
    }
  } catch (error) {
    failures.push(`${meteorite.name.en}: ${error.message}`);
  }

  await delay(requestDelayMs);
}

writeFileSync(
  outputUrl,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), images }, null, 2)}\n`,
);

writeImageCredits({ images, failures }, creditsUrl);

console.log(`Wikimedia images: ${images.length}/${meteorites.length}`);
if (failures.length) {
  console.log(failures.join("\n"));
}
