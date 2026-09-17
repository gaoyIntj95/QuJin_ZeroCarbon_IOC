import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

type ChartProps = { option: echarts.EChartsOption; className?: string };
export default function Chart({ option, className = '' }: ChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); chart.dispose(); };
  }, [option]);
  return <div ref={ref} className={`echart ${className}`} />;
}
