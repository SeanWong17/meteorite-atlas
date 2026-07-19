# 架构说明

[English](architecture.md) | **简体中文**

[在线访问](https://seanwong17.github.io/meteorite-atlas/) · [说明文档](README.zh-CN.md)

Meteorite Atlas 是一个不依赖后端的 Vite + React 静态站点。JSON 内容在构建时导入，Three.js 地球仪按需加载，可部署到 GitHub Pages 或任意静态主机。

## 数据流

1. `data/meteorites.json` 保存正式记录、空间证据、中文摘要和来源。
2. `data/meteorites.en.json` 为每个精选 ID 提供完整英文内容。
3. `data/wikimedia-images.json` 保存图片许可、审核状态和本地缓存路径。
4. `src/App.jsx` 管理检索、筛选、排序、URL、语言、详情、导览和对比。
5. `src/GlobeScene.jsx` 把坐标与覆盖形状转换为 Three.js 对象。
6. `scripts/validate-data.mjs` 执行 JSON Schema 以及记录、翻译、图片和几何的跨文件校验。

## 前端边界

`App.jsx` 拥有用户可见状态。`GlobeScene.jsx` 只接收记录、可见 ID、选中 ID、图层状态、语言和有限回调。地球仪仅暴露 `focusOn` 与 `resetView`，不读取筛选或 URL。

Three.js 使用 `React.lazy` 延迟加载。静止时按需渲染；OrbitControls 变化、尺寸变化、筛选、选中和聚焦动画会请求新帧。自动旋转是可选功能，页面隐藏时会暂停。

地球控制中心始终位于原点。选择记录只让相机围绕固定中心移动，任何手动操作都会关闭自动旋转。界面不开放容易让初学者失去方向的自由滚转。

## 国际化

中文主数据和英文内容层以稳定的陨石 ID 对应。`src/i18n.js` 本地化记录字段与界面文案，`src/content.js` 本地化学习路线、术语、筛选、证据标签和观察提示。英文 URL 包含 `lang=en`，当前语言会同步到 `<html lang>`、页面元数据和本地偏好。

## 空间表达

| 类型 | 渲染 |
| --- | --- |
| `point` | 只显示代表点 |
| `line` | 虚线散布主轴 |
| `circle` | 换算示意圆 |
| `ellipse` | 文献概括椭圆 |
| `multi-point` | 多个发现点 |
| `polygon` | 有三个以上核验点时绘制闭合边界 |

`pending-digitization` 可以保留覆盖类型但不提供几何。页面会解释缺失边界，不臆造范围。

## 静态资源

所有公共资源通过 `import.meta.env.BASE_URL` 解析。CI 设置 `BASE_PATH`，因此同一构建可运行在域名根路径或仓库子路径。只有 `reviewStatus: approved` 且本地文件存在的图片才能通过校验并出现在界面中。
