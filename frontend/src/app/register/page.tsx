'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    slug: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSlugChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, slug: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password || !form.confirmPassword || !form.slug.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email không hợp lệ.');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          bioPageSlug: form.slug,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      localStorage.setItem('koc_user_id', json.data.id);
      localStorage.setItem('koc_slug', json.data.bioPageSlug);
      router.push('/dashboard');
    } catch {
      setError('Không kết nối được tới server. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Đánh giá độ mạnh password
  const getPasswordStrength = (pw: string) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Quá ngắn', color: 'bg-red-500', width: 'w-1/4' };
    if (pw.length < 8) return { label: 'Yếu', color: 'bg-orange-500', width: 'w-2/4' };
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Trung bình', color: 'bg-yellow-500', width: 'w-3/4' };
    return { label: 'Mạnh', color: 'bg-emerald-500', width: 'w-full' };
  };
  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
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
          <p className="text-slate-400 text-sm mb-6">Điền thông tin để tạo trang Bio Link của bạn.</p>

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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Mật khẩu *
              </label>
              <div className="flex items-center bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-200">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`text-[11px] mt-1 font-medium ${
                    strength.label === 'Mạnh' ? 'text-emerald-400' :
                    strength.label === 'Trung bình' ? 'text-yellow-400' : 'text-orange-400'
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu *
              </label>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu"
                className={`w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                  form.confirmPassword && form.confirmPassword !== form.password
                    ? 'border-red-500/50 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30'
                    : form.confirmPassword && form.confirmPassword === form.password
                    ? 'border-emerald-500/50 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30'
                    : 'border-slate-700/60 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30'
                }`}
                autoComplete="new-password"
              />
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-[11px] text-red-400 mt-1">Mật khẩu không khớp</p>
              )}
              {form.confirmPassword && form.confirmPassword === form.password && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Mật khẩu khớp
                </p>
              )}
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
              {form.slug && (
                <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Trang của bạn: <span className="font-semibold text-emerald-300 ml-1">smartshop.vn/{form.slug}</span>
                </p>
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

          <p className="text-center text-xs text-slate-500 mt-5">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Đăng nhập
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          <a href="/" className="hover:text-slate-400 transition-colors">← Về trang chủ</a>
        </p>
      </div>
    </div>
  );
}
