'use client';

import { useEffect, useState, useMemo } from 'react';
import type { ShortLink } from './types';
import AnimatedNumber from './AnimatedNumber';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface StatsHeroProps {
  slug: string;
  links: ShortLink[];
}

interface DayPoint {
  date: string;
  count: number;
}

// Smooth path through points using cardinal-spline-ish bezier
function buildSparklinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d.push(`Q ${cx} ${prev.y}, ${cx} ${(prev.y + curr.y) / 2}`);
    d.push(`T ${curr.x} ${curr.y}`);
  }
  return d.join(' ');
}

function Sparkline({ data, width = 260, height = 60 }: { data: DayPoint[]; width?: number; height?: number }) {
  const { linePath, areaPath, lastX, lastY } = useMemo(() => {
    if (data.length === 0) return { linePath: '', areaPath: '', lastX: 0, lastY: 0 };
    const max = Math.max(...data.map(d => d.count), 1);
    const stepX = width / Math.max(1, data.length - 1);
    const pad = 6;
    const pts = data.map((d, i) => ({
      x: i * stepX,
      y: pad + (height - 2 * pad) * (1 - d.count / max),
    }));
    const line = buildSparklinePath(pts);
    const area = `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
    return { linePath: line, areaPath: area, lastX: pts[pts.length - 1].x, lastY: pts[pts.length - 1].y };
  }, [data, width, height]);

  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="h-[60px] flex items-center justify-center text-[10px] text-white/40 italic">
        Chưa có click trong 7 ngày qua
      </div>
    );
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
      <defs>
        <linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(255 255 255)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="rgb(255 255 255)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkArea)" />
      <path d={linePath} fill="none" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={3.5} fill="white" />
      <circle cx={lastX} cy={lastY} r={6} fill="white" opacity={0.25} />
    </svg>
  );
}

export default function StatsHero({ slug, links }: StatsHeroProps) {
  const [series, setSeries] = useState<DayPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/api/analytics/${slug}?period=7d`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled || !json?.data?.byDay) return;
        setSeries(json.data.byDay);
      })
      .catch(() => { /* silent */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks ?? 0), 0);
  const activeCount = links.filter(l => l.isActiveOnBio).length;
  const featuredCount = links.filter(l => l.isFeatured).length;
  const week = series.reduce((s, d) => s + d.count, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl aurora-glow text-white shadow-2xl">
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 p-6">
        {/* Left: metrics */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Tổng quan
            </span>
            <span className="text-[11px] text-white/60">7 ngày qua</span>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Tổng lượt click</p>
            <div className="flex items-baseline gap-3 mt-1">
              <AnimatedNumber value={totalClicks} className="text-5xl font-black tracking-tight tabular-nums" />
              {week > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-[10px] font-semibold text-emerald-200">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3l7 9H3l7-9z"/></svg>
                  +<AnimatedNumber value={week} /> tuần này
                </span>
              )}
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <MiniStat label="Sản phẩm" value={links.length} />
            <MiniStat label="Đang hiển thị" value={activeCount} />
            <MiniStat label="Nổi bật" value={featuredCount} />
          </div>
        </div>

        {/* Right: sparkline */}
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Xu hướng click</p>
            <span className="text-[10px] text-white/60 tabular-nums">{series.length} điểm</span>
          </div>
          <div className="mt-3 -mx-2">
            {loading ? (
              <div className="h-[60px] flex items-center justify-center">
                <svg className="w-4 h-4 animate-spin text-white/60" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              <Sparkline data={series} />
            )}
          </div>
          <div className="flex items-center justify-between text-[9px] text-white/50 mt-1 tabular-nums">
            <span>{series[0]?.date.slice(5) || ''}</span>
            <span>{series[series.length - 1]?.date.slice(5) || ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/8 border border-white/10 px-3 py-2 backdrop-blur-sm">
      <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold truncate">{label}</p>
      <AnimatedNumber value={value} className="text-xl font-bold tabular-nums leading-tight block" />
    </div>
  );
}
