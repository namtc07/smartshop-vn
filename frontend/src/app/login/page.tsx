'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ userId: '', slug: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.userId.trim() || !form.slug.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setLoading(true);

    // Kiểm tra slug có tồn tại không bằng cách gọi API public
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/b/${form.slug.trim()}`);

      if (!res.ok) {
        setError('Slug không tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
        setLoading(false);
        return;
      }

      // Lưu session vào localStorage
      localStorage.setItem('koc_user_id', form.userId.trim());
      localStorage.setItem('koc_slug', form.slug.trim());

      router.push('/dashboard');
    } catch {
      setError('Không kết nối được tới server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-900/15 blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/15 blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/30">
            S
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Smart<span className="text-indigo-400">Shop</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-1">Đăng nhập Dashboard</h1>
          <p className="text-slate-400 text-sm mb-6">Nhập thông tin tài khoản KOC của bạn.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* User ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                placeholder="Ví dụ: u_001..."
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                autoComplete="off"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Bio Page Slug
              </label>
              <div className="flex items-center bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-200">
                <span className="px-3 text-slate-500 text-sm border-r border-slate-700/60 py-3 select-none">
                  smartshop.vn/
                </span>
                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="linh-beauty"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang xác thực...
                </span>
              ) : 'Vào Dashboard →'}
            </button>
          </form>
        </div>

        {/* Link sang Register */}
        <p className="text-center text-xs text-slate-500 mt-5">
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Đăng ký miễn phí
          </a>
        </p>

        <p className="text-center text-xs text-slate-600 mt-4">
          <a href="/" className="hover:text-slate-400 transition-colors">← Về trang chủ</a>
        </p>
      </div>
    </div>
  );
}
