"use client";

import { useState } from "react";
import { UserProfile, getDisplayName } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ProfileTab = "profile" | "social" | "seo";

interface ProfileModalProps {
  profile: UserProfile;
  slug: string;
  onSuccess: (updated: UserProfile) => void;
  onClose: () => void;
}

export default function ProfileModal({ profile, slug, onSuccess, onClose }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [basicForm, setBasicForm] = useState({
    displayName: profile.displayName ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  });

  const [socialForm, setSocialForm] = useState({
    tiktok: (profile.socialLinks?.tiktok ?? ""),
    instagram: (profile.socialLinks?.instagram ?? ""),
    facebook: (profile.socialLinks?.facebook ?? ""),
    youtube: (profile.socialLinks?.youtube ?? ""),
    zalo: (profile.socialLinks?.zalo ?? ""),
  });

  const [seoForm, setSeoForm] = useState({
    seoTitle: profile.seoTitle ?? "",
    seoDescription: profile.seoDescription ?? "",
    ogImage: profile.ogImage ?? "",
  });

  const save = async (data: Record<string, unknown>) => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${profile.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onSuccess(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    save({
      displayName: basicForm.displayName.trim() || null,
      bio: basicForm.bio.trim() || null,
      avatarUrl: basicForm.avatarUrl.trim() || null,
    });
  };

  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    save({
      socialLinks: {
        tiktok: socialForm.tiktok.trim() || null,
        instagram: socialForm.instagram.trim() || null,
        facebook: socialForm.facebook.trim() || null,
        youtube: socialForm.youtube.trim() || null,
        zalo: socialForm.zalo.trim() || null,
      },
    });
  };

  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    save({
      seoTitle: seoForm.seoTitle.trim() || null,
      seoDescription: seoForm.seoDescription.trim() || null,
      ogImage: seoForm.ogImage.trim() || null,
    });
  };

  const displayName = getDisplayName(profile, slug);
  const TAB_LABELS: Record<ProfileTab, string> = { profile: "Hồ sơ", social: "Mạng xã hội", seo: "SEO" };

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all";
  const labelClass = "block text-xs font-medium text-zinc-400 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
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

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 px-5">
          {(Object.keys(TAB_LABELS) as ProfileTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(""); setSaved(false); }}
              className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer -mb-px ${
                activeTab === tab
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === "profile" && (
          <>
            {/* Preview */}
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-800/40 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center">
                {basicForm.avatarUrl ? (
                  <img src={basicForm.avatarUrl} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                ) : (
                  <span className="text-white font-bold text-sm">{displayName.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{basicForm.displayName || displayName}</p>
                {basicForm.bio && <p className="text-xs text-zinc-400 truncate">{basicForm.bio}</p>}
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="p-5 flex flex-col gap-4">
              <div>
                <label className={labelClass}>Tên hiển thị</label>
                <input type="text" value={basicForm.displayName} onChange={e => setBasicForm(f => ({ ...f, displayName: e.target.value }))} placeholder={displayName} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mô tả ngắn</label>
                <textarea value={basicForm.bio} onChange={e => setBasicForm(f => ({ ...f, bio: e.target.value }))} placeholder="KOC | Beauty & Lifestyle..." rows={2} maxLength={120} className={`${inputClass} resize-none`} />
                <p className="text-[10px] text-zinc-600 mt-1 text-right">{basicForm.bio.length}/120</p>
              </div>
              <div>
                <label className={labelClass}>URL ảnh đại diện</label>
                <input type="url" value={basicForm.avatarUrl} onChange={e => setBasicForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." className={inputClass} />
              </div>
              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              {saved && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">✓ Đã lưu thành công!</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all cursor-pointer">Huỷ</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-all cursor-pointer">{saving ? "Đang lưu..." : "Lưu"}</button>
              </div>
            </form>
          </>
        )}

        {/* Social tab */}
        {activeTab === "social" && (
          <form onSubmit={handleSaveSocial} className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-zinc-500">Nhập URL đầy đủ của trang cá nhân trên từng mạng xã hội.</p>
            {[
              { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username" },
              { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
              { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
              { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel" },
              { key: "zalo", label: "Zalo (số điện thoại / link)", placeholder: "https://zalo.me/..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type="url"
                  value={socialForm[key as keyof typeof socialForm]}
                  onChange={e => setSocialForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {saved && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">✓ Đã lưu thành công!</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-all cursor-pointer">Huỷ</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-all cursor-pointer">{saving ? "Đang lưu..." : "Lưu"}</button>
            </div>
          </form>
        )}

        {/* SEO tab */}
        {activeTab === "seo" && (
          <form onSubmit={handleSaveSEO} className="p-5 flex flex-col gap-4">
            <p className="text-xs text-zinc-500">Tối ưu hiển thị khi chia sẻ trang Bio lên Facebook, Zalo, v.v.</p>
            <div>
              <label className={labelClass}>Tiêu đề SEO</label>
              <input type="text" value={seoForm.seoTitle} onChange={e => setSeoForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder={`${getDisplayName(profile, slug)} | SmartShop VN`} maxLength={70} className={inputClass} />
              <p className="text-[10px] text-zinc-600 mt-1 text-right">{seoForm.seoTitle.length}/70</p>
            </div>
            <div>
              <label className={labelClass}>Mô tả SEO</label>
              <textarea value={seoForm.seoDescription} onChange={e => setSeoForm(f => ({ ...f, seoDescription: e.target.value }))} placeholder="Khám phá sản phẩm được gợi ý bởi..." rows={3} maxLength={160} className={`${inputClass} resize-none`} />
              <p className="text-[10px] text-zinc-600 mt-1 text-right">{seoForm.seoDescription.length}/160</p>
            </div>
            <div>
              <label className={labelClass}>Ảnh OpenGraph (URL)</label>
              <input type="url" value={seoForm.ogImage} onChange={e => setSeoForm(f => ({ ...f, ogImage: e.target.value }))} placeholder="https://... (1200×630px)" className={inputClass} />
              <p className="text-[10px] text-zinc-600 mt-1">Kích thước khuyến nghị: 1200×630px</p>
            </div>
            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {saved && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">✓ Đã lưu thành công!</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-all cursor-pointer">Huỷ</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-all cursor-pointer">{saving ? "Đang lưu..." : "Lưu"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
