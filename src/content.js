export const categoryOptions = [
  { id: "all", label: "全部" },
  { id: "iron", label: "铁陨石" },
  { id: "pallasite", label: "橄榄陨铁" },
];

export const eventOptions = [
  { id: "all", label: "全部记录" },
  { id: "observed_fall", label: "目击坠落" },
  { id: "find", label: "后来发现" },
];

export const sortOptions = [
  { id: "curated", label: "策展顺序" },
  { id: "year-desc", label: "记录时间：新到旧" },
  { id: "year-asc", label: "记录时间：旧到新" },
  { id: "name", label: "名称" },
];

export const learningPaths = [
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
];

export const glossary = [
  { term: "流星体", definition: "仍在太空中运行、尚未进入大气层的天然固体。" },
  { term: "陨石", definition: "穿过大气层后到达地面的天然物质。空中的发光现象叫流星。" },
  { term: "铁陨石", definition: "主要由铁镍合金组成的陨石，不等于所有含铁的陨石。" },
  { term: "橄榄陨铁", definition: "石铁陨石的一类，典型结构是橄榄石晶体分布在铁镍金属中。" },
  { term: "目击坠落", definition: "有人观察到火球、爆炸或落物，并能把回收样品与事件联系起来。" },
  { term: "发现陨石", definition: "没有可靠当次坠落记录，后来才在地表或地下被找到。" },
  { term: "散布区", definition: "同一次破碎或撞击留下多个质量的区域，不一定有精确边界。" },
  { term: "维德曼花纹", definition: "部分铁陨石经切割、抛光和酸蚀后显现的铁镍晶体交生结构。" },
];

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

export const classificationZh = (classification) =>
  classificationTranslations.get(classification) ?? classification;

export const coverageLabel = (coverage) => {
  const labels = {
    point: "代表点",
    circle: "换算示意范围",
    ellipse: "文献概括范围",
    polygon: "区域待数字化",
    line: "散布主轴",
    "multi-point": "多个发现点",
  };
  return labels[coverage?.kind] ?? "代表点";
};

export const evidenceLabel = (confidence) => {
  const labels = {
    "official-coordinate": "正式资料坐标",
    "reported-extent": "文献报告范围",
    "verified-boundary": "已核验边界",
    "editorial-approximation": "编辑换算示意",
    "pending-digitization": "等待数字化",
  };
  return labels[confidence] ?? "证据待说明";
};

const observationNotes = {
  hoba: "观察未经切割的大型铁质表面。它不像常见橄榄陨铁切片那样出现透明晶体。",
  "sikhote-alin": "留意碎片表面的气印与撕裂形态，它们记录了高速穿过大气层和爆裂的过程。",
  fukang: "逆光观察黄绿色橄榄石晶体，再看晶体之间连续的银灰色铁镍基质。",
  pallasovka: "比较晶体大小、颜色与金属比例；同为橄榄陨铁，内部结构也不会完全一致。",
};

export const observationNote = (meteorite) =>
  observationNotes[meteorite.id] ??
  (meteorite.category === "iron"
    ? "区分天然表面与人工切面。切面花纹需要规范抛光和酸蚀才会显现，不能只凭颜色鉴定。"
    : "观察橄榄石与铁镍金属如何相互包裹。透明度和颜色会受切片厚度、风化与拍摄光线影响。");

export const queryText = (meteorite) =>
  [
    meteorite.name.zh,
    meteorite.name.en,
    ...(meteorite.aliases ?? []),
    meteorite.categoryZh,
    meteorite.classification,
    classificationZh(meteorite.classification),
    meteorite.event.labelZh,
    meteorite.location.countryZh,
    meteorite.location.regionZh,
    meteorite.location.coordinateRole,
    meteorite.summaryZh,
    meteorite.map.coverage.descriptionZh,
  ]
    .join(" ")
    .toLocaleLowerCase();
