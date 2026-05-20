"use client";

import { useState } from "react";
import { UserProfile, getDisplayName } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ProfileModalProps {
  profile: UserProfile;
  slug: string;
  onSuccess: (updated: UserProfile) => void;
  onClose: () => void;
}

export default function ProfileModal({ profile, slug, onSuccess, onClose }: ProfileModalProps) {
  const [form, setForm] = useState({
    displayName: profile.displayName ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${profile.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName.trim() || null,
          bio: form.bio.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onSuccess(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = getDisplayName(profile, slug);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Tuỳ chỉnh trang Bio</h2>
            <p className="text-xs text-zinc-500 mt-0.5">smartshop.vn/{slug}</p>
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

        {/* Preview */}
        <div className="flex items-center gap-3 px-5 py-3 bg-zinc-800/40 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
            ) : (
              <span className="text-white font-bold text-sm">{displayName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{form.displayName || displayName}</p>
            {form.bio && <p className="text-xs text-zinc-400 truncate">{form.bio}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tên hiển thị</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder={displayName}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Mô tả ngắn</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="KOC | Beauty & Lifestyle..."
              rows={2}
              maxLength={120}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
            />
            <p className="text-[10px] text-zinc-600 mt-1 text-right">{form.bio.length}/120</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">URL ảnh đại diện</label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

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
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
