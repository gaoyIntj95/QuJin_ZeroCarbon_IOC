import { useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Factory,
  Flame,
  Leaf,
  RefreshCw,
  Waves,
  Zap,
} from "lucide-react";
import { Donut, LineChart } from "../components/Charts";
import {
  DetailTable,
  CompactSelect,
  Metric,
  Panel,
  Progress,
  type ShowDetail,
} from "../components/UI";
import { ParkScene } from "../components/ParkScene";
import { enterprises, energyViews, type EnergyMode } from "../data";

const modeIcons = { all: Activity, electric: Zap, gas: Flame, heat: Waves, green: Leaf };
const periods = [
  { label: "2026-06-20 → 2026-06-26", factor: 1 },
  { label: "2026-06-13 → 2026-06-19", factor: 0.94 },
  { label: "2026-06-01 → 2026-06-30", factor: 4.12 },
];
export default function Energy({ showDetail }: { showDetail: ShowDetail }) {
  const [mode, setMode] = useState<EnergyMode>("electric");
  const [period, setPeriod] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [updated, setUpdated] = useState("2026-06-26 10:00");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const factor = periods[period].factor;
  const source = energyViews[mode];
  const activeIndex = hovered ?? selected;
  const format = (v: number) => (v * factor).toFixed(2);
  const details = (index = activeIndex ?? 0) => {
    const target = enterprises[index];
    showDetail(
      `${target.name} · 能源消费详情`,
      <>
        <div className="detail-kpis">
          <div>
            综合能源消费
            <strong>
              {format(target.energy)} <small>万tce</small>
            </strong>
          </div>
          <div>
            绿电占比<strong>{target.green}%</strong>
          </div>
        </div>
        <p>已接入企业能耗计量、绿电交易与能源流向数据，当前展示本期 Mock 汇总值。</p>
        <DetailTable
          headers={["能源类型", "本期消费量", "统计范围"]}
          rows={[
            ["电力", `${format(target.energy * 0.925)} 亿kWh`, periods[period].label],
            ["天然气", `${format(target.energy * 0.029)} 万Nm³`, periods[period].label],
            ["热力", `${format(target.energy * 0.023)} 万GJ`, periods[period].label],
            ["其他能源", `${format(target.energy * 0.022)} 万tce`, periods[period].label],
          ]}
        />
      </>,
    );
  };
  const totals = [58.62, 41.82, 6.08, 4.68, 5.04, 82.6];
  const series = [
    {
      name: "综合能耗",
      color: "#6dc4ff",
      data: [58, 68, 76, 80, 72, 70, 76, 69, 72, 74, 78, 80],
    },
    {
      name: "电力（折标）",
      color: "#34dcb5",
      data: [39, 44, 53, 55, 47, 46, 52, 46, 48, 49, 51, 53],
    },
    {
      name: "天然气（折标）",
      color: "#a3df58",
      data: [18, 21, 26, 27, 23, 23, 23, 21, 22, 23, 23, 24],
    },
    {
      name: "热力（折标）",
      color: "#ffc548",
      data: [8, 11, 13, 13, 10, 11, 11, 9, 10, 10, 11, 12],
    },
    {
      name: "其他（折标）",
      color: "#b18deb",
      data: [1, 2, 2, 3, 2, 2, 3, 2, 2, 3, 3, 3],
    },
  ];
  const sorted = enterprises
    .map((e, index) => ({ ...e, index }))
    .sort((a, b) =>
      sort === "desc" ? b.energy - a.energy : a.energy - b.energy,
    );
  return (
    <>
      <div className="metrics energy-metrics">
        {[
          "综合能源消费量（折标）",
          "园区用电量",
          "天然气消费量",
          "热力消费量",
          "其他能源消费量",
          "绿电消费占比",
        ].map((label, i) => (
          <Metric
            key={label}
            icon={[Activity, Zap, Flame, Waves, Factory, Leaf][i]}
            label={label}
            value={i === 5 ? "82.6%" : format(totals[i])}
            unit={["万tce", "亿kWh", "万Nm³", "万GJ", "万tce", ""][i]}
            color={
              [
                "#8ccffd",
                "#91c5ff",
                "#ffca65",
                "#f7b953",
                "#c196f3",
                "#9fe478",
              ][i]
            }
            note={
              <span className={i === 2 || i === 3 || i === 4 ? "red" : "green"}>
                {i === 5 ? (
                  "同比提升 9.4 个百分点"
                ) : (
                  <>
                    同比{i < 2 ? "下降" : "增长"}{" "}
                    {["6.51", "5.8", "8.3", "6.1", "3.2"][i]}%{" "}
                    {i < 2 ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                  </>
                )}
              </span>
            }
            onClick={() =>
              showDetail(
                label,
                <>
                  <p>统计周期：{periods[period].label}</p>
                  <div className="detail-kpis">
                    <div>
                      {label}
                      <strong>
                        {i === 5 ? "82.6%" : format(totals[i])}{" "}
                        <small>
                          {["万tce", "亿kWh", "万Nm³", "万GJ", "万tce", ""][i]}
                        </small>
                      </strong>
                    </div>
                    <div>
                      数据状态
                      <strong>已更新</strong>
                    </div>
                  </div>
                  <p>该指标按园区能源计量、企业报送与平台折标口径汇总，当前为演示数据。</p>
                </>,
              )
            }
          />
        ))}
      </div>
      <main className="energy-grid">
        <aside className="energy-left">
          <Panel title="园区能源消费结构（折标）" extra="单位：万tce">
            <div className="energy-structure">
              <Donut
                value={format(58.62)}
                label="综合能源消费"
                data={[
                  { name: "电力", value: 42.82, color: "#3c91ed" },
                  { name: "天然气", value: 6.08, color: "#88c957" },
                  { name: "热力", value: 4.68, color: "#ffd250" },
                  { name: "其他", value: 5.04, color: "#a07dde" },
                ]}
                onSelect={(d) => {
                  if (d.name === "电力") setMode("electric");
                  else if (d.name === "天然气") setMode("gas");
                  else if (d.name === "热力") setMode("heat");
                  else
                    showDetail(
                      "其他能源",
                      <>
                        <div className="detail-kpis">
                          <div>
                            本期消费量
                            <strong>{format(5.04)} <small>万tce</small></strong>
                          </div>
                          <div>
                            综合能耗占比
                            <strong>8.6<small>%</small></strong>
                          </div>
                        </div>
                        <p>其他能源包含园区辅助生产、交通及暂未归类的能源消费。</p>
                      </>,
                    );
                }}
              />
              <div className="structure-legend">
                {[
                  ["电力", 42.82, "#3c91ed"],
                  ["天然气", 6.08, "#88c957"],
                  ["热力", 4.68, "#ffd250"],
                  ["其他", 5.04, "#a07dde"],
                ].map(([n, v, c]) => (
                  <div key={n}>
                    <i style={{ background: String(c) }} />
                    <span>{n}</span>
                    <b>{format(Number(v))}</b>
                    <small>{((Number(v) / 58.62) * 100).toFixed(1)}%</small>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
          <Panel
            title={source.source}
            extra={
              <span style={{ color: source.color }}>
                当前视角 · {source.label}
              </span>
            }
          >
            <div className="source-unit">单位：{source.unit}</div>
            <div className="source-bars">
              {source.sources.map((name, i) => {
                const Icon = [Zap, Leaf, Factory, Flame][i];
                return (
                  <button
                    key={name}
                    onClick={() =>
                      showDetail(
                        name,
                        <>
                          <div className="detail-kpis">
                            <div>
                              本期消费量
                              <strong>
                                {format(source.values[i])} <small>{source.unit}</small>
                              </strong>
                            </div>
                            <div>
                              来源占比
                              <strong>
                                {((source.values[i] / source.total) * 100).toFixed(1)}<small>%</small>
                              </strong>
                            </div>
                          </div>
                          <p>{name}为当前能源视角下的 Mock 来源明细，已纳入园区能源流向统计。</p>
                          <DetailTable
                            headers={["来源", "统计周期", "数据状态"]}
                            rows={[[name, periods[period].label, "已接入"]]}
                          />
                        </>,
                      )
                    }
                  >
                    <Icon size={24} />
                    <span>{name}</span>
                    <Progress
                      value={(source.values[i] / source.total) * 100}
                      color={["#438ff0", "#8cc975", "#e2b252", "#ab8de2"][i]}
                    />
                    <b>{format(source.values[i])}</b>
                    <small>
                      {((source.values[i] / source.total) * 100).toFixed(1)}%
                    </small>
                  </button>
                );
              })}
            </div>
            <p className="panel-note">
              说明：绿色标识表示具备绿色属性的能源来源
            </p>
          </Panel>
          <Panel title="视图说明">
            <p className="panel-note">
              选择能源类型，来源结构与园区流向同步变化
            </p>
            <div className="view-switches">
              {Object.entries(energyViews).map(([key, m]) => {
                const Icon = modeIcons[key as EnergyMode];
                return (
                  <button
                    key={key}
                    className={mode === key ? "active" : ""}
                    style={{ "--accent": m.color } as React.CSSProperties}
                    onClick={() => setMode(key as EnergyMode)}
                    aria-pressed={mode === key}
                  >
                    <Icon size={27} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </aside>
        <div className="energy-center">
          <div className="energy-toolbar">
            <label className="period-select">
              <CalendarDays size={15} />
              <CompactSelect
                ariaLabel="能源统计周期"
                value={String(period)}
                options={periods.map((p, i) => ({ value: String(i), label: p.label }))}
                onChange={(value) => setPeriod(Number(value))}
              />
            </label>
          </div>
          <ParkScene
            kind="energy"
            mode={mode}
            factor={factor}
            selected={selected}
            onSelect={setSelected}
            onHover={setHovered}
          />
        </div>
        <aside className="energy-right">
          <Panel title="园区综合能耗趋势" extra="本年 · 折标万tce">
            <LineChart
              lines={series}
              labels={Array.from({ length: 12 }, (_, i) => `${i + 1}月`)}
              max={90}
              unit="万tce"
              onPoint={(i) =>
                showDetail(
                  `${i + 1}月能耗明细`,
                  <DetailTable
                    headers={["能源类别", "折标能耗（万tce）"]}
                    rows={series.map((s) => [s.name, s.data[i]])}
                  />,
                )
              }
            />
          </Panel>
          <Panel title="重点用能企业（本期）" extra="单位：万tce">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>排名</th>
                  <th>企业名称</th>
                  <th>
                    <button
                      onClick={() =>
                        setSort((s) => (s === "desc" ? "asc" : "desc"))
                      }
                      aria-label="切换综合能耗排序"
                    >
                      综合能耗 {sort === "desc" ? "↓" : "↑"}
                    </button>
                  </th>
                  <th>占比</th>
                  <th>同比</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e, i) => (
                  <tr
                    key={e.name}
                    className={selected === e.index ? "selected" : ""}
                  >
                    <td>
                      <i className={`rank rank-${i}`}>{i + 1}</i>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelected(e.index);
                          details(e.index);
                        }}
                      >
                        {e.name}
                      </button>
                    </td>
                    <td>{format(e.energy)}</td>
                    <td>{((e.energy / 58.62) * 100).toFixed(1)}%</td>
                    <td className="green">+{e.change}%</td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <i className="rank">6</i>
                  </td>
                  <td>其他企业（12家）</td>
                  <td>{format(32.46)}</td>
                  <td>55.3%</td>
                  <td className="green">-2.1%</td>
                </tr>
              </tbody>
            </table>
            <p className="panel-note ranking-hint">
              点击企业名称联动查看园区点位和用能详情
            </p>
          </Panel>
        </aside>
      </main>
      <footer className="data-footer">
        <span>
          数据来源：园区能碳管理平台 ｜ 电网公司 ｜ 企业报送
        </span>
        <button
          onClick={() =>
            setUpdated(new Date().toLocaleString("zh-CN", { hour12: false }))
          }
          aria-label="刷新演示数据"
        >
          数据更新：{updated}
          <RefreshCw size={14} />
        </button>
        <span>演示数据　｜　部分数据可能存在延迟</span>
      </footer>
    </>
  );
}
