# 空间表达规则

[English](spatial-model.md) | **简体中文**

[在线访问](https://seanwong17.github.io/meteorite-atlas/) · [说明文档](README.zh-CN.md)

地图上的记录不应全部显示成同一种图钉。数据库经纬度可能代表发现点、坠落点、散布区参考点或行政地点，并不等于天体穿过大气层时的精确落点。

## 支持的形状

| `coverage.kind` | 适用证据 | 地图表达 |
| --- | --- | --- |
| `point` | 只有一个可信地点，或单块原地保存 | 图钉 |
| `circle` | 文献给出中心与半径 | 半透明圆 |
| `ellipse` | 文献给出长短轴与方向 | 定向半透明椭圆 |
| `polygon` | 有已发表或可复核的散布区边界 | 半透明多边形 |
| `line` | 有可复核的散布主轴，但缺少可靠宽度 | 虚线轴线 |
| `multi-point` | 已公开多个发现点，但尚无边界 | 多个标记 |

## 证据等级

- `official-coordinate`：MBDB 或同等级资料直接给出的坐标。
- `reported-extent`：资料给出长度、面积或范围，但不足以还原边界。
- `verified-boundary`：已发布或可复核、可以直接渲染的边界。
- `editorial-approximation`：确有必要的换算，必须明确标示且不能伪装成实测。
- `pending-digitization`：确认存在散布区，但还没有可靠几何数据。

## 设计约束

1. 不以任意半径的圆替代未知散布区。
2. 只有报告长度而没有端点、方向或宽度时，应保留文字证据，不能据此绘制轴线或椭圆。
3. 详情必须区分发现区域、坠落散布区、撞击坑关联和博物馆位置。
4. 地球仪默认只显示代表点，由用户主动开启范围图层。
5. 相机围绕固定地球中心运行，地理方向保持稳定并禁用自由滚转。

## 尺寸字段

`majorAxisKm`、`minorAxisKm`、`radiusKm` 和 `areaKm2` 只有在资料直接给出或存在可复核换算时才填写。`dimensionStatus` 区分 `reported`、`estimated` 和 `unknown`；`boundaryConfidence` 防止概括长度被误当成地图边界。
