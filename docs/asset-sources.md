# 界面资源来源

## 地球贴图

- 文件：`public/assets/earth-surface.jpg`、`earth-clouds.png`
- 来源：[Three.js planets texture collection](https://threejs.org/examples/textures/planets/)
- 说明：地球表面贴图源自 NASA Blue Marble，用于 Three.js 地球表面和云层。

## 国家边界

- 文件：`public/assets/countries-110m.geojson`
- 来源：[Natural Earth](https://www.naturalearthdata.com/) 1:110m Admin 0 Countries
- 许可证：公共领域
- 用途：绘制低干扰国家边界，帮助初级爱好者识别发现地点。

项目使用 1:110m 数据代替原来的 1:50m 文件，将未压缩边界资源从约 3 MB 降至约 0.84 MB。它只用于全球尺度定位，不适合行政边界判定。

陨石详情图片的逐项作者、文件页、审核状态和许可证见 [image-sources.md](image-sources.md)。
