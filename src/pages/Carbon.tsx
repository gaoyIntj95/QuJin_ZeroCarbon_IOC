import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Boxes,
  Factory,
  Leaf,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import { Donut, LineChart } from "../components/Charts";
import {
  CompactSelect,
  DetailTable,
  Metric,
  Panel,
  Progress,
  type ShowDetail,
} from "../components/UI";
import { ParkScene } from "../components/ParkScene";
import { contributions, emissionSources, enterprises } from "../data";

export default function Carbon({ showDetail }: { showDetail: ShowDetail }) {
  const [selected, setSelected] = useState(0);
  const [level, setLevel] = useState("all");
  const [trend, setTrend] = useState("forecast");
  const [activeContribution, setActiveContribution] = useState<string | null>(
    null,
  );
  const rankings = [...enterprises].sort((a, b) => b.carbon - a.carbon);
  const contributionRankings = [...enterprises].sort(
    (a, b) => b.reduction - a.reduction,
  );
  const contributionTotal = contributionRankings.reduce(
    (total, enterprise) => total + enterprise.reduction,
    0,
  );
  const enterpriseDetail = (index: number) => {
    setSelected(index);
    const e = enterprises[index];
    showDetail(
      `${e.name} · 排放详情`,
      <>
        <div className="detail-kpis">
          <div>
            碳排放量
            <strong>
              {e.carbon}
              <small> 万tCO₂</small>
            </strong>
          </div>
          <div>
            单位能源碳排放
            <strong>
              {e.intensity}
              <small> tCO₂/tce</small>
            </strong>
          </div>
        </div>
        <p>
          同比下降 {e.reduction}%，绿电占比 {e.green}%。
        </p>
        <p>建议措施：提高绿色电力采购比例，持续推进生产设备节能改造。</p>
      </>,
    );
  };
  const lines =
    trend === "forecast"
      ? [
          {
            name: "碳排放总量",
            color: "#59b9ff",
            data: [128.6, 106.2, 94.5, 86.8, 76.4, 68.2],
          },
          {
            name: "单位能源碳排放 ×100",
            color: "#27d6b0",
            unit: "tCO₂/tce",
            displayScale: 100,
            data: [31, 29, 27, 26, 25, 23],
          },
        ]
      : [
          {
            name: "碳排放总量",
            color: "#59b9ff",
            data: [
              11.8, 10.5, 11.3, 10.2, 9.8, 10.7, 11.2, 10.6, 10.8, 10.3, 10.9,
              10.5,
            ],
          },
        ];
  const labels =
    trend === "forecast"
      ? ["2026", "2027", "2028", "2029", "2030", "2031"]
      : Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
  const contributionDetail = (name: string) => {
    setActiveContribution(name);
    const d = contributions.find((c) => c.name === name)!;
    showDetail(
      `${name} · 年度降碳贡献`,
      <>
        <div className="detail-kpis">
          <div>
            年度减排量
            <strong>
              {d.value} <small>万tCO₂</small>
            </strong>
          </div>
          <div>
            贡献占比<strong>{((d.value / 24.8) * 100).toFixed(1)}%</strong>
          </div>
        </div>
        <p>年度减排量为演示口径，正式数据按项目核算结果汇总。</p>
      </>,
    );
  };
  const Ranking = ({ compact = false }: { compact?: boolean }) => (
    <table
      className={`ranking-table carbon-ranking ${compact ? "compact" : ""}`}
    >
      <thead>
        <tr>
          <th>排名</th>
          <th>企业名称</th>
          <th>排放量</th>
          <th>园区占比</th>
          <th>同比变化</th>
          {compact && <th>强度</th>}
        </tr>
      </thead>
      <tbody>
        {rankings.map((e, i) => (
          <tr
            key={e.name}
            className={enterprises[selected].name === e.name ? "selected" : ""}
          >
            <td>
              <i className={`rank rank-${i}`}>{i + 1}</i>
            </td>
            <td>
              <button onClick={() => enterpriseDetail(enterprises.indexOf(e))}>
                {e.name}
              </button>
            </td>
            <td>{e.carbon}</td>
            <td>{((e.carbon / 128.6) * 100).toFixed(1)}%</td>
            <td className="green">↓ {e.reduction}%</td>
            {compact && <td>{e.intensity}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
  const ContributionRanking = () => (
    <table className="ranking-table carbon-ranking contribution-ranking">
      <thead>
        <tr>
          <th>排名</th>
          <th>企业名称</th>
          <th>减排量</th>
          <th>贡献占比</th>
          <th>同比变化</th>
        </tr>
      </thead>
      <tbody>
        {contributionRankings.map((e, i) => (
          <tr
            key={e.name}
            className={enterprises[selected].name === e.name ? "selected" : ""}
          >
            <td>
              <i className={`rank rank-${i}`}>{i + 1}</i>
            </td>
            <td>
              <button onClick={() => enterpriseDetail(enterprises.indexOf(e))}>
                {e.name}
              </button>
            </td>
            <td>{e.reduction}</td>
            <td>{((e.reduction / contributionTotal) * 100).toFixed(1)}%</td>
            <td className="green">↑ {e.change}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <>
      <div className="metrics carbon-metrics">
        {[
          ["园区碳排放总量", "128.6", "万tCO₂", "12.3"],
          ["范围一排放", "32.6", "万tCO₂", "8.7"],
          ["范围二排放", "96.0", "万tCO₂", "14.8"],
          ["单位能源碳排放", "0.31", "tCO₂/tce", "18.2"],
          ["年度减排量", "24.8", "万tCO₂", "32.6"],
        ].map(([label, value, unit, change], i) => (
          <Metric
            key={label}
            icon={[Boxes, Factory, Zap, Leaf, Leaf][i]}
            label={label}
            value={value}
            unit={unit}
            color={i > 2 ? "#70e2b1" : "#8acffb"}
            note={
              <span className="green">
                <ArrowDown size={12} /> {change}%　<small>同比</small>
              </span>
            }
            onClick={() =>
              showDetail(
                label,
                <>
                  <div className="detail-kpis">
                    <div>
                      {label}
                      <strong>
                        {value}
                        <small> {unit}</small>
                      </strong>
                    </div>
                  </div>
                  <p>
                    {i === 1
                      ? "范围一：园区内燃料燃烧、工业过程等直接排放。"
                      : i === 2
                        ? "范围二：外购电力、外购热力产生的间接排放。"
                        : "统计范围：曲靖经开区南海子工业园区，当前展示年度累计演示数据。"}
                  </p>
                </>,
              )
            }
          />
        ))}
      </div>
      <main className="carbon-grid">
        <aside className="carbon-left">
          <Panel title="排放来源结构">
            <div className="emission-structure">
              <Donut
                data={emissionSources}
                value="128.6"
                label="总排放量 / 万tCO₂"
                onSelect={(s) =>
                  showDetail(
                    `${s.name}排放`,
                    <>
                      <div className="detail-kpis">
                        <div>
                          排放量
                          <strong>{((128.6 * s.value) / 100).toFixed(2)} <small>万tCO₂</small></strong>
                        </div>
                        <div>
                          园区占比
                          <strong>{s.value}<small>%</small></strong>
                        </div>
                      </div>
                      <p>该排放源按园区年度碳盘查口径汇总，用于识别重点减排方向。</p>
                    </>,
                  )
                }
              />
              <div className="emission-legend">
                {emissionSources.map((s) => (
                  <button
                    key={s.name}
                    onClick={() =>
                      showDetail(
                        s.name,
                        <>
                          <div className="detail-kpis">
                            <div>
                              排放量
                              <strong>{((128.6 * s.value) / 100).toFixed(2)} <small>万tCO₂</small></strong>
                            </div>
                            <div>
                              排放占比
                              <strong>{s.value}<small>%</small></strong>
                            </div>
                          </div>
                          <p>该来源明细为当前年度累计 Mock 数据，正式值以碳盘查结果为准。</p>
                        </>,
                      )
                    }
                  >
                    <i style={{ background: s.color }} />
                    {s.name}
                    <b>{s.value}%</b>
                  </button>
                ))}
              </div>
            </div>
          </Panel>
          <Panel
            title="碳排放趋势"
            extra={
              <CompactSelect
                ariaLabel="碳排放趋势周期"
                value={trend}
                options={[
                  { value: "forecast", label: "年度预测" },
                  { value: "monthly", label: "本年月度" },
                ]}
                onChange={setTrend}
              />
            }
          >
            <LineChart
              labels={labels}
              lines={lines}
              max={trend === "forecast" ? 150 : 15}
              unit="万tCO₂"
              onPoint={(i) =>
                showDetail(
                  `${labels[i]}碳排放数据`,
                  <>
                    <div className="detail-kpis">
                      <div>
                        碳排放总量
                        <strong>{lines[0].data[i]} <small>万tCO₂</small></strong>
                      </div>
                      <div>
                        单位能源碳排放
                        <strong>
                          {trend === "forecast" ? lines[1].data[i] / 100 : "—"}
                          <small> tCO₂/tce</small>
                        </strong>
                      </div>
                    </div>
                    <p>{trend === "forecast" ? "年度预测值，用于观察园区碳排放下降趋势。" : "月度累计值，用于辅助定位季节性排放波动。"}</p>
                  </>,
                )
              }
            />
            <p className="chart-caption">
              {trend === "forecast"
                ? "演示预测 · 强度按 ×100 同轴展示"
                : "2026 年度 · 月度排放演示数据"}
            </p>
          </Panel>
          <Panel title="重点排放企业" extra="单位：万tCO₂">
            <Ranking compact />
          </Panel>
        </aside>
        <div className="carbon-center">
          <ParkScene
            kind="carbon"
            selected={selected}
            onSelect={setSelected}
            level={level}
          />
          <div className="heat-legend">
            <b>碳排放强度（tCO₂/tce）</b>
            {[
              ["high", "高（≥0.40）", "#ff5d60"],
              ["medium", "中高（0.35—0.40）", "#ffcc56"],
              ["low", "低（<0.35）", "#4ba8ff"],
            ].map(([key, text, color]) => (
              <button
                key={key}
                className={level === key ? "active" : ""}
                onClick={() => setLevel(level === key ? "all" : key)}
                aria-pressed={level === key}
              >
                <i style={{ background: color }} />
                {text}
              </button>
            ))}
          </div>
        </div>
        <aside className="carbon-right">
          <Panel title="降碳贡献结构">
            <div className="contribution-structure">
              <Donut
                data={contributions}
                value="24.8"
                label="年度减排量 / 万tCO₂"
                onSelect={(s) => contributionDetail(s.name)}
              />
              <div className="contribution-legend">
                {contributions.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => contributionDetail(s.name)}
                    className={activeContribution === s.name ? "active" : ""}
                  >
                    <i style={{ background: s.color }} />
                    <span>{s.name}</span>
                    <em>{((s.value / 24.8) * 100).toFixed(1)}%</em>
                  </button>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="降碳贡献企业排名" extra="单位：万tCO₂">
            <ContributionRanking />
            <p className="panel-note">
              TOP5 贡献占比　
              {(
                (contributionRankings.reduce((n, e) => n + e.reduction, 0) /
                  contributionTotal) *
                100
              ).toFixed(1)}
              %
            </p>
          </Panel>
          <Panel title="年度降碳成果">
            <div className="contribution-bars">
              {contributions.map((s) => (
                <button key={s.name} onClick={() => contributionDetail(s.name)}>
                  <span style={{ color: s.color }}>
                    <Leaf size={20} />
                  </span>
                  <span>{s.name}</span>
                  <Progress value={(s.value / 10) * 100} color={s.color} />
                  <b>
                    {s.value}
                    <small> 万tCO₂</small>
                  </b>
                </button>
              ))}
            </div>
          </Panel>
        </aside>
      </main>
      <section className="carbon-target panel">
        <div className="target-title">
          <ShieldCheck size={35} />
          <div>
            <b>碳排放目标达成</b>
            <small>单位能源碳排放（tCO₂/tce）</small>
          </div>
        </div>
        <button
          onClick={() =>
            showDetail(
              "当前碳排放强度",
              <>
                <div className="detail-kpis">
                  <div>
                    当前值
                    <strong>0.31 <small>tCO₂/tce</small></strong>
                  </div>
                  <div>
                    距 2028 目标
                    <strong>0.04 <small>待降低</small></strong>
                  </div>
                </div>
                <p>当前值较基准期持续下降，后续重点关注绿电替代和高耗能设备改造。</p>
              </>,
            )
          }
        >
          <Leaf size={30} />
          <span>
            当前值<strong>0.31</strong>
          </span>
        </button>
        <ArrowRight />
        <button
          onClick={() =>
            showDetail(
              "2028 年目标",
              <>
                <div className="detail-kpis">
                  <div>
                    目标强度
                    <strong>≤0.27 <small>tCO₂/tce</small></strong>
                  </div>
                  <div>
                    目标年份
                    <strong>2028 <small>年</small></strong>
                  </div>
                </div>
                <p>重点推进绿电替代、节能技改和能碳管理体系建设，形成阶段性验收能力。</p>
              </>,
            )
          }
        >
          <Target size={30} />
          <span>
            2028 目标值<strong>≤0.27</strong>
          </span>
        </button>
        <ArrowRight />
        <button
          onClick={() =>
            showDetail(
              "2030 年目标",
              <>
                <div className="detail-kpis">
                  <div>
                    目标强度
                    <strong>≤0.25 <small>tCO₂/tce</small></strong>
                  </div>
                  <div>
                    达成节点
                    <strong>2030 <small>年</small></strong>
                  </div>
                </div>
                <p>持续优化能源结构与产业结构，推动园区达到零碳建设目标。</p>
              </>,
            )
          }
        >
          <ShieldCheck size={30} />
          <span>
            2030 目标值<strong>≤0.25</strong>
          </span>
        </button>
        <div className="target-progress">
          <span>
            当前达成率 <b>68.5%</b>
          </span>
          <Progress value={68.5} color="#20dba8" />
        </div>
        <p>
          持续降低碳排放
          <br />
          实现零碳园区建设目标
        </p>
      </section>
    </>
  );
}
