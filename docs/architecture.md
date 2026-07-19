# 架构说明

Meteorite Atlas 是一个不依赖后端的 Vite + React 静态站点。内容在构建时从 JSON 导入，地球仪按需加载，适合部署到 GitHub Pages 或任意静态主机。

## 数据流

1. `data/meteorites.json` 保存正式记录、空间证据、中文摘要和来源。
2. `data/wikimedia-images.json` 保存图片许可、审核状态和本地缓存路径。
3. `src/App.jsx` 完成全文检索、筛选、排序、URL 状态、详情、导览和对比。
4. `src/GlobeScene.jsx` 把坐标与覆盖形状转换为 Three.js 对象。
5. `scripts/validate-data.mjs` 使用 JSON Schema 并执行跨文件校验。

## 前端边界

`App.jsx` 拥有用户可见状态，`GlobeScene.jsx` 只接收记录、可见 ID、选中 ID 和图层开关。地球仪通过 `focusOn`、`resetView` 两个命令式方法暴露有限控制，不读取筛选或 URL。

Three.js 代码使用 `React.lazy` 延迟加载。自动旋转关闭后场景改为按需渲染；OrbitControls 变化、尺寸变化、筛选、选中和聚焦动画会请求新帧。

## 空间表达

覆盖类型由 `makeCoverage` 解释：

| 类型 | 渲染 |
| --- | --- |
| `point` | 只显示代表点 |
| `line` | 虚线散布主轴 |
| `circle` | 换算示意圆 |
| `ellipse` | 文献概括椭圆 |
| `multi-point` | 多个小型发现点 |
| `polygon` | 有三个以上边界点时绘制闭合边界 |

`pending-digitization` 可以保留类型但没有几何点，此时页面说明“待数字化”，地图不臆造范围。

## 静态资源

所有公共资源通过 `import.meta.env.BASE_URL` 解析。CI 部署时设置 `BASE_PATH`，因此项目可以运行在域名根路径或仓库子路径。

正式图片缓存在 `public/assets/meteorites/`。自动搜索候选不能被页面读取，只有 `reviewStatus: approved` 且本地文件存在时才能通过校验。
