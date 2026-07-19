# 贡献指南

[English](CONTRIBUTING.md) | **简体中文**

[在线访问](https://seanwong17.github.io/meteorite-atlas/) · [说明文档](docs/README.zh-CN.md)

感谢你帮助改进 Meteorite Atlas。项目面向初级爱好者，因此准确、可解释和可复核比记录数量更重要。

## 开始之前

1. 搜索现有 Issue，确认问题尚未被处理。
2. 数据贡献先阅读[数据贡献指南](docs/data-contribution.zh-CN.md)，科普文字先阅读[内容写作规范](docs/content-guide.zh-CN.md)。
3. 较大的界面或数据模型变更请先创建 Issue，说明用户问题、建议方案和来源。

## 开发流程

```bash
npm ci
npm run dev
```

提交前运行完整检查：

```bash
npm run check
```

提交应保持范围清晰，不要在同一 Pull Request 中混合无关重构、批量数据扩展和视觉改版。

## 数据贡献要求

- 正式名称、分类、事件和参考坐标优先引用 MBDB。
- 文化史、质量、散布范围或展藏信息应提供对应来源。
- 每个主记录都必须在 `data/meteorites.en.json` 中补齐英文内容。
- 不根据新闻插图或商品页面判断陨石身份。
- 图片必须记录作者、许可、原始文件页和人工主题审核。
- 不确定内容可以进入研究笔记，不能包装成确定事实。

## Pull Request

请说明改了什么、为什么改、如何验证，以及数据或图片来源。界面变化请附桌面和移动端截图。参与本项目即表示你同意遵守 [CODE_OF_CONDUCT.zh-CN.md](CODE_OF_CONDUCT.zh-CN.md)。
