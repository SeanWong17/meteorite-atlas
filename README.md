# Meteorite Atlas / 陨石图谱

面向初级爱好者的开源陨石学习图谱。项目用可交互地球仪串联铁陨石与橄榄陨铁的分类、发现或坠落记录、空间证据和标本外观。

![陨石图谱桌面界面](docs/screenshot.png)

## 项目定位

这是一份精选学习图谱，不是全球陨石完整数据库。当前收录 26 个正式命名记录，重点回答三个入门问题：

- 铁陨石与橄榄陨铁在结构上有什么不同？
- “目击坠落”和“后来发现”为什么不能混为一谈？
- 地图上的点、虚线和范围分别代表什么证据？

橄榄陨铁是石铁陨石的一类，不等同于全部石铁陨石。正式名称、分类和参考坐标优先采用 Meteoritical Bulletin Database（MBDB）。

## 功能

- Three.js 可旋转地球仪、国家边界、分类标记和散布范围图层
- 名称、别名、地区、分类、年份和科普术语全文搜索
- 类别、记录方式筛选以及名称、年份排序
- 中文分类解释、坐标角色、证据等级和“看图时留意”提示
- 三条新手学习路线、术语表和双记录对比
- 可分享的陨石与筛选 URL，支持浏览器前进后退
- 桌面双侧工作区，移动端地图、目录、详情单面板导航
- 经过主题与许可证核验的本地图片缓存和逐项署名
- JSON Schema、跨文件数据校验和 Playwright 端到端测试

## 本地运行

需要 Node.js 18 或更高版本。

```bash
npm ci
npm run dev
```

Vite 会输出本地访问地址。常用命令：

```bash
npm run validate:data  # 校验数据、几何、来源和图片清单
npm run build          # 生成生产版本
npm run test:e2e       # 自动启动开发服务器并运行浏览器测试
npm run check          # 执行完整检查
npm run fetch:images   # 生成待人工审核的 Commons 候选
npm run cache:images   # 缓存已经批准的图片并更新署名文档
```

## 数据与目录

```text
data/                         主数据、图片清单和 JSON Schema
docs/                         研究、内容、空间和资源说明
public/assets/                地球、边界和核验后的本地图片
scripts/                      数据校验与图片策展工具
src/App.jsx                   页面状态、目录、详情、导览与对比
src/GlobeScene.jsx            Three.js 场景与空间表达
tests/atlas.spec.js           关键用户流程和响应式测试
```

新增记录前请阅读 [数据贡献指南](docs/data-contribution.md)、[内容写作规范](docs/content-guide.md) 和 [空间表达规则](docs/spatial-model.md)。实现概览见 [架构说明](docs/architecture.md)。

## 数据原则

- “发现地”“坠落地点”“散布区”“撞击坑”和“展藏地点”分别记录。
- 不用任意圆或行政中心伪装未知边界。
- 自动图片搜索只产生 `needs-review` 候选，人工核验后才能设为 `approved`。
- 页面摘要使用段落级来源编号；重要文化史或研究结论应补充专门来源。
- 数据修改必须通过 `npm run validate:data`。

## 参与贡献

欢迎补充来源、纠正中文表述、核验图片、改善无障碍或增加测试。提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。适合第一次参与的任务可以从带有 `good first issue` 标签的 Issue 开始。

## 许可证

代码采用 [MIT License](LICENSE)。项目原创科普文字与数据结构采用 CC BY 4.0；Wikimedia Commons 图片、NASA/Three.js 地球贴图和 Natural Earth 边界保持各自许可或公共领域状态。详见 [许可证与第三方资源](docs/licenses.md)。

## 当前范围

当前版本聚焦 13 个铁陨石与 13 个橄榄陨铁记录。后续扩展优先保证来源、空间证据和中文解释质量，不以记录数量为目标。
