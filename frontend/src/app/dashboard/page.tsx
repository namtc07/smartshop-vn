'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  platform: string;
  originalUrl: string;
  name: string;
  imageUrl: string | null;
  currentPrice: number | null;
}

interface ShortLink {
  id: string;
  shortCode: string;
  affiliateDeepLink: string;
  isActiveOnBio: boolean;
  Product: Product;
}

interface AddForm {
  platform: 'Shopee' | 'TikTok Shop';
  originalUrl: string;
  name: string;
  imageUrl: string;
  currentPrice: string;
  affiliateDeepLink: string;
}

const EMPTY_FORM: AddForm = {
  platform: 'Shopee',
  originalUrl: '',
  name: '',
  imageUrl: '',
  currentPrice: '',
  affiliateDeepLink: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number | null) {
  if (!price) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function PlatformBadge({ platform }: { platform: string }) {
  const isShopee = platform.toLowerCase() === 'shopee';
  return (
    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
      isShopee
        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
    }`}>
      {platform}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [slug, setSlug] = useState('');
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUserId = localStorage.getItem('koc_user_id');
    const storedSlug = localStorage.getItem('koc_slug');
    if (!storedUserId || !storedSlug) {
      router.replace('/login');
      return;
    }
    setUserId(storedUserId);
    setSlug(storedSlug);
  }, [router]);

  // ── Fetch bio links ─────────────────────────────────────────────────────────
  const fetchLinks = useCallback(async (currentSlug: string) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${API_URL}/api/b/${currentSlug}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Không tải được danh sách sản phẩm.');
      const json = await res.json();
      console.debug('[Dashboard] API response:', json);
      console.debug('[Dashboard] json.data type:', typeof json.data, '| isArray:', Array.isArray(json.data));
      setLinks(json.success && Array.isArray(json.data) ? json.data : []);
    } catch {
      setFetchError('Không kết nối được tới server. Kiểm tra backend đang chạy chưa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) fetchLinks(slug);
  }, [slug, fetchLinks]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('koc_user_id');
    localStorage.removeItem('koc_slug');
    router.push('/login');
  };

  // ── Add product submit ──────────────────────────────────────────────────────
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!form.originalUrl || !form.name || !form.affiliateDeepLink) {
      setSubmitError('Vui lòng điền đủ các trường bắt buộc (*).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId,
        platform: form.platform,
        originalUrl: form.originalUrl.trim(),
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim() || null,
        currentPrice: form.currentPrice ? parseFloat(form.currentPrice) : null,
        affiliateDeepLink: form.affiliateDeepLink.trim(),
      };

      const res = await fetch(`${API_URL}/api/links/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Thêm sản phẩm thất bại.');
      }

      setSubmitSuccess('Thêm sản phẩm thành công!');
      setForm(EMPTY_FORM);
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess('');
        fetchLinks(slug);
      }, 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!slug) return null; // waiting for auth check

  const kocName = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-pink-900/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/60 bg-slate-950/80 backdrop-blur-xl p-6 sticky top-0 h-screen">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/30">
              S
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Smart<span className="text-indigo-400">Shop</span>
            </span>
          </div>

          {/* Profile */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 mb-6">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 mb-3">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xl font-black text-white">
                {kocName.charAt(0)}
              </div>
            </div>
            <p className="text-white font-bold text-sm">{kocName}</p>
            <p className="text-indigo-400 text-xs mt-0.5">@{slug}</p>
            <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
              KOC Partner
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 text-sm font-semibold">
              <span>🛍️</span> Sản phẩm Bio Link
            </div>
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-sm font-medium transition-all duration-200"
            >
              <span>🔗</span> Xem Bio Link
            </a>
          </nav>

          {/* Stats quick */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50 mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tổng sản phẩm</p>
            <p className="text-2xl font-black text-white">{links.length}</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-white">Sản phẩm Bio Link</h1>
              <p className="text-slate-400 text-sm mt-1">
                Quản lý các sản phẩm affiliate hiển thị trên trang{' '}
                <a
                  href={`/${slug}`}
                  target="_blank"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  smartshop.vn/{slug}
                </a>
              </p>
            </div>
            <button
              id="btn-add-product"
              onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setSubmitError(''); setSubmitSuccess(''); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Thêm sản phẩm
            </button>
          </div>

          {/* Mobile logout */}
          <div className="flex md:hidden items-center justify-between mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-pink-500">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm font-black text-white">{kocName.charAt(0)}</div>
              </div>
              <div>
                <p className="text-white text-xs font-bold">{kocName}</p>
                <p className="text-indigo-400 text-[10px]">@{slug}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 text-xs transition-colors">
              Đăng xuất
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <svg className="w-8 h-8 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-slate-400 text-sm">Đang tải danh sách sản phẩm...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl">⚠️</div>
              <p className="text-red-400 text-sm max-w-xs">{fetchError}</p>
              <button onClick={() => fetchLinks(slug)} className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
                Thử lại
              </button>
            </div>
          ) : links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center border border-dashed border-slate-800 rounded-2xl">
              <span className="text-5xl">📦</span>
              <p className="text-slate-400 text-sm">Bạn chưa có sản phẩm nào trong Bio Link.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Thêm sản phẩm đầu tiên
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(Array.isArray(links) ? links : []).map((link, idx) => {
                const p = link?.Product;
                if (!p) return null;
                return (
                  <div
                    key={link.id}
                    className="group flex gap-4 p-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/60 hover:border-slate-700/60 rounded-2xl transition-all duration-200"
                  >
                    {/* Index */}
                    <div className="hidden sm:flex w-6 flex-shrink-0 items-center justify-center">
                      <span className="text-xs text-slate-600 font-bold">{idx + 1}</span>
                    </div>

                    {/* Image / placeholder */}
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/30 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        p.platform?.toLowerCase() === 'shopee' ? '🛍️' : '🎵'
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <PlatformBadge platform={p.platform ?? ''} />
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase border ${
                            link.isActiveOnBio
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-700/30 text-slate-500 border-slate-700/30'
                          }`}>
                            {link.isActiveOnBio ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200 leading-snug line-clamp-2">{p.name}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-bold text-pink-400">{formatPrice(p.currentPrice)}</span>
                        <a
                          href={p.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-slate-300 transition-colors truncate max-w-[180px]"
                        >
                          {p.originalUrl}
                        </a>
                      </div>
                    </div>

                    {/* Short code */}
                    <div className="hidden sm:flex flex-col items-end justify-center gap-1 flex-shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">/{link.shortCode}</span>
                      <a
                        href={`${API_URL}/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Copy link ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── ADD PRODUCT MODAL ─────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
              <h2 className="text-base font-bold text-white">Thêm sản phẩm mới</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleAddProduct} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

              {/* Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nền tảng *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Shopee', 'TikTok Shop'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, platform: p })}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                        form.platform === p
                          ? p === 'Shopee'
                            ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                            : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {p === 'Shopee' ? '🛍️' : '🎵'} {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tên sản phẩm */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Kem dưỡng da ban đêm Pro-X..."
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              {/* Original URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Link sản phẩm gốc *
                </label>
                <input
                  type="url"
                  value={form.originalUrl}
                  onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
                  placeholder="https://shopee.vn/product/..."
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              {/* Affiliate Deep Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Affiliate Deep Link *
                </label>
                <input
                  type="url"
                  value={form.affiliateDeepLink}
                  onChange={(e) => setForm({ ...form, affiliateDeepLink: e.target.value })}
                  placeholder="https://s.shopee.vn/affiliate/..."
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">Link có tracking affiliate của bạn.</p>
              </div>

              {/* Giá + Image URL – 2 cột */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    value={form.currentPrice}
                    onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
                    placeholder="320000"
                    min="0"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    URL Ảnh
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Feedback */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span> {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <span className="flex-shrink-0 mt-0.5">✅</span> {submitSuccess}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Đang thêm...
                  </span>
                ) : 'Thêm sản phẩm'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
