# 数据贡献指南

## 贡献一个记录

1. 在 MBDB 确认正式英文名、分类、事件性质和参考坐标。
2. 搜集支持质量、历史、散布范围或展藏陈述的论文或机构来源。
3. 按 `data/meteorites.schema.json` 添加记录，坐标顺序必须是 `[经度, 纬度]`。
4. 根据 `docs/spatial-model.md` 选择覆盖类型和证据等级。
5. 运行 `npm run validate:data`。

不要为了让地图“更完整”而编造范围。已知存在散布区但没有可复核几何时，使用 `pending-digitization`，保留说明即可。

## 图片策展流程

1. 在记录的 `image.searchTerms` 中添加英文正式名和必要别名。
2. 运行 `npm run fetch:images`。新结果只会标记为 `needs-review`。
3. 人工打开 Commons 文件页，确认画面主体确实是对应陨石，而不是同名人物、地名、纪念碑或古籍。
4. 检查作者、许可证、原始文件页和图片说明。
5. 将正确候选改为 `approved`，填写 `reviewedAt` 与 `reviewedBy`。
6. 运行 `npm run cache:images` 生成本地文件和署名文档。
7. 再次运行 `npm run validate:data`。

无法确认时宁可使用“经核验图像待补”占位，不提交猜测性图片。

## 空间字段检查

- `circle` 必须有 `radiusKm`。
- `ellipse` 必须有长短轴。
- `line` 至少有两个点。
- `verified-boundary` 的 `polygon` 至少有三个点。
- 编辑换算必须使用 `editorial-approximation` 并在中文说明中明确“示意”。
