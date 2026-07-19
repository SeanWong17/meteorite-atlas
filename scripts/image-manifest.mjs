import { writeFileSync } from "node:fs";

export const compactThumbnailUrl = (url) => url;

export const writeImageCredits = ({ images, failures = [] }, creditsUrl) => {
  const creditRows = images
    .map((image) => {
      const licenseLink = image.licenseUrl
        ? `[license](${image.licenseUrl})`
        : "No separate link";
      const review = image.reviewStatus === "approved" ? "已核验" : "待核验";
      return `| ${image.id} | [${image.title}](${image.filePageUrl}) | ${image.author.replace(/\|/g, "\\|")} | ${image.license} | ${review} | ${licenseLink} |`;
    })
    .join("\n");
  const failuresSection = failures.length
    ? `\n## 未收录候选\n\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`
    : "";

  writeFileSync(
    creditsUrl,
    `# 图片来源\n\n网页只展示经过人工主题核验且许可明确的图片。自动检索结果会保留为待核验候选，不会直接发布；正式页面使用仓库内缓存缩略图，原始文件页、作者与许可证仍逐项保留。\n\n| 数据 ID | Commons 文件 | 作者 | 许可证 | 审核 | 许可证页 |\n| --- | --- | --- | --- | --- | --- |\n${creditRows}\n${failuresSection}`,
  );
};
