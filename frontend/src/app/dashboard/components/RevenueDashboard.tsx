'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import type { UserProfile, RevenueEntry, ProductProfitability } from './types';
import { toast } from './Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const fmtVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const PLATFORMS = ['Shopee', 'Lazada', 'TikTok Shop', 'Tất cả'];

// ── Month helpers
function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(m: string) {
  const [y, mo] = m.split('-');
  return `T${parseInt(mo)}/${y}`;
}

interface RevenueDashboardProps {
  userId: string;
  profile: UserProfile;
  onProfileUpdate: (p: UserProfile) => void;
}

export default function RevenueDashboard({ userId, profile, onProfileUpdate }: RevenueDashboardProps) {
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [products, setProducts] = useState<ProductProfitability[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Settings form state
  const [settings, setSettings] = useState({
    defaultConversionRate: String(profile.defaultConversionRate ?? 2),
    defaultCommissionRate: String(profile.defaultCommissionRate ?? 5),
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // New entry form
  const [entryForm, setEntryForm] = useState({
    id: '',
    month: thisMonth(),
    platform: 'Shopee',
    actualAmount: '',
    notes: '',
  });
  const [savingEntry, setSavingEntry] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoadingEntries(true);
    try {
      const res = await fetch(`${API_URL}/api/revenue/entries/${userId}`);
      const json = await res.json();
      setEntries(json.data ?? []);
    } finally { setLoadingEntries(false); }
  }, [userId]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_URL}/api/revenue/profitability/${userId}`);
      const json = await res.json();
      setProducts(json.data ?? []);
    } finally { setLoadingProducts(false); }
  }, [userId]);

  useEffect(() => {
    fetchEntries();
    fetchProducts();
  }, [fetchEntries, fetchProducts]);

  // ── Summary numbers
  const totalEstRevenue = products.reduce((s, p) => s + (p.estimatedRevenue ?? 0), 0);
  const totalActual = entries.reduce((s, e) => s + e.actualAmount, 0);
  const currentMonthActual = entries.filter(e => e.month === thisMonth()).reduce((s, e) => s + e.actualAmount, 0);
  const currentMonthEst = (() => {
    // Sum estimated for current period (rough: use all-time / 12)
    return Math.round(totalEstRevenue / 12);
  })();

  // ── Chart data: last 6 months with actual + estimated
  const chartData = (() => {
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months.map(m => {
      const actual = entries.filter(e => e.month === m).reduce((s, e) => s + e.actualAmount, 0);
      return { month: monthLabel(m), actual: actual || null, estimated: currentMonthEst };
    });
  })();

  // ── Save settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultConversionRate: parseFloat(settings.defaultConversionRate) || null,
          defaultCommissionRate: parseFloat(settings.defaultCommissionRate) || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onProfileUpdate(json.data);
      toast.success('Đã lưu cài đặt mặc định.');
      fetchProducts();
    } catch { toast.error('Lưu thất bại.'); }
    finally { setSavingSettings(false); }
  };

  // ── Save revenue entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.actualAmount || !entryForm.month || !entryForm.platform) return;
    setSavingEntry(true);
    try {
      const res = await fetch(`${API_URL}/api/revenue/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...entryForm }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(entryForm.id ? 'Đã cập nhật.' : 'Đã thêm doanh thu.');
      setEntryForm({ id: '', month: thisMonth(), platform: 'Shopee', actualAmount: '', notes: '' });
      fetchEntries();
    } catch { toast.error('Lưu thất bại.'); }
    finally { setSavingEntry(false); }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Xoá bản ghi này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/revenue/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success('Đã xoá.');
      fetchEntries();
    } catch { toast.error('Xoá thất bại.'); }
  };

  const inputClass = "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-all w-full";

  return (
    <div className="flex flex-col gap-6 pb-12">

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Ước tính (tháng này)', value: fmtVND(currentMonthEst), color: 'violet', icon: '📊' },
          { label: 'Thực tế (tháng này)', value: fmtVND(currentMonthActual), color: 'emerald', icon: '💰' },
          { label: 'Tổng thực tế', value: fmtVND(totalActual), color: 'sky', icon: '🏆' },
          { label: 'Hiệu suất', value: totalEstRevenue > 0 ? `${Math.round(totalActual / totalEstRevenue * 100)}%` : '—', color: 'amber', icon: '🎯' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`p-4 rounded-xl border bg-zinc-900 border-zinc-800 flex items-center gap-3`}>
            <span className="text-2xl">{icon}</span>
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 truncate">{label}</p>
              <p className="text-base font-bold text-white mt-0.5 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODULE 1: ESTIMATION SETTINGS ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <span className="text-base">⚙️</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Module 1 — Cài đặt ước tính</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Tỷ lệ mặc định áp dụng cho tất cả sản phẩm chưa có tỷ lệ riêng</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
                Tỷ lệ chuyển đổi mặc định (%)
              </label>
              <input type="number" min="0" max="100" step="0.1" value={settings.defaultConversionRate}
                onChange={e => setSettings(s => ({ ...s, defaultConversionRate: e.target.value }))}
                className={inputClass} placeholder="2.0" />
              <p className="text-[10px] text-zinc-600 mt-1">% click thực sự mua hàng. Shopee thường 1–3%.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
                Tỷ lệ hoa hồng mặc định (%)
              </label>
              <input type="number" min="0" max="100" step="0.1" value={settings.defaultCommissionRate}
                onChange={e => setSettings(s => ({ ...s, defaultCommissionRate: e.target.value }))}
                className={inputClass} placeholder="5.0" />
              <p className="text-[10px] text-zinc-600 mt-1">% hoa hồng trên giá bán. Shopee 3–8%, Lazada 5–10%.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/8 border border-violet-500/20 text-xs text-violet-300">
            <span className="text-base">💡</span>
            <p>Công thức: <strong>Doanh thu ước tính = Click × Tỷ lệ chuyển đổi × Giá × Hoa hồng</strong></p>
          </div>
          <button onClick={handleSaveSettings} disabled={savingSettings}
            className="w-fit px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer">
            {savingSettings ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>

      {/* ── MODULE 2: MANUAL INCOME TRACKER ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <span className="text-base">📝</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Module 2 — Nhập doanh thu thực tế</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Nhập số liệu từ báo cáo hoa hồng của Shopee/Lazada hàng tháng</p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-5">
          {/* Chart */}
          {!loadingEntries && entries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">6 tháng gần nhất</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 11 }}
                    formatter={(v) => [fmtVND(Number(v)), '']}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
                  <Bar dataKey="actual" name="Thực tế" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="estimated" name="Ước tính" fill="#7c3aed" opacity={0.5} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Add/Edit form */}
          <form onSubmit={handleSaveEntry} className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              {entryForm.id ? 'Sửa bản ghi' : 'Thêm doanh thu mới'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Tháng</label>
                <input type="month" value={entryForm.month} onChange={e => setEntryForm(f => ({ ...f, month: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Nền tảng</label>
                <select value={entryForm.platform} onChange={e => setEntryForm(f => ({ ...f, platform: e.target.value }))} className={inputClass}>
                  {PLATFORMS.slice(0, 3).map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Số tiền thực tế (VND)</label>
                <input type="number" min="0" value={entryForm.actualAmount} onChange={e => setEntryForm(f => ({ ...f, actualAmount: e.target.value }))} placeholder="1500000" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Ghi chú</label>
                <input type="text" value={entryForm.notes} onChange={e => setEntryForm(f => ({ ...f, notes: e.target.value }))} placeholder="Đợt flash sale..." className={inputClass} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={savingEntry || !entryForm.actualAmount}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer">
                {savingEntry ? 'Đang lưu...' : entryForm.id ? 'Cập nhật' : 'Thêm bản ghi'}
              </button>
              {entryForm.id && (
                <button type="button" onClick={() => setEntryForm({ id: '', month: thisMonth(), platform: 'Shopee', actualAmount: '', notes: '' })}
                  className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white text-xs font-medium transition-all cursor-pointer">
                  Huỷ
                </button>
              )}
            </div>
          </form>

          {/* History table */}
          {loadingEntries ? (
            <p className="text-xs text-zinc-600">Đang tải...</p>
          ) : entries.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">Chưa có bản ghi nào. Nhập doanh thu hàng tháng từ báo cáo Shopee/Lazada.</p>
          ) : (
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">Tháng</th>
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">Nền tảng</th>
                    <th className="text-right px-3 py-2 text-zinc-500 font-medium">Thực tế</th>
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium hidden sm:table-cell">Ghi chú</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-3 py-2.5 text-zinc-300 font-medium">{monthLabel(entry.month)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          entry.platform === 'Shopee' ? 'bg-orange-500/10 text-orange-400' :
                          entry.platform === 'Lazada' ? 'bg-violet-500/10 text-violet-400' :
                          'bg-sky-500/10 text-sky-400'}`}>
                          {entry.platform}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-400">{fmtVND(entry.actualAmount)}</td>
                      <td className="px-3 py-2.5 text-zinc-500 hidden sm:table-cell truncate max-w-[120px]">{entry.notes || '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setEntryForm({ id: entry.id, month: entry.month, platform: entry.platform, actualAmount: String(entry.actualAmount), notes: entry.notes ?? '' })}
                            className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1 text-zinc-700 hover:text-red-400 transition-colors cursor-pointer">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-800 bg-zinc-900/60">
                    <td colSpan={2} className="px-3 py-2 text-zinc-500 text-xs font-medium">Tổng cộng</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-300 text-xs">{fmtVND(totalActual)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── MODULE 3: TOP PRODUCTS BY PROFITABILITY ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <span className="text-base">🏆</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Module 3 — Sản phẩm sinh lời nhất</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Xếp hạng theo doanh thu ước tính — tập trung quảng bá những sản phẩm này</p>
          </div>
        </div>
        <div className="p-4">
          {loadingProducts ? (
            <p className="text-xs text-zinc-600">Đang tải...</p>
          ) : products.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">Chưa có sản phẩm nào.</p>
          ) : (
            <>
              {/* Bar chart top 5 */}
              {products.slice(0, 5).some(p => (p.estimatedRevenue ?? 0) > 0) && (
                <div className="mb-5">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={products.slice(0, 5).map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, revenue: p.estimatedRevenue ?? 0 }))} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#71717a' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 11 }} formatter={v => [fmtVND(Number(v)), 'Ước tính']} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Ranked list */}
              <div className="flex flex-col gap-2">
                {products.map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${i === 0 ? 'border-amber-500/30 bg-amber-500/5' : i === 1 ? 'border-zinc-600/40 bg-zinc-800/20' : i === 2 ? 'border-amber-700/30 bg-amber-900/5' : 'border-zinc-800/40'}`}>
                    {/* Rank */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-zinc-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {i + 1}
                    </div>

                    {/* Thumb */}
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-zinc-700/50" /> // eslint-disable-line @next/next/no-img-element
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-base shrink-0">
                        {p.platform?.toLowerCase() === 'shopee' ? '🛍️' : '🎵'}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[9px] text-zinc-500">{p.clicks} click</span>
                        <span className="text-[9px] text-zinc-500">~{p.estimatedOrders} đơn</span>
                        <span className="text-[9px] text-zinc-500">{p.commissionRate}% HH</span>
                        {!p.isActiveOnBio && <span className="text-[9px] text-red-400">Đang ẩn</span>}
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="text-right shrink-0">
                      {p.estimatedRevenue != null ? (
                        <p className="text-sm font-bold text-emerald-400">{fmtVND(p.estimatedRevenue)}</p>
                      ) : (
                        <p className="text-xs text-zinc-600">Chưa có giá</p>
                      )}
                      {p.price > 0 && <p className="text-[10px] text-zinc-600">{fmtVND(p.price)}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Smart tip */}
              {products.length > 0 && products[0].estimatedRevenue && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 flex gap-2 text-xs text-emerald-300">
                  <span className="text-base shrink-0">💡</span>
                  <p>
                    <strong>{products[0].name.length > 20 ? products[0].name.slice(0, 20) + '…' : products[0].name}</strong> là sản phẩm sinh lời nhất.
                    Tập trung quảng bá sản phẩm này để tăng doanh thu.
                    {!products[0].isFeatured && ' Bật "Nổi bật" để đẩy lên đầu trang Bio.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
