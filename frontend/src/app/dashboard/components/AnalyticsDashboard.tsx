'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PIE_COLORS = ['#6d28d9', '#db2777', '#0891b2', '#059669', '#d97706'];

type Period = '7d' | '30d' | '90d';

interface AnalyticsData {
  total: number;
  totalEstRevenue: number;
  byDay: { date: string; count: number }[];
  byDevice: { name: string; value: number }[];
  byReferrer: { name: string; value: number }[];
  byLink: { name: string; value: number; estimatedRevenue: number | null }[];
}

export default function AnalyticsDashboard({ slug }: { slug: string }) {
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async (p: Period) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/analytics/${slug}?period=${p}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data);
    } catch {
      setError('Không tải được dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchAnalytics(period); }, [period, fetchAnalytics]);

  const PERIOD_LABELS: Record<Period, string> = { '7d': '7 ngày', '30d': '30 ngày', '90d': '90 ngày' };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-20 text-zinc-600">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm">Đang tải thống kê...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-500">{error}</p>
        <button onClick={() => fetchAnalytics(period)} className="text-xs text-violet-400 hover:text-violet-300 underline mt-2">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Period tabs + total */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                period === p ? 'bg-violet-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
          <span className="text-sm font-bold text-white">{data?.total ?? 0}</span>
          <span className="text-xs text-zinc-500">lượt click</span>
        </div>
        {(data?.totalEstRevenue ?? 0) > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold text-emerald-300">
              ~{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data?.totalEstRevenue ?? 0)}
            </span>
            <span className="text-xs text-emerald-600">ước tính</span>
          </div>
        )}
      </div>

      {/* Line chart — clicks over time */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Xu hướng lượt click</h3>
        {(!data?.byDay || data.byDay.every(d => d.count === 0)) ? (
          <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">Chưa có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.byDay} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#71717a' }}
                tickFormatter={v => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(v) => [`${Number(v)} click`, 'Lượt click']}
              />
              <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two charts side by side: Device + Referrer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Device pie */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Thiết bị</h3>
          {(!data?.byDevice?.length) ? (
            <div className="flex items-center justify-center h-24 text-zinc-600 text-sm">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={data.byDevice} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {data.byDevice.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [`${Number(v)} click`, '']}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Referrer pie */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Nguồn truy cập</h3>
          {(!data?.byReferrer?.length) ? (
            <div className="flex items-center justify-center h-24 text-zinc-600 text-sm">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={data.byReferrer} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {data.byReferrer.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [`${Number(v)} click`, '']}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products bar chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Sản phẩm được click nhiều nhất</h3>
        {(!data?.byLink?.length) ? (
          <div className="flex items-center justify-center h-24 text-zinc-600 text-sm">Chưa có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, data.byLink.length * 36)}>
            <BarChart data={data.byLink} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 10, fill: '#71717a' }}
                tickFormatter={v => v.length > 16 ? v.slice(0, 16) + '…' : v}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                formatter={(v, _n, entry) => {
                  const rev = (entry?.payload as { estimatedRevenue?: number })?.estimatedRevenue;
                  const label = rev
                    ? `${Number(v)} click · ~${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rev)}`
                    : `${Number(v)} click`;
                  return [label, ''];
                }}
              />
              <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
