"use client";

import { useState, useEffect } from "react";
import { ShortLink } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface EditProductModalProps {
  link: ShortLink;
  userId: string;
  onSuccess: (updated: ShortLink) => void;
  onClose: () => void;
}

export default function EditProductModal({ link, userId, onSuccess, onClose }: EditProductModalProps) {
  const p = link.Product;
  const [form, setForm] = useState({
    name: p.name,
    imageUrl: p.imageUrl ?? "",
    currentPrice: p.currentPrice ? String(p.currentPrice) : "",
    affiliateDeepLink: link.affiliateDeepLink,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Tên sản phẩm không được để trống.");
      return;
    }

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
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onSuccess({ ...link, affiliateDeepLink: json.data.affiliateDeepLink, Product: json.data.Product });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">Sửa sản phẩm</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {[
            { label: "Tên sản phẩm *", key: "name", type: "text", placeholder: "Tên sản phẩm..." },
            {
              label: "Affiliate Deep Link",
              key: "affiliateDeepLink",
              type: "url",
              placeholder: "https://s.shopee.vn/...",
            },
            { label: "URL ảnh", key: "imageUrl", type: "url", placeholder: "https://..." },
            { label: "Giá (VND)", key: "currentPrice", type: "number", placeholder: "320000" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                min={type === "number" ? 0 : undefined}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all cursor-pointer"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all cursor-pointer"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
