export const enterprises = [
  {
    name: "隆基绿能",
    energy: 6.82,
    carbon: 18.2,
    intensity: 0.42,
    green: 92.1,
    change: 9.2,
    reduction: 5.6,
    x: 42,
    y: 31,
  },
  {
    name: "晶澳太阳能",
    energy: 5.46,
    carbon: 13.8,
    intensity: 0.36,
    green: 82,
    change: 6.4,
    reduction: 6.9,
    x: 74,
    y: 32,
  },
  {
    name: "德方纳米",
    energy: 4.78,
    carbon: 9.6,
    intensity: 0.29,
    green: 78.6,
    change: 12.3,
    reduction: 4.8,
    x: 29,
    y: 39,
  },
  {
    name: "亿纬锂能",
    energy: 4.78,
    carbon: 15.6,
    intensity: 0.38,
    green: 85,
    change: 12.3,
    reduction: 8.3,
    x: 49,
    y: 54,
  },
  {
    name: "云南润阳",
    energy: 4.32,
    carbon: 10.4,
    intensity: 0.33,
    green: 81.4,
    change: 5.9,
    reduction: 4.5,
    x: 87,
    y: 50,
  },
];
export type Enterprise = (typeof enterprises)[number];
export const projects = [
  ["隆基股份绿电直连示范项目", "绿电直连", "建设中", "2026-12", "78%"],
  ["亿纬锂能绿电直连示范项目", "绿电直连", "建设中", "2027-03", "65%"],
  ["园区风电项目（一期）", "风电项目", "已投运", "2026-03", "100%"],
  ["园区分布式光伏项目", "光伏项目", "已投运", "2026-05", "100%"],
  ["多能互补储能项目", "储能项目", "建设中", "2027-06", "56%"],
  ["企业节能降碳技改项目", "节能改造", "进行中", "2027-09", "62%"],
];
export const tasks = [
  ["绿色能源体系建设", 78],
  ["企业节能降碳改造", 62],
  ["绿色制造零碳工厂创建", 55],
  ["资源循环利用", 68],
  ["智慧能碳管理能力建设", 80],
] as const;
export const milestones = [
  { year: 2026, name: "建设启动年", items: ["总体规划", "项目启动"] },
  { year: 2027, name: "加快推进年", items: ["能源结构优化", "节能改造启动"] },
  {
    year: 2028,
    name: "验收攻坚年",
    items: [
      "全面建成绿色能源供能结构",
      "基本建成能碳管理能力",
      "争取通过国家级验收",
    ],
  },
  { year: 2029, name: "运营优化年", items: ["深化降碳措施", "模式复制推广"] },
  {
    year: 2030,
    name: "示范引领年",
    items: ["全面达到零碳园区指标要求", "形成示范引领高地"],
  },
];
export const energyModes = {
  electric: {
    label: "电力流向",
    source: "电力来源结构",
    color: "#39b5ff",
    unit: "亿kWh",
    total: 41.82,
    values: [18.74, 12.56, 9.28, 1.24],
    sources: ["电网购电", "绿电交易", "分布式光伏", "其他电力"],
  },
  gas: {
    label: "天然气流向",
    source: "天然气来源结构",
    color: "#a7e871",
    unit: "万Nm³",
    total: 6.08,
    values: [4.18, 1.3, 0.6],
    sources: ["管道天然气", "液化天然气", "其他气源"],
  },
  heat: {
    label: "热力流向",
    source: "热力来源结构",
    color: "#ffb63f",
    unit: "万GJ",
    total: 4.68,
    values: [2.46, 1.42, 0.8],
    sources: ["集中供热", "余热回收", "企业自供热"],
  },
  green: {
    label: "绿电溯源",
    source: "绿电来源结构",
    color: "#48e4a6",
    unit: "亿kWh",
    total: 34.54,
    values: [18.6, 9.28, 6.66],
    sources: ["风力发电", "光伏发电", "绿电交易"],
  },
};
export const energyViews = {
  all: {
    label: "综合视图",
    source: "综合能源来源结构",
    color: "#bcecff",
    unit: "万tce",
    total: 58.62,
    values: [42.82, 6.08, 4.68, 5.04],
    sources: ["电力（折标）", "天然气（折标）", "热力（折标）", "其他（折标）"],
  },
  ...energyModes,
};
export type EnergyMode = keyof typeof energyViews;
export const emissionSources = [
  { name: "外购电力", value: 72.3, color: "#358bf5" },
  { name: "天然气", value: 12.6, color: "#1bdfae" },
  { name: "外购热力", value: 6.8, color: "#ffc342" },
  { name: "工业过程", value: 5.4, color: "#a78bfa" },
  { name: "交通及其他", value: 2.9, color: "#34d2db" },
];
export const contributions = [
  { name: "绿电替代", value: 9.6, color: "#22dcb0" },
  { name: "节能技改", value: 6.8, color: "#30b1ff" },
  { name: "清洁能源替代", value: 4.2, color: "#ffd467" },
  { name: "资源循环利用", value: 2.6, color: "#b49aff" },
  { name: "CCUS/生态固碳", value: 1.6, color: "#46d9e1" },
];
