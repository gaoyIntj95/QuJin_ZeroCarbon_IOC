import { useState } from "react";
import {
  ArrowDown,
  BatteryCharging,
  Boxes,
  Factory,
  FileCheck2,
  Leaf,
  Network,
  Recycle,
  Scan,
  ShieldCheck,
  Sprout,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Donut } from "../components/Charts";
import {
  DetailTable,
  Metric,
  More,
  CompactSelect,
  Panel,
  Progress,
  type ShowDetail,
} from "../components/UI";
import { ParkScene } from "../components/ParkScene";
import { milestones, projects, tasks } from "../data";

export default function Overview({ showDetail }: { showDetail: ShowDetail }) {
  const [year, setYear] = useState(2028);
  const [status, setStatus] = useState("全部");
  const indicators = [
    ["核心指标", "3 / 3", 100],
    ["引导指标", "4 / 5", 80],
    ["云南特色指标", "3 / 3", 100],
    ["专项建设要求", "0 / 1", 0],
  ] as const;
  const indicatorDetail = () =>
    showDetail(
      "零碳评价要求进展",
      <>
        <p>
          评价要求共 12 项，当前达标率
          75%。分组统计沿用原型展示口径，待接入正式评价清单后核对。
        </p>
        <DetailTable
          headers={["指标类别", "达标 / 总数", "完成进度"]}
          rows={indicators.map((r) => [r[0], r[1], `${r[2]}%`])}
        />
      </>,
    );
  const taskDetail = () =>
    showDetail(
      "重点任务进展",
      <DetailTable
        headers={["建设任务", "总体完成度", "阶段"]}
        rows={tasks.map(([n, v]) => [
          n,
          `${v}%`,
          v >= 70 ? "稳步推进" : "重点推进",
        ])}
      />,
    );
  const projectDetail = (row?: string[]) =>
    showDetail(
      row ? row[0] : "重点项目清单",
      <>
        <p>
          当前展示 {row ? "项目详情" : "6 个重点项目"}，计划投运时间为演示数据。
        </p>
        <DetailTable
          headers={["项目名称", "类别", "状态", "计划投运", "完成进度"]}
          rows={row ? [row] : projects}
        />
      </>,
    );
  const results = [
    {
      name: "绿色能源",
      icon: Zap,
      items: [
        ["装机容量", "762", "MW"],
        ["绿电消费量", "16.62", "亿kWh"],
        ["储能容量", "120", "MWh"],
      ],
    },
    {
      name: "绿色制造",
      icon: Factory,
      items: [
        ["绿色工厂", "18", "家"],
        ["零碳工厂", "5", "家"],
        ["节能改造企业", "12", "家"],
      ],
    },
    {
      name: "绿色产品",
      icon: FileCheck2,
      items: [
        ["碳足迹产品", "36", "个"],
        ["获证产品", "28", "个"],
        ["绿色认证", "22", "项"],
      ],
    },
    {
      name: "资源循环",
      icon: Recycle,
      items: [
        ["再生水利用率", "72", "%"],
        ["固废综合利用率", "78", "%"],
        ["资源循环项目", "16", "个"],
      ],
    },
  ];
  return (
    <>
      <div className="metrics overview-metrics">
        <Metric
          icon={Scan}
          label="园区建设范围"
          value="26.44"
          unit="km²"
          note="申报创建范围"
          onClick={() =>
            showDetail(
              "园区建设范围",
              <>
                <p>曲靖经济技术开发区南海子工业园区</p>
                <div className="detail-kpis">
                  <div>
                    建设范围
                    <strong>
                      26.44 <small>km²</small>
                    </strong>
                  </div>
                  <div>
                    重点企业
                    <strong>
                      30 <small>家</small>
                    </strong>
                  </div>
                </div>
              </>,
            )
          }
        />
        <Metric
          icon={Users}
          label="重点企业数量"
          value="30"
          unit="家"
          note="10家存量　20家增量"
            onClick={() =>
            showDetail(
              "重点企业建设情况",
              <>
                <div className="detail-kpis">
                  <div>
                    重点企业总数
                    <strong>30 <small>家</small></strong>
                  </div>
                  <div>
                    本期新增
                    <strong>20 <small>家</small></strong>
                  </div>
                </div>
                <p>重点企业按存量与增量项目纳入园区能碳管理范围。</p>
                <DetailTable
                  headers={["企业类型", "企业数量", "纳管状态"]}
                  rows={[
                    ["存量重点企业", "10 家", "持续监测"],
                    ["增量重点企业", "20 家", "建设接入"],
                  ]}
                />
              </>,
            )
          }
        />
        <Metric
          icon={Target}
          label="零碳评价要求达标率"
          value="75%"
          color="#51e5d4"
          note={
            <>
              <em>9/12</em> 项达标
            </>
          }
          onClick={indicatorDetail}
        />
        <Metric
          icon={Leaf}
          label="绿色电力消费占比"
          value="68%"
          color="#6cde85"
          note={
            <>
              绿电消费 <em>16.62</em> 亿kWh
            </>
          }
          onClick={() =>
            showDetail(
              "绿色电力消费",
              <>
                <div className="detail-kpis">
                  <div>
                    绿电消费占比
                    <strong>68<small>%</small></strong>
                  </div>
                  <div>
                    本期绿电消费
                    <strong>16.62 <small>亿kWh</small></strong>
                  </div>
                </div>
                <p>绿电消费由绿电交易、分布式光伏和绿电直连项目共同支撑。</p>
                <DetailTable
                  headers={["指标", "数值", "同比变化"]}
                  rows={[
                    ["绿色电力消费占比", "68%", "提升 9.4 个百分点"],
                    ["绿电消费量", "16.62 亿kWh", "同比提升"],
                  ]}
                />
              </>,
            )
          }
        />
        <Metric
          icon={Boxes}
          label="单位能源碳排放"
          value="0.31"
          unit="tCO₂/tce"
          note={
            <>
              同比下降{" "}
              <em>
                8.7% <ArrowDown size={11} />
              </em>
            </>
          }
          onClick={() =>
            showDetail(
              "单位能源碳排放",
              <>
                <div className="detail-kpis">
                  <div>
                    当前值
                    <strong>0.31 <small>tCO₂/tce</small></strong>
                  </div>
                  <div>
                    同比变化
                    <strong>−8.7<small>%</small></strong>
                  </div>
                </div>
                <p>当前单位能源碳排放持续下降，目标值按园区零碳建设路线分阶段校核。</p>
                <DetailTable
                  headers={["节点", "目标强度", "推进重点"]}
                  rows={[
                    ["2028 年", "≤0.27 tCO₂/tce", "绿电替代与节能技改"],
                    ["2030 年", "≤0.25 tCO₂/tce", "形成零碳园区能力"],
                  ]}
                />
              </>,
            )
          }
        />
      </div>
      <main className="overview-grid">
        <aside className="overview-left">
          <Panel title="零碳评价要求进展" extra="评价要求总数　12 项">
            <div className="evaluation">
              <Donut
                data={[
                  { name: "已达标", value: 75, color: "#12caa5" },
                  { name: "待提升", value: 24.5, color: "#ffb520" },
                  { name: "暂不可判断", value: 0.5, color: "#768a9d" },
                ]}
                value="75%"
                label="达标率"
                onSelect={indicatorDetail}
              />
              <div className="evaluation-legend">
                {[
                  ["已达标", "9", "#1dd6a8"],
                  ["待提升", "3", "#ffb520"],
                  ["暂不可判断", "1", "#8395a7"],
                ].map(([name, n, color]) => (
                  <button key={name} onClick={indicatorDetail}>
                    <i style={{ background: color }} />
                    {name}
                    <strong style={{ color }}>
                      {n}
                      <small>项</small>
                    </strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="indicator-list">
              {indicators.map(([n, text, v], i) => (
                <button key={n} onClick={indicatorDetail}>
                  <span>{n}</span>
                  <Progress value={v} color={i === 1 ? "#f2a51c" : "#39ab63"} />
                  <b>
                    {text}
                    <small> 项</small>
                  </b>
                </button>
              ))}
            </div>
            <More onClick={indicatorDetail}>查看全部指标详情</More>
          </Panel>
          <Panel title="重点任务进展" extra="总体完成度">
            <div className="task-list">
              {tasks.map(([n, v], i) => {
                const Icon = [Sprout, Factory, ShieldCheck, Recycle, Network][
                  i
                ];
                return (
                  <button key={n} onClick={taskDetail}>
                    <span className={`task-icon t${i}`}>
                      <Icon size={17} />
                    </span>
                    <span>{n}</span>
                    <Progress
                      value={v}
                      color={v < 65 ? "#cc892d" : "#3fa961"}
                    />
                    <b>{v}%</b>
                  </button>
                );
              })}
            </div>
            <More onClick={taskDetail}>查看任务详情</More>
          </Panel>
        </aside>
        <ParkScene
          kind="overview"
          onSelect={() => {}}
          onFacility={(name, info) =>
            showDetail(
              name,
              <>
                <div className="detail-kpis">
                  <div>
                    当前状态
                    <strong>运行中</strong>
                  </div>
                  <div>
                    监测对象
                    <strong>{info}</strong>
                  </div>
                </div>
                <DetailTable
                  headers={["信息项", "Mock 信息"]}
                  rows={[
                    ["所属园区", "曲靖经开区南海子工业园区"],
                    ["设施类型", name.includes("工厂") ? "绿色制造" : name.includes("股份") || name.includes("锂能") || name.includes("太阳能") ? "重点企业" : "能源基础设施"],
                    ["接入状态", "已接入能碳管理平台"],
                  ]}
                />
              </>,
            )
          }
        />
        <aside className="overview-right">
          <Panel title="零碳建设成果" className="results-panel">
            {results.map(({ name, icon: Icon, items }) => (
              <div className="result-group" key={name}>
                <h3>{name}</h3>
                <div>
                  {items.map(([label, value, unit], i) => (
                    <button
                      key={label}
                      onClick={() =>
                        showDetail(
                          label,
                          <>
                            <div className="detail-kpis">
                              <div>
                                {label}
                                <strong>
                                  {value} <small>{unit}</small>
                                </strong>
                              </div>
                              <div>
                                数据状态
                                <strong>正常</strong>
                              </div>
                            </div>
                            <p>{label}为园区绿色发展成果的阶段性演示指标，数据将随业务系统接入持续更新。</p>
                            <DetailTable
                              headers={["统计维度", "Mock 口径"]}
                              rows={[
                                ["统计周期", "2026 年度累计"],
                                ["数据来源", "企业报送 / 平台汇总"],
                              ]}
                            />
                          </>,
                        )
                      }
                    >
                      {i === 2 ? (
                        <BatteryCharging size={27} />
                      ) : i === 1 ? (
                        <Leaf size={27} />
                      ) : (
                        <Icon size={27} />
                      )}
                      <span>
                        <small>{label}</small>
                        <strong>
                          {value}
                          <em>{unit}</em>
                        </strong>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Panel>
          <Panel
            title="重点项目进展"
            extra={
              <CompactSelect
                ariaLabel="项目状态筛选"
                value={status}
                options={["全部", "建设中", "已投运", "进行中"].map((value) => ({
                  value,
                  label: value,
                }))}
                onChange={setStatus}
              />
            }
          >
            <table className="project-table">
              <thead>
                <tr>
                  <th>项目名称</th>
                  <th>类别</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {projects
                  .filter((p) => status === "全部" || p[2] === status)
                  .map((p) => (
                    <tr key={p[0]}>
                      <td>
                        <button onClick={() => projectDetail(p)}>{p[0]}</button>
                      </td>
                      <td>{p[1]}</td>
                      <td className={p[2] === "已投运" ? "green" : "amber"}>
                        {p[2]}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <More onClick={() => projectDetail()}>查看全部项目</More>
          </Panel>
        </aside>
      </main>
      <section className="roadmap panel">
        <div className="panel-heading">
          <h2>
            零碳园区建设路径 <small>（2026-2030）</small>
          </h2>
          <span>点击年份查看阶段目标</span>
        </div>
        <div className="milestones">
          {milestones.map((m) => (
            <button
              key={m.year}
              onClick={() => setYear(m.year)}
              className={year === m.year ? "active" : ""}
              aria-pressed={year === m.year}
            >
              <i />
              <span>
                <b>{m.year}</b>（{m.name}）
              </span>
              <small>
                {m.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
