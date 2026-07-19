import { englishTranslationFor } from "./i18n";

const localizedContent = {
  zh: {
    categoryOptions: [
      { id: "all", label: "全部" },
      { id: "iron", label: "铁陨石" },
      { id: "pallasite", label: "橄榄陨铁" },
    ],
    eventOptions: [
      { id: "all", label: "全部记录" },
      { id: "observed_fall", label: "目击坠落" },
      { id: "find", label: "后来发现" },
    ],
    sortOptions: [
      { id: "curated", label: "策展顺序" },
      { id: "year-desc", label: "记录时间：新到旧" },
      { id: "year-asc", label: "记录时间：旧到新" },
      { id: "name", label: "名称" },
    ],
    learningPaths: [
      {
        id: "materials",
        kicker: "从外观开始",
        title: "铁陨石与橄榄陨铁",
        body: "比较整块铁镍合金与金属中包裹橄榄石晶体的两种结构。",
        meteoriteIds: ["hoba", "fukang"],
      },
      {
        id: "fall-or-find",
        kicker: "从记录方式开始",
        title: "坠落与发现不是一回事",
        body: "一颗有火球和爆炸记录，另一颗是在地下被找到。分类价值不由故事是否壮观决定。",
        meteoriteIds: ["sikhote-alin", "esquel"],
      },
      {
        id: "map-evidence",
        kicker: "从地图开始",
        title: "边界为什么有虚线",
        body: "代表点、散布主轴和低可信范围表达的是不同证据，不能都当作精确落点。",
        meteoriteIds: ["aletai", "gibeon"],
      },
    ],
    glossary: [
      { term: "流星体", definition: "仍在太空中运行、尚未进入大气层的天然固体。" },
      { term: "陨石", definition: "穿过大气层后到达地面的天然物质。空中的发光现象叫流星。" },
      { term: "铁陨石", definition: "主要由铁镍合金组成的陨石，不等于所有含铁的陨石。" },
      { term: "橄榄陨铁", definition: "石铁陨石的一类，典型结构是橄榄石晶体分布在铁镍金属中。" },
      { term: "目击坠落", definition: "有人观察到火球、爆炸或落物，并能把回收样品与事件联系起来。" },
      { term: "发现陨石", definition: "没有可靠当次坠落记录，后来才在地表或地下被找到。" },
      { term: "散布区", definition: "同一次破碎或撞击留下多个质量的区域，不一定有精确边界。" },
      { term: "维德曼花纹", definition: "部分铁陨石经切割、抛光和酸蚀后显现的铁镍晶体交生结构。" },
    ],
  },
  en: {
    categoryOptions: [
      { id: "all", label: "All" },
      { id: "iron", label: "Iron" },
      { id: "pallasite", label: "Pallasite" },
    ],
    eventOptions: [
      { id: "all", label: "All records" },
      { id: "observed_fall", label: "Observed fall" },
      { id: "find", label: "Later find" },
    ],
    sortOptions: [
      { id: "curated", label: "Curated order" },
      { id: "year-desc", label: "Date: newest first" },
      { id: "year-asc", label: "Date: oldest first" },
      { id: "name", label: "Name" },
    ],
    learningPaths: [
      {
        id: "materials",
        kicker: "START WITH APPEARANCE",
        title: "Iron meteorites and pallasites",
        body: "Compare a mass of iron-nickel alloy with a structure where olivine crystals sit inside metal.",
        meteoriteIds: ["hoba", "fukang"],
      },
      {
        id: "fall-or-find",
        kicker: "START WITH THE RECORD",
        title: "A fall and a find are not the same",
        body: "One has a recorded fireball and explosions; the other was recovered underground. Scientific value does not depend on dramatic circumstances.",
        meteoriteIds: ["sikhote-alin", "esquel"],
      },
      {
        id: "map-evidence",
        kicker: "START WITH THE MAP",
        title: "Why some boundaries are dashed",
        body: "A reference point, a strewn axis, and a low-confidence extent represent different evidence and cannot all be treated as exact fall sites.",
        meteoriteIds: ["aletai", "gibeon"],
      },
    ],
    glossary: [
      { term: "Meteoroid", definition: "A natural solid object still moving through space before it enters an atmosphere." },
      { term: "Meteorite", definition: "Natural material that survives atmospheric passage and reaches the ground. The luminous event in the air is a meteor." },
      { term: "Iron meteorite", definition: "A meteorite composed mainly of iron-nickel alloy, not every meteorite that happens to contain iron." },
      { term: "Pallasite", definition: "A type of stony-iron meteorite, typically with olivine crystals distributed through iron-nickel metal." },
      { term: "Observed fall", definition: "A fireball, detonation, or falling object was observed and recovered material can be linked to that event." },
      { term: "Find", definition: "A meteorite recovered from the surface or underground without a reliable record of its fall." },
      { term: "Strewn field", definition: "An area containing masses from one breakup or impact; it does not necessarily have a precise boundary." },
      { term: "Widmanstatten pattern", definition: "Intergrown iron-nickel crystal structures revealed in some iron meteorites after cutting, polishing, and etching." },
    ],
  },
};

export const VALID_CATEGORY_IDS = new Set(["all", "iron", "pallasite"]);
export const VALID_EVENT_IDS = new Set(["all", "observed_fall", "find"]);
export const contentFor = (locale) => localizedContent[locale] ?? localizedContent.zh;

