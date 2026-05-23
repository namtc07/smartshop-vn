"use client";

import { useState, useEffect } from "react";
import { ShortLink, Category } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface EditProductModalProps {
  link: ShortLink;
  userId: string;
  categories: Category[];
  onSuccess: (updated: ShortLink) => void;
  onClose: () => void;
}

export default function EditProductModal({ link, userId, categories, onSuccess, onClose }: EditProductModalProps) {
  const p = link.Product;
  const [form, setForm] = useState({
    name: p.name,
    imageUrl: p.imageUrl ?? "",
    currentPrice: p.currentPrice ? String(p.currentPrice) : "",
    affiliateDeepLink: link.affiliateDeepLink,
    isFeatured: link.isFeatured,
    badgeText: link.badgeText ?? "",
    videoUrl: link.videoUrl ?? "",
    categoryId: link.categoryId ?? "",
    startDate: link.startDate ? link.startDate.slice(0, 16) : "",
    endDate: link.endDate ? link.endDate.slice(0, 16) : "",
    customShortCode: link.customShortCode ?? "",
    commissionRate: link.commissionRate != null ? String(link.commissionRate) : "",
    conversionRate: link.conversionRate != null ? String(link.conversionRate) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Tên sản phẩm không được để trống."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || null,
          currentPrice: form.currentPrice ? parseFloat(form.currentPrice) : null,
          affiliateDeepLink: form.affiliateDeepLink.trim(),
          isFeatured: form.isFeatured,
          badgeText: form.badgeText.trim() || null,
          videoUrl: form.videoUrl.trim() || null,
          categoryId: form.categoryId || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          customShortCode: form.customShortCode.trim() || null,
          commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : null,
          conversionRate: form.conversionRate ? parseFloat(form.conversionRate) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onSuccess({
        ...link,
        affiliateDeepLink: json.data.affiliateDeepLink,
        isFeatured: json.data.isFeatured,
        badgeText: json.data.badgeText,
        videoUrl: json.data.videoUrl,
        categoryId: json.data.categoryId,
        Category: json.data.Category ?? null,
        Product: json.data.Product,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all";
  const labelClass = "block text-xs font-medium text-zinc-400 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">Sửa sản phẩm</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Basic fields */}
          <div>
            <label className={labelClass}>Tên sản phẩm *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tên sản phẩm..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Affiliate Deep Link</label>
            <input type="url" value={form.affiliateDeepLink} onChange={e => setForm(f => ({ ...f, affiliateDeepLink: e.target.value }))} placeholder="https://s.shopee.vn/..." className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Giá (VND)</label>
              <input type="number" value={form.currentPrice} onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} placeholder="320000" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL ảnh</label>
              <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold mb-3">Tính năng nâng cao</p>

            {/* Featured toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-medium text-zinc-300">Sản phẩm nổi bật</p>
                <p className="text-[11px] text-zinc-600">Hiển thị lớn hơn, viền sáng</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${form.isFeatured ? 'bg-violet-600' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Badge text */}
            <div>
              <label className={labelClass}>Badge (ví dụ: "Sale 50%", "Hot Deal")</label>
              <input type="text" value={form.badgeText} onChange={e => setForm(f => ({ ...f, badgeText: e.target.value }))} placeholder="Flash Sale, Hot Deal, -30%..." maxLength={20} className={inputClass} />
            </div>

            {/* Video URL */}
            <div className="mt-3">
              <label className={labelClass}>URL Video Review (YouTube / TikTok)</label>
              <input type="url" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className={inputClass} />
            </div>

              {/* Custom short code */}
              <div className="mt-3">
                <label className={labelClass}>Custom link (tuỳ chọn)</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-500 shrink-0">localhost/</span>
                  <input type="text" value={form.customShortCode} onChange={e => setForm(f => ({ ...f, customShortCode: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '') }))} placeholder="ten-san-pham" maxLength={50} className={inputClass} />
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">Chỉ dùng chữ, số, dấu - và _. Để trống = dùng link ngẫu nhiên.</p>
              </div>

              <div className="mt-3">
                <label className={labelClass}>Tỷ lệ chuyển đổi riêng (%)</label>
                <input type="number" value={form.conversionRate} onChange={e => setForm(f => ({ ...f, conversionRate: e.target.value }))} placeholder="Dùng mặc định..." min="0" max="100" step="0.1" className={inputClass} />
                <p className="text-[10px] text-zinc-600 mt-1">Override tỷ lệ mặc định từ cài đặt Doanh thu</p>
              </div>

              {/* Commission rate */}
              <div className="mt-3">
                <label className={labelClass}>Tỷ lệ hoa hồng (%)</label>
                <input type="number" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} placeholder="5.0" min="0" max="100" step="0.1" className={inputClass} />
                <p className="text-[10px] text-zinc-600 mt-1">Dùng để ước tính doanh thu trong Thống kê</p>
              </div>

              {/* Flash Sale schedule */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={labelClass}>Bắt đầu hiện</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={inputClass + " text-zinc-400"} />
                </div>
                <div>
                  <label className={labelClass}>Tự ẩn lúc</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={inputClass + " text-zinc-400"} />
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1">Để trống = hiển thị mãi mãi</p>

            {categories.length > 0 && (
              <div className="mt-3">
                <label className={labelClass}>Danh mục</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inputClass}>
                  <option value="">— Không có danh mục —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all cursor-pointer">Huỷ</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-all cursor-pointer">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
