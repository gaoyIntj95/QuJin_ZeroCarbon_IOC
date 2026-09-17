import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, X, type LucideIcon } from "lucide-react";

export type ShowDetail = (title: string, content: ReactNode) => void;
export function CompactSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.value === value) ?? options[0];
  const rect = open ? rootRef.current?.getBoundingClientRect() : undefined;

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`compact-select ${open ? "open" : ""} ${className}`}
    >
      <button
        type="button"
        className="compact-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span>{current?.label}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      {open && rect
        ? createPortal(
            <div
              ref={menuRef}
              className="compact-select-menu"
              role="listbox"
              aria-label={ariaLabel}
              style={{
                left: rect.left,
                top: rect.bottom + 3,
                minWidth: rect.width,
              }}
            >
              {options.map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={option.value === value ? "selected" : ""}
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
export function Panel({
  title,
  extra,
  children,
  className = "",
}: {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <h2>{title}</h2>
        {extra && <span>{extra}</span>}
      </div>
      {children}
    </section>
  );
}
export function Metric({
  icon: Icon,
  label,
  value,
  unit,
  note,
  color = "#6cd1ff",
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  note?: ReactNode;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="metric"
      onClick={onClick}
      style={{ "--accent": color } as CSSProperties}
    >
      <span className="metric-icon">
        <Icon size={39} strokeWidth={1.7} />
      </span>
      <span className="metric-copy">
        <span className="metric-label">{label}</span>
        <span className="metric-value">
          {value}
          <small>{unit}</small>
        </span>
        <span className="metric-note">{note}</span>
      </span>
    </button>
  );
}
export function Progress({
  value,
  color = "#3fb56a",
}: {
  value: number;
  color?: string;
}) {
  return (
    <span
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i
        style={{
          width: `${Math.max(0, Math.min(value, 100))}%`,
          background: color,
        }}
      />
    </span>
  );
}
export function More({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="more" onClick={onClick}>
      {children}
      <ChevronRight size={14} />
    </button>
  );
}
export function DetailTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <table className="detail-table">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((v, j) => (
              <td key={j}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const domain = title.includes("碳")
    ? "碳排放与降碳"
    : title.includes("能源") || title.includes("能耗") || title.includes("用电")
      ? "能源运行"
      : title.includes("工厂") || title.includes("项目") || title.includes("任务")
        ? "绿色制造建设"
        : "园区综合运行";
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className="detail-modal"
      aria-labelledby="detail-modal-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <h2 id="detail-modal-title">{title}</h2>
          <button onClick={close} aria-label="关闭详情">
            <X size={22} />
          </button>
        </div>
        <div className="modal-content">{children}</div>
        <div className="modal-meta">
          <span>业务域：{domain}</span>
          <span>统计范围：南海子工业园区</span>
          <span>更新时间：2026-06-26 10:00</span>
        </div>
        <p className="data-note">演示数据 · 实际结果以接入业务系统后为准</p>
      </div>
    </dialog>,
    document.body,
  );
}
