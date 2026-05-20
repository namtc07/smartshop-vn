'use client';

import { useState } from 'react';
import { AddForm, EMPTY_FORM } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AddProductModalProps {
  userId: string;
  slug: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddProductModal({ userId, slug, onSuccess, onClose }: AddProductModalProps) {
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.originalUrl.trim() || !form.name.trim() || !form.affiliateDeepLink.trim()) {
      setError('Vui lòng điền đủ các trường bắt buộc.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/links/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: form.platform,
          originalUrl: form.originalUrl.trim(),
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || null,
          currentPrice: form.currentPrice ? parseFloat(form.currentPrice) : null,
          affiliateDeepLink: form.affiliateDeepLink.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Thêm sản phẩm thất bại.');

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Thêm sản phẩm</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Sẽ hiển thị trên trang <span className="text-zinc-400">/{slug}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Platform selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Nền tảng</label>
            <div className="flex gap-2">
              {(["Shopee", "TikTok Shop"] as const).map((pl) => (
                <button
                  key={pl}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, platform: pl }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                    form.platform === pl
                      ? pl === "Shopee"
                        ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                        : "border-sky-500/50 bg-sky-500/10 text-sky-400"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {pl === "Shopee" ? "🛍" : "🎵"} {pl}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Kem dưỡng da ban đêm Pro-X..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* Original URL */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Link sản phẩm gốc <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.originalUrl}
              onChange={(e) => setForm((f) => ({ ...f, originalUrl: e.target.value }))}
              placeholder="https://shopee.vn/product/..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* Affiliate Deep Link */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Affiliate Deep Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.affiliateDeepLink}
              onChange={(e) => setForm((f) => ({ ...f, affiliateDeepLink: e.target.value }))}
              placeholder="https://s.shopee.vn/affiliate/..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
            <p className="text-[11px] text-zinc-600 mt-1">Link affiliate có tracking của bạn</p>
          </div>

          {/* Price + Image row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Giá (VND)</label>
              <input
                type="number"
                value={form.currentPrice}
                onChange={(e) => setForm((f) => ({ ...f, currentPrice: e.target.value }))}
                placeholder="320000"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">URL ảnh</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
              ✓ Thêm thành công! Đang cập nhật danh sách...
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all duration-150 cursor-pointer"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 cursor-pointer"
            >
              {submitting ? "Đang thêm..." : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
