"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AreaChartProps {
  data: { label: string; value: number }[];
  title?: string;
  className?: string;
  height?: number;
}

function AreaChart({ data, title, className, height = 200 }: AreaChartProps) {
  if (!data.length) return <div className={cn("flex items-center justify-center text-muted-foreground", className)}>No data</div>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const width = 600;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = height - padding - (d.value / maxVal) * chartHeight;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#2563EB" />
            <text x={p.x} y={height - 10} textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  className?: string;
}

function PieChart({ data, title, className }: PieChartProps) {
  if (!data.length) return <div className={cn("flex items-center justify-center text-muted-foreground", className)}>No data</div>;

  const total = data.reduce((s, d) => s + d.value, 0);
  const colors = ["#2563EB", "#059669", "#D97706", "#DC2626", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6"];

  let cumulative = 0;
  const slices = data.map((d, i) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 360;
    const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
    const color = d.color || colors[i % colors.length];
    return { ...d, startAngle, endAngle, midAngle, color, percentage: ((d.value / total) * 100).toFixed(1) };
  });

  const radius = 80;
  const cx = 100;
  const cy = 100;

  const pathData = slices.map((s) => {
    const x1 = cx + radius * Math.cos(s.startAngle * Math.PI / 180);
    const y1 = cy + radius * Math.sin(s.startAngle * Math.PI / 180);
    const x2 = cx + radius * Math.cos(s.endAngle * Math.PI / 180);
    const y2 = cy + radius * Math.sin(s.endAngle * Math.PI / 180);
    const largeArc = s.endAngle - s.startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }).join(" ");

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <svg viewBox="0 0 200 200" className="w-full h-auto max-w-[200px] mx-auto">
        <path d={pathData} stroke="#F8FAFC" strokeWidth="1" />
        {slices.map((s, i) => (
          <text
            key={i}
            x={cx + (radius * 0.6) * Math.cos(s.midAngle)}
            y={cy + (radius * 0.6) * Math.sin(s.midAngle)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="white"
            fontWeight="600"
          >
            {s.percentage}%
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface BarChartProps {
  data: { label: string; value: number }[];
  title?: string;
  className?: string;
  height?: number;
}

function BarChart({ data, title, className, height = 200 }: BarChartProps) {
  if (!data.length) return <div className={cn("flex items-center justify-center text-muted-foreground", className)}>No data</div>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 40;
  const gap = 16;
  const totalWidth = data.length * (barWidth + gap);
  const padding = 40;
  const chartHeight = height - padding;

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-medium mb-2">{title}</h4>}
      <svg viewBox={`0 0 ${totalWidth + padding * 2} ${height}`} className="w-full h-auto">
        {data.map((d, i) => {
          const x = padding + i * (barWidth + gap);
          const barHeight = (d.value / maxVal) * chartHeight;
          const y = height - padding - barHeight;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#2563EB" rx="2" />
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748B">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export { AreaChart, PieChart, BarChart };