const classificationTranslations = new Map([
  ["IIIE-an, coarse octahedrite", "IIIE-an 群粗纹八面体铁陨石"],
  ["IVB iron meteorite", "IVB 群铁陨石"],
  ["IVA, fine octahedrite", "IVA 群细纹八面体铁陨石"],
  ["IAB-MG iron meteorite", "IAB 主群铁陨石"],
  ["IIAB iron meteorite", "IIAB 群铁陨石"],
  ["IIIAB iron meteorite", "IIIAB 群铁陨石"],
  ["ungrouped iron meteorite", "未分组铁陨石"],
  ["iron meteorite", "铁陨石，尚未细分群"],
  ["IAB iron meteorite, Mundrabilla grouplet", "IAB 铁陨石，Mundrabilla 小群"],
  ["main-group pallasite (PMG)", "主群橄榄陨铁"],
  ["main-group pallasite", "主群橄榄陨铁"],
  ["anomalous pallasite", "异常橄榄陨铁"],
  ["pallasite", "橄榄陨铁，尚未细分群"],
  ["anomalous main-group pallasite", "异常主群橄榄陨铁"],
  ["ungrouped pallasite", "未分组橄榄陨铁"],
]);

export const classificationLabel = (classification, locale) =>
  locale === "en" ? classification : classificationTranslations.get(classification) ?? classification;

export const coverageLabel = (coverage, locale) => {
  const labels = locale === "en"
    ? {
        point: "Representative point",
        circle: "Converted reference extent",
        ellipse: "Published summary extent",
        polygon: "Area awaiting digitization",
        line: "Strewn-field axis",
        "multi-point": "Multiple find points",
      }
    : {
        point: "代表点",
        circle: "换算示意范围",
        ellipse: "文献概括范围",
        polygon: "区域待数字化",
        line: "散布主轴",
        "multi-point": "多个发现点",
      };
  return labels[coverage?.kind] ?? labels.point;
};

export const evidenceLabel = (confidence, locale) => {
  const labels = locale === "en"
    ? {
        "official-coordinate": "Official-source coordinate",
        "reported-extent": "Published extent",
        "verified-boundary": "Verified boundary",
        "editorial-approximation": "Editorial approximation",
        "pending-digitization": "Awaiting digitization",
      }
    : {
        "official-coordinate": "正式资料坐标",
        "reported-extent": "文献报告范围",
        "verified-boundary": "已核验边界",
        "editorial-approximation": "编辑换算示意",
        "pending-digitization": "等待数字化",
      };
  return labels[confidence] ?? (locale === "en" ? "Evidence not described" : "证据待说明");
};

const observationNotes = {
  zh: {
    hoba: "观察未经切割的大型铁质表面。它不像常见橄榄陨铁切片那样出现透明晶体。",
    "sikhote-alin": "留意碎片表面的气印与撕裂形态，它们记录了高速穿过大气层和爆裂的过程。",
    fukang: "逆光观察黄绿色橄榄石晶体，再看晶体之间连续的银灰色铁镍基质。",
    sericho: "比较不同切片中橄榄石的比例与颜色。厚度、光线和风化会显著改变晶体的透明感。",
    pallasovka: "比较晶体大小、颜色与金属比例；同为橄榄陨铁，内部结构也不会完全一致。",
  },
  en: {
    hoba: "Look at the large, uncut iron surface. Unlike a typical pallasite slice, it does not show translucent crystals.",
    "sikhote-alin": "Notice the regmaglypts and torn forms on the fragments, evidence of high-speed atmospheric passage and breakup.",
    fukang: "View the yellow-green olivine against light, then follow the continuous silver-gray iron-nickel matrix between crystals.",
    sericho: "Compare the proportion and color of olivine across different slices. Thickness, lighting, and weathering strongly affect apparent transparency.",
    pallasovka: "Compare crystal size, color, and metal proportion; even pallasites do not all share the same internal texture.",
  },
};

export const observationNote = (meteorite, locale) =>
  observationNotes[locale]?.[meteorite.id] ??
  (meteorite.category === "iron"
    ? locale === "en"
      ? "Distinguish natural surfaces from prepared cuts. Patterns require careful polishing and etching and cannot authenticate a specimen by color alone."
      : "区分天然表面与人工切面。切面花纹需要规范抛光和酸蚀才会显现，不能只凭颜色鉴定。"
    : locale === "en"
      ? "Observe how olivine and iron-nickel metal enclose one another. Transparency and color vary with slice thickness, weathering, and lighting."
      : "观察橄榄石与铁镍金属如何相互包裹。透明度和颜色会受切片厚度、风化与拍摄光线影响。");

export const queryText = (meteorite) => {
  const english = englishTranslationFor(meteorite) ?? {};
  return [
    meteorite.name.zh,
    meteorite.name.en,
    ...(meteorite.aliases ?? []),
    meteorite.categoryZh,
    meteorite.classification,
    classificationTranslations.get(meteorite.classification),
    meteorite.event.labelZh,
    meteorite.location.countryZh,
    meteorite.location.regionZh,
    meteorite.location.coordinateRole,
    meteorite.summaryZh,
    meteorite.map.coverage.descriptionZh,
    english.eventLabel,
    english.country,
    english.region,
    english.coordinateRole,
    english.summary,
    english.coverageDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
};
