# 第一版大屏交互实现

基准：用户提供的“1.第一版-效果图”三张 1672 × 941 原型。

## 页面与交互

- `/overview`：评价指标、任务、项目、建设成果详情；项目状态筛选；地图设施类型筛选；路线图年份选择。
- `/energy-flow`：综合视图及四种能源视角；统计周期切换；来源结构联动；企业排序与地图点位联动；企业详情；趋势图图例开关、数据提示及点击明细。
- `/carbon-trend`：排放来源及减排贡献详情；年度预测和月度趋势切换；热力等级筛选；企业排名与地图点位联动；目标详情。
- 公共：实时时钟、1672 × 941 等比例适配、地图缩放与重置、键盘焦点、弹窗 Escape 关闭、减少动态效果偏好。

UI、文本、指标、表格、图表、标牌、热力区域及流向均由 React / CSS / SVG 渲染；不再引用整页原型图作为界面。

## 数据边界

目前为前端演示，没有接入后端。原型指标保留原有展示口径；不同页面的绿电占比、评价分组统计等不能据此作为真实业务核算结果。

`src/data.ts` 集中维护企业、项目、任务、能源来源及减排贡献。能源统计周期使用示例系数联动指标、来源和企业数据；本年趋势不受周度筛选影响。刷新按钮只更新时间，不请求后台。预测、设施位置、计划投运时间均为演示值。

园区场景是二维鸟瞰示意，点位按相对坐标定位，不是 GIS 或实时三维孪生。背景经过生成式重建，建筑细节与原型存在差别。

## 场景素材

文件：`public/assets/park-aerial.png`。

使用内置 imagegen，以第一版总览为编辑参考，移除仪表盘 UI 和文字，再在前端添加交互覆盖层。生成原图保留在 Codex 的 generated_images 目录。

最终提示词：

```text
Use case: precise-object-edit. Input image is edit target: a dashboard screenshot. Extract ONLY the central aerial industrial park scene (approximately x400 to1273, y196 to790). Output a standalone 3:2 landscape background image of that park, filling entire image. Remove ALL dashboard elements, ALL text, ALL labels, ALL markers, ALL pins, ALL HUD effects, legends, glowing paths and overlays, compass and titles. Reconstruct buildings/landscape behind removed labels. Preserve the original isometric aerial camera, building layout, white industrial warehouses with blue solar roofs, roads, green trees, mountainous backdrop and small lake, keep scene sharp detailed realistic 3D architectural rendering, original cool green-blue lighting. No typography, no UI, no text, no borders, no watermarks. This clean image will be used as a background underneath real HTML interactive enterprise labels, charts and SVG animated flows.
```

## 运行

```sh
npm run dev
npm run build
```

部署时延续 Vite 的 `BASE_URL`，支持项目已有 GitHub Pages 子路径配置。
