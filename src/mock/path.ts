export type ScenarioKey = 'natural' | 'planned' | 'target';
export const scenarios = {
  natural: { label: '自然发展情景', forecast: [128.6, 122.8, 119.4, 116.9, 114.5, 112.8], reduction: '15.8', unit: '0.36', gap: '0.11', projects: ['现状设施运行', '存量企业管理'] },
  planned: { label: '当前规划情景', forecast: [128.6, 116.2, 101.4, 86.5, 79.1, 76.8], reduction: '51.8', unit: '0.29', gap: '0.04', projects: ['分布式光伏', '绿电直连', '集中储能', '企业节能改造'] },
  target: { label: '目标达成情景', forecast: [128.6, 110.2, 90.4, 75.2, 65.1, 58.3], reduction: '70.3', unit: '0.25', gap: '0.00', projects: ['分布式光伏', '绿电直连', '集中储能', '企业节能改造', '资源循环利用'] }
} as const;
