import { useEffect, useState, type ReactNode } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { CloudSun, Hexagon } from "lucide-react";
import { Modal } from "./components/UI";
import Overview from "./pages/Overview";
import Energy from "./pages/Energy";
import Carbon from "./pages/Carbon";

const isOverviewSiteBuild = import.meta.env.BASE_URL === "/overview/";
const appRoutes = isOverviewSiteBuild
  ? { overview: "/", energy: "/energy-flow", carbon: "/carbon-trend" }
  : {
      overview: "/overview",
      energy: "/energy-flow",
      carbon: "/carbon-trend",
    };

function Header() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="screen-header">
      <div className="brand">
        <Hexagon size={37} strokeWidth={3} />
        <h1>曲靖国家级零碳园区能碳管理平台</h1>
      </div>
      <nav aria-label="大屏页面导航">
        <NavLink to={appRoutes.overview}>零碳园区总览</NavLink>
        <NavLink to={appRoutes.energy}>绿色能源态势</NavLink>
        <NavLink to={appRoutes.carbon}>碳排放与降碳态势</NavLink>
      </nav>
      <div className="clock">
        <strong>{time.toLocaleTimeString("zh-CN", { hour12: false })}</strong>
        <small>
          {time.toLocaleDateString("sv-SE")}　
          {time.toLocaleDateString("zh-CN", { weekday: "long" })}
        </small>
      </div>
      <div className="weather" title="天气为原型演示值">
        <CloudSun size={33} />
        <span>
          23°C<small>晴</small>
        </span>
      </div>
    </header>
  );
}

export default function App() {
  const [scale, setScale] = useState(() =>
    Math.min(window.innerWidth / 1672, window.innerHeight / 941),
  );
  const [detail, setDetail] = useState<{
    title: string;
    content: ReactNode;
  } | null>(null);
  const location = useLocation();
  useEffect(() => {
    const resize = () =>
      setScale(Math.min(window.innerWidth / 1672, window.innerHeight / 941));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    setDetail(null);
  }, [location.pathname]);
  const showDetail = (title: string, content: ReactNode) =>
    setDetail({ title, content });
  return (
    <div className="screen-stage">
      <div
        className="screen-canvas"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <Header />
        <div className="dashboard-content">
          <Routes>
            <Route
              path="/"
              element={
                isOverviewSiteBuild ? (
                  <Overview showDetail={showDetail} />
                ) : (
                  <Navigate to={appRoutes.overview} replace />
                )
              }
            />
            {!isOverviewSiteBuild && (
              <Route
                path={appRoutes.overview}
                element={<Overview showDetail={showDetail} />}
              />
            )}
            <Route
              path={appRoutes.energy}
              element={<Energy showDetail={showDetail} />}
            />
            <Route
              path={appRoutes.carbon}
              element={<Carbon showDetail={showDetail} />}
            />
            <Route path="*" element={<Navigate to={appRoutes.overview} replace />} />
          </Routes>
        </div>
      </div>
      {detail && (
        <Modal title={detail.title} close={() => setDetail(null)}>
          {detail.content}
        </Modal>
      )}
    </div>
  );
}
