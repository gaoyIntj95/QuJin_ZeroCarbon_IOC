import { useEffect, useRef, useState } from "react";
import * as C from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import type { EnergyMode } from "../data";
import { mockParkData } from "./mockData";
import type { Facility, ParkViewerData, ParkViewerMode } from "./types";
import { ViewerControls } from "./ViewerControls";
import { addEnergyFacilityLayer } from "./layers/EnergyFacilityLayer";
import { addEnergyFlowLayer } from "./layers/EnergyFlowLayer";
import { addEnterpriseLayer } from "./layers/EnterpriseLayer";
import { addCarbonHeatLayer } from "./layers/CarbonHeatLayer";
import { addBuildingLayer } from "./layers/BuildingLayer";
import { addRoadLayer } from "./layers/RoadLayer";
import { addWaterLayer } from "./layers/WaterLayer";
import { addMacroLayer, macroDistricts } from "./layers/MacroLayer";
import { coordinate, flowColor, severityColor } from "./sceneUtils";
import { color, line } from "./geometry";
type ViewMode = "macro" | "park";
const PARK_IMAGE_RECTANGLE = C.Rectangle.fromDegrees(
  103.7625,
  25.48203,
  103.8825,
  25.54297,
);
// The image is the detailed park layer. A wider copy of the same context image
// acts as a forest/water buffer so orbiting never reveals a black void.
const PARK_CONTEXT_RECTANGLE = C.Rectangle.fromDegrees(
  103.7325,
  25.4668,
  103.9125,
  25.5582,
);
const PARK_MAX_ZOOM_DISTANCE = 6200;
type Props = {
  mode: ParkViewerMode;
  energyMode?: EnergyMode;
  selected?: number | null;
  factor?: number;
  level?: string;
  data?: ParkViewerData;
  tilesUrl?: string;
  onSelect: (i: number) => void;
  onHover?: (i: number | null) => void;
  onFacility?: (name: string, info: string) => void;
};
export const sceneFilters = [
  ["all", "全部"],
  ["key", "重点企业"],
  ["green", "绿色工厂"],
  ["zero", "零碳工厂"],
  ["solar", "光伏"],
  ["wind", "风电"],
  ["storage", "储能"],
  ["substation", "变电站"],
  ["gas", "天然气"],
  ["heat", "供热"],
  ["greenLink", "直连"],
];
function home(v: C.Viewer, m: ViewMode, duration = 0.6) {
  v.camera.flyToBoundingSphere(
    new C.BoundingSphere(coordinate(53, m === "macro" ? 50 : 57), 1),
    {
      duration,
      offset: new C.HeadingPitchRange(
        C.Math.toRadians(m === "macro" ? 0 : 12),
        C.Math.toRadians(m === "macro" ? -88 : -58),
        m === "macro" ? 4400 : 4000,
      ),
    },
  );
}
const prop = (e: C.Entity, key: string) =>
  e.properties?.[key]?.getValue(C.JulianDate.now());
