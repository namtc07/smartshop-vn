'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', slug: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-format slug: lowercase, replace space → dash, strip ký tự đặc biệt
  const handleSlugChange = (value: string) => {
    const formatted = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, slug: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.slug.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email không hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), bioPageSlug: form.slug }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      // Lưu session & chuyển vào dashboard
      localStorage.setItem('koc_user_id', json.data.id);
      localStorage.setItem('koc_slug', json.data.bioPageSlug);

      router.push('/dashboard');
    } catch {
      setError('Không kết nối được tới server. Vui lòng thử lại.');
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
          <h1 className="text-xl font-bold text-white mb-1">Tạo tài khoản KOC</h1>
          <p className="text-slate-400 text-sm mb-6">
            Điền thông tin để tạo trang Bio Link của bạn.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email *
              </label>
              <input
                id="register-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="linh.beauty@gmail.com"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
                autoComplete="email"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Bio Page Slug *
              </label>
              <div className="flex items-center bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-200">
                <span className="px-3 text-slate-500 text-sm border-r border-slate-700/60 py-3 select-none whitespace-nowrap">
                  smartshop.vn/
                </span>
                <input
                  id="register-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ten-cua-ban"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                  autoComplete="off"
                  maxLength={40}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Chỉ dùng chữ thường, số và dấu{' '}
                <span className="font-mono text-slate-400">-</span>. Ví dụ:{' '}
                <span className="text-indigo-400">linh-beauty</span>
              </p>
              {/* Live preview */}
              {form.slug && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Trang của bạn sẽ là:{' '}
                  <span className="font-semibold text-emerald-300">smartshop.vn/{form.slug}</span>
                </div>
              )}
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
                  Đang tạo tài khoản...
                </span>
              ) : 'Tạo tài khoản & Vào Dashboard →'}
            </button>
          </form>

          {/* Link sang Login */}
          <p className="text-center text-xs text-slate-500 mt-5">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Đăng nhập
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          <a href="/" className="hover:text-slate-400 transition-colors">← Về trang chủ</a>
        </p>
      </div>
    </div>
  );
}
