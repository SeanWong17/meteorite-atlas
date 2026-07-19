import { writeFileSync } from "node:fs";

export const compactThumbnailUrl = (url) => url;

const licenseCell = (image, fallback) =>
  image.licenseUrl ? `[${image.license}](${image.licenseUrl})` : `${image.license} (${fallback})`;

export const writeImageCredits = ({ images, failures = [] }, creditsUrl) => {
  const englishRows = images
    .map((image) =>
      `| ${image.id} | [${image.title}](${image.filePageUrl}) | ${image.author.replace(/\|/g, "\\|")} | ${licenseCell(image, "no separate link")} | ${image.reviewStatus === "approved" ? "Approved" : "Needs review"} |`)
    .join("\n");
  const chineseRows = images
    .map((image) =>
      `| ${image.id} | [${image.title}](${image.filePageUrl}) | ${image.author.replace(/\|/g, "\\|")} | ${licenseCell(image, "无单独链接")} | ${image.reviewStatus === "approved" ? "已核验" : "待核验"} |`)
    .join("\n");
  const englishFailures = failures.length
    ? `\n## Missing Candidates\n\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`
    : "";
  const chineseFailures = failures.length
    ? `\n## 未收录候选\n\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`
    : "";

  writeFileSync(
    creditsUrl,
    `# Meteorite Image Sources\n\n**English** | [简体中文](image-sources.zh-CN.md)\n\n[Live atlas](https://seanwong17.github.io/meteorite-atlas/) · [Documentation index](README.md)\n\nThe interface only publishes images with a clear license and a manually verified subject. Automated search results remain review candidates and never appear directly. Production pages use locally cached copies while preserving the original file page, author, and license.\n\n| Data ID | Commons file | Author | License | Review |\n| --- | --- | --- | --- | --- |\n${englishRows}\n${englishFailures}`,
  );
  writeFileSync(
    new URL("image-sources.zh-CN.md", creditsUrl),
    `# 陨石图片来源\n\n[English](image-sources.md) | **简体中文**\n\n[在线访问](https://seanwong17.github.io/meteorite-atlas/) · [说明文档](README.zh-CN.md)\n\n网页只展示许可明确且经过人工主题核验的图片。自动检索结果会保留为待核验候选，不会直接发布；正式页面使用仓库内缓存文件，同时保留原始文件页、作者与许可证。\n\n| 数据 ID | Commons 文件 | 作者 | 许可证 | 审核 |\n| --- | --- | --- | --- | --- |\n${chineseRows}\n${chineseFailures}`,
  );
};