export function CesiumParkViewer({
  mode,
  energyMode = "all",
  selected,
  factor = 1,
  level = "all",
  data = mockParkData,
  tilesUrl,
  onSelect,
  onHover,
  onFacility,
}: Props) {
  const host = useRef<HTMLDivElement>(null),
    viewer = useRef<C.Viewer | null>(null);
  const [version, setVersion] = useState(0),
    [overviewView, setView] = useState<ViewMode>("macro"),
    [localSelected, setLocalSelected] = useState<number | null>(null);
  const [hoveredEnterprise, setHoveredEnterprise] = useState<number | null>(
    null,
  );
  const [enterpriseCardPosition, setEnterpriseCardPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const view = mode === "overview" ? overviewView : "park";
  const [facility, setFacility] = useState<Facility | null>(null),
    [district, setDistrict] = useState("nanhai"),
    [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null),
    [filter, setFilter] = useState("all");
  const [flows, setFlows] = useState(mode === "energy"),
    [error, setError] = useState("");
  const cardEnterpriseIndex =
    view === "park" && !facility
      ? (hoveredEnterprise ?? localSelected)
      : null;
  const active =
    mode === "overview" ? localSelected : (selected ?? localSelected);
  useEffect(() => {
    setFlows(mode === "energy");
  }, [mode]);
  const callbacks = useRef({ onSelect, onHover, onFacility });
  callbacks.current = { onSelect, onHover, onFacility };
  useEffect(() => {
    if (!host.current) return;
    const v = new C.Viewer(host.current, {
      animation: false,
      baseLayer: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      shouldAnimate: false,
    });
    viewer.current = v;
    v.scene.globe.baseColor = color("#183c3e");
    v.scene.globe.showGroundAtmosphere = false;
    const lightDirection = C.Matrix4.multiplyByPointAsVector(
      C.Transforms.eastNorthUpToFixedFrame(coordinate(50, 50)),
      new C.Cartesian3(0.45, 0.35, -0.82),
      new C.Cartesian3(),
    );
    v.scene.light = new C.DirectionalLight({
      direction: C.Cartesian3.normalize(lightDirection, lightDirection),
      intensity: 1.6,
    });
    v.shadowMap.size = 2048;
    v.shadowMap.softShadows = true;
    v.shadowMap.maximumDistance = 10000;
    v.scene.backgroundColor = color("#1c3e38");
    v.scene.skyBox = undefined;
    if (v.scene.sun) v.scene.sun.show = false;
    if (v.scene.moon) v.scene.moon.show = false;
    v.scene.fog.enabled = false;
    v.scene.screenSpaceCameraController.minimumZoomDistance = 250;
    v.scene.screenSpaceCameraController.maximumZoomDistance = 16000;
    const resize = new ResizeObserver(() => v.resize());
    resize.observe(host.current);
    setVersion((n) => n + 1);
    return () => {
      resize.disconnect();
      viewer.current = null;
      if (!v.isDestroyed()) v.destroy();
    };
  }, []);
  useEffect(() => {
    const v = viewer.current;
    if (!v || !version) return;
    let disposed = false;
    let imageryLayer: C.ImageryLayer | undefined;
    v.entities.removeAll();
    v.imageryLayers.removeAll();
    v.scene.globe.baseColor = color(view === "macro" ? "#061c2c" : "#315d4c");
    const useParkImageBoundary = view === "park" && !tilesUrl;
    v.scene.globe.cartographicLimitRectangle = useParkImageBoundary
      ? PARK_CONTEXT_RECTANGLE
      : C.Rectangle.MAX_VALUE;
    v.scene.screenSpaceCameraController.maximumZoomDistance = useParkImageBoundary
      ? PARK_MAX_ZOOM_DISTANCE
      : 16000;
    v.shadows = view === "park";
    if (view === "macro") addMacroLayer(v, data);
    else {
      addWaterLayer(v, data);
      addRoadLayer(v, data);
      addBuildingLayer(v, data);
      addEnterpriseLayer(v, data, null, mode, energyMode, factor, level);
      addEnergyFacilityLayer(v, data, mode !== "carbon");
      addEnergyFlowLayer(v, data, "all", null);
      if (mode === "carbon") addCarbonHeatLayer(v, data);
      if (!tilesUrl) {
        void Promise.all([
          C.SingleTileImageryProvider.fromUrl("/park-orthophoto-context.png", {
            rectangle: PARK_CONTEXT_RECTANGLE,
          }),
          C.SingleTileImageryProvider.fromUrl("/park-orthophoto-context.png", {
            // Keep the detailed image aligned with the source image while the
            // wider copy provides the natural forest/water perimeter.
            rectangle: PARK_IMAGE_RECTANGLE,
          }),
        ]).then(([contextProvider, detailProvider]) => {
          if (!disposed && !v.isDestroyed()) {
            v.imageryLayers.addImageryProvider(contextProvider);
            imageryLayer = v.imageryLayers.addImageryProvider(detailProvider);
          }
        });
      }
    }
    return () => {
      disposed = true;
      if (!v.isDestroyed()) {
        v.scene.globe.cartographicLimitRectangle = C.Rectangle.MAX_VALUE;
        v.scene.screenSpaceCameraController.maximumZoomDistance = 16000;
      }
      if (imageryLayer && !v.isDestroyed())
        v.imageryLayers.remove(imageryLayer);
    };
  }, [version, view, data, tilesUrl, mode, energyMode, factor, level]);
  useEffect(() => {
    if (viewer.current && version) home(viewer.current, view);
  }, [view, version]);
  useEffect(() => {
    const v = viewer.current;
    if (!v || !version || view !== "macro") return;
    for (const d of macroDistricts) {
      const face = v.entities.getById("district-" + d.id),
        border = v.entities.getById("district-border-" + d.id);
      if (face?.polygon)
        face.polygon.material = new C.ColorMaterialProperty(
          color(d.id === district ? "#196d7baa" : "#103e5577"),
        );
      if (border?.polyline)
        border.polyline.material = new C.ColorMaterialProperty(
          color(d.id === district ? "#80ffe0" : "#3293b999"),
        );
    }
  }, [view, district, version, data]);
  useEffect(() => {
    const v = viewer.current;
    if (!v || !version || !tilesUrl || view !== "park") return;
    let disposed = false;
    let tiles: C.Cesium3DTileset | undefined;
    setError("");
    C.Cesium3DTileset.fromUrl(tilesUrl)
      .then((t) => {
        if (disposed || v.isDestroyed()) {
          t.destroy();
          return;
        }
        tiles = t;
        v.scene.primitives.add(t);
      })
      .catch(() => {
        if (!disposed) setError("场景模型加载失败，请检查模型地址");
      });
    return () => {
      disposed = true;
      if (tiles && !v.isDestroyed()) v.scene.primitives.remove(tiles);
    };
  }, [version, tilesUrl, view]);
  useEffect(() => {
    const v = viewer.current;
    if (!v || !version || view !== "park") return;
    const selectedId =
      active == null ? null : data.enterprises[active]?.enterpriseId;
    const linked = new Set(
      data.energyFlows
        .filter((f) => f.targetId === selectedId || f.sourceId === selectedId)
        .flatMap((f) => [f.sourceId, f.targetId]),
    );
    const matches = (id: string) => {
      const e = data.enterprises.find((e) => e.enterpriseId === id);
      if (!e) return false;
      const severity =
        e.intensity >= 0.4 ? "high" : e.intensity >= 0.35 ? "medium" : "low";
      return (
        (mode !== "carbon" || level === "all" || level === severity) &&
        (filter === "all" ||
          (filter === "key" && e.isKeyEnterprise) ||
          (filter === "green" && e.isGreenFactory) ||
          (filter === "zero" && e.isZeroCarbonFactory))
      );
    };
    v.entities.removeById("selected-parcel");
    for (const e of v.entities.values) {
      const id = prop(e, "enterpriseId"),
        fid = prop(e, "facilityId"),
        flowId = prop(e, "flowId");
      if (id) {
        e.show = !!matches(id);
        if (e.point)
          e.point.color = new C.ConstantProperty(
            mode === "carbon"
              ? severityColor(
                  data.enterprises.find((x) => x.enterpriseId === id)!
                    .intensity,
                )
              : color(
                  id === selectedId
                    ? "#c0fff2"
                    : selectedId
                      ? "#509b9b"
                      : "#65e2de",
                ),
          );
        if (e.label) e.label.show = new C.ConstantProperty(true);
      } else if (fid) {
        const f = data.facilities.find((f) => f.facilityId === fid);
        e.show =
          filter === "all" ||
          f?.type === filter ||
          (!!selectedId && linked.has(fid));
        if (e.billboard)
          e.billboard.color = new C.ConstantProperty(
            C.Color.WHITE.withAlpha(selectedId && !linked.has(fid) ? 0.4 : 1),
          );
      } else if (flowId) {
        const f = data.energyFlows.find((f) => f.flowId === flowId)!;
        const showType =
          energyMode === "all" ||
          mode !== "energy" ||
          f.energyType === energyMode;
        e.show =
          flows &&
          showType &&
          (filter === "all" ||
            (!!selectedId && linked.has(f.sourceId)) ||
            data.facilities.find((x) => x.facilityId === f.sourceId)?.type ===
              filter);
        if (e.polyline)
          e.polyline.material = new C.PolylineGlowMaterialProperty({
            color: color(flowColor(f.energyType)).withAlpha(
              selectedId && !linked.has(f.sourceId) ? 0.12 : 0.9,
            ),
            glowPower: 0.18,
          });
      }
    }
    if (selectedId && matches(selectedId)) {
      const e = data.enterprises[active!],
        { x, y } = e.position;
      line(
        v,
        "selected-parcel",
        [
          [x - 10, y - 7],
          [x + 10, y - 7],
          [x + 10, y + 13],
          [x - 10, y + 13],
          [x - 10, y - 7],
        ],
        "#8affd8",
        4,
        6,
        true,
        { enterpriseId: selectedId, kind: "building" },
      );
    }
  }, [
    active,
    filter,
    flows,
    view,
    version,
    data,
    mode,
    energyMode,
    factor,
    level,
    tilesUrl,
  ]);
  useEffect(() => {
    const v = viewer.current;
    if (!v || !version || cardEnterpriseIndex == null) {
      if (cardEnterpriseIndex == null) setEnterpriseCardPosition(null);
      return;
    }
    const enterprise = data.enterprises[cardEnterpriseIndex];
    if (!enterprise) return;
    let lastLeft = -1;
    let lastTop = -1;
    const updateCardPosition = () => {
      const entity = v.entities.getById(enterprise.enterpriseId);
      const position = entity?.position?.getValue(C.JulianDate.now());
      if (!position) return;
      const screen = C.SceneTransforms.worldToWindowCoordinates(
        v.scene,
        position,
      );
      if (!screen) return;
      const canvas = v.scene.canvas;
      const left = Math.max(120, Math.min(canvas.clientWidth - 120, screen.x));
      const top = Math.max(130, Math.min(canvas.clientHeight - 20, screen.y));
      if (Math.abs(left - lastLeft) < 1 && Math.abs(top - lastTop) < 1) return;
      lastLeft = left;
      lastTop = top;
      setEnterpriseCardPosition({ left, top });
    };
    v.scene.postRender.addEventListener(updateCardPosition);
    updateCardPosition();
    return () => {
      v.scene.postRender.removeEventListener(updateCardPosition);
    };
  }, [version, view, cardEnterpriseIndex, data]);
  useEffect(() => {
    const v = viewer.current;
    if (!v || !version) return;
    const h = new C.ScreenSpaceEventHandler(v.scene.canvas);
    const picked = (p: C.Cartesian2) => {
      // ScreenSpaceEventHandler reports rendered pixels; the dashboard uses CSS scale.
      // Cesium picking expects the canvas's unscaled CSS coordinates.
      const canvas = v.scene.canvas;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const r = v.scene.pick(
        new C.Cartesian2(
          (p.x * canvas.clientWidth) / rect.width,
          (p.y * canvas.clientHeight) / rect.height,
        ),
      );
      return r?.id instanceof C.Entity ? (r.id as C.Entity) : null;
    };
    h.setInputAction((m: C.ScreenSpaceEventHandler.PositionedEvent) => {
      const e = picked(m.position);
      if (!e) return;
      const did = prop(e, "districtId");
      if (did) {
        setDistrict(did);
        if (did === "nanhai") setView("park");
        return;
      }
      const id = prop(e, "enterpriseId"),
        idx = data.enterprises.findIndex((x) => x.enterpriseId === id);
      if (idx >= 0) {
        setLocalSelected(idx);
        setHoveredEnterprise(idx);
        setFacility(null);
        callbacks.current.onSelect(idx);
        return;
      }
      const f = data.facilities.find(
        (f) => f.facilityId === prop(e, "facilityId"),
      );
      if (f) {
        setFacility(f);
      }
    }, C.ScreenSpaceEventType.LEFT_CLICK);
    h.setInputAction((m: C.ScreenSpaceEventHandler.MotionEvent) => {
      const e = picked(m.endPosition),
        did = e && prop(e, "districtId"),
        id = e && prop(e, "enterpriseId"),
        fid = e && prop(e, "facilityId");
      setHoveredDistrict(view === "macro" ? (did ?? null) : null);
      const idx = data.enterprises.findIndex((x) => x.enterpriseId === id);
      if (idx >= 0) {
        setHoveredEnterprise(idx);
      } else if (localSelected == null) {
        setHoveredEnterprise(null);
        setEnterpriseCardPosition(null);
      }
      callbacks.current.onHover?.(idx < 0 ? null : idx);
      for (const item of v.entities.values)
        if (
          item.label &&
          (prop(item, "kind") === "enterprise" ||
            prop(item, "kind") === "facility")
        ) {
          const kind = prop(item, "kind");
          const show =
            kind === "enterprise" ||
            mode !== "carbon" ||
            item.id === fid;
          item.label.show = new C.ConstantProperty(show);
        }
    }, C.ScreenSpaceEventType.MOUSE_MOVE);
    return () => {
      if (!h.isDestroyed()) h.destroy();
    };
  }, [version, data, mode, view, localSelected]);
  const changeView = (m: ViewMode) => {
    setView(m);
    setFacility(null);
    setFilter("all");
    setLocalSelected(null);
    setHoveredEnterprise(null);
    setEnterpriseCardPosition(null);
  };
  const d = macroDistricts.find((d) => d.id === district)!;
  const zoomOut = () => {
    const v = viewer.current;
    if (!v) return;
    if (view !== "park" || tilesUrl) {
      v.camera.zoomOut(350);
      return;
    }
    const range = C.Cartesian3.distance(v.camera.position, coordinate(53, 57));
    v.camera.zoomOut(Math.max(0, Math.min(350, PARK_MAX_ZOOM_DISTANCE - range)));
  };
  return (
    <section
      className={`park-scene park-3d-viewer scene-${view}`}
      aria-label="曲靖经开区零碳园区三维场景"
    >
      <div ref={host} className="cesium-viewer-host" />
      <ViewerControls
        title={
          view === "macro"
            ? "曲靖经开区 · 产业空间总览"
            : mode === "carbon"
              ? "南海子工业园区 · 企业碳排放"
              : "南海子工业园区 · 能源与企业"
        }
        modeLabel={view === "macro" ? "区域总览" : "园区鸟瞰"}
        cameraMode={view}
        showBackToMacro={mode === "overview" && view === "park"}
        selectedEnterprise={
          cardEnterpriseIndex != null
            ? data.enterprises[cardEnterpriseIndex]
            : null
        }
        enterpriseCardPosition={enterpriseCardPosition}
        dataMode={mode}
        energyFactor={factor}
        selectedFacility={facility}
        onZoomIn={() => viewer.current?.camera.zoomIn(350)}
        onZoomOut={zoomOut}
        onReset={() => {
          setLocalSelected(null);
          setHoveredEnterprise(null);
          setEnterpriseCardPosition(null);
          setFacility(null);
          if (viewer.current) home(viewer.current, view);
        }}
        onNorth={() => {
          if (viewer.current) home(viewer.current, view);
        }}
        onFullscreen={() =>
          void host.current?.parentElement?.requestFullscreen()
        }
        onBackToMacro={() => {
          setLocalSelected(null);
          setHoveredEnterprise(null);
          setEnterpriseCardPosition(null);
          setFacility(null);
          setFilter("all");
          setView("macro");
        }}
        onClearFacility={() => setFacility(null)}
      />
      <span className="scene-disclaimer">空间示意 · 非测绘数据</span>
      {error && <div className="scene-error">{error}</div>}
      {view === "macro" ? (
        hoveredDistrict === "nanhai" && (
          <aside className="district-card">
            <small>QUJING / 产业空间</small>
            <h3>{d.name}</h3>
            <p>{d.focus}</p>
            <span>悬停查看摘要 · 点击下钻</span>
            {district === "nanhai" && (
              <button onClick={() => changeView("park")}>进入园区视角 →</button>
            )}
          </aside>
        )
      ) : (
        <>
          {mode === "energy" && (
            <div className="scene-energy-legend" aria-label="能流类型图例">
              <span className="electric">电力</span>
              <span className="green">绿电</span>
              <span className="gas">天然气</span>
              <span className="heat">热力</span>
            </div>
          )}
          <div className="scene-filterbar" aria-label="企业与设施筛选">
            {sceneFilters.map(([id, name]) => (
              <button
                key={id}
                aria-pressed={filter === id}
                onClick={() => {
                  setFilter(id);
                  setLocalSelected(null);
                  setFacility(null);
                }}
              >
                {name}
              </button>
            ))}
            <button aria-pressed={flows} onClick={() => setFlows(!flows)}>
              能流 {flows ? "开" : "关"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
