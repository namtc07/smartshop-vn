'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import ProductCard from './components/ProductCard';
import AddProductModal from './components/AddProductModal';
import EditProductModal from "./components/EditProductModal";
import ProfileModal from "./components/ProfileModal";
import ToastContainer, { toast } from "./components/Toast";
import { ShortLink, UserProfile, getDisplayName } from "./components/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [slug, setSlug] = useState("");
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ── Auth guard
  useEffect(() => {
    const uid = localStorage.getItem("koc_user_id");
    const sl = localStorage.getItem("koc_slug");
    if (!uid || !sl) {
      router.replace("/login");
      return;
    }
    setUserId(uid);
    setSlug(sl);
  }, [router]);

  // ── Fetch dashboard data (all links + clicks + profile)
  const fetchDashboard = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/dashboard/${s}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const raw = json.data;
      const linksData = Array.isArray(raw) ? raw : Array.isArray(raw?.links) ? raw.links : [];
      setLinks(linksData);
      if (raw?.user) setProfile(raw.user);
    } catch {
      setError("Không kết nối được server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) fetchDashboard(slug);
  }, [slug, fetchDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("koc_user_id");
    localStorage.removeItem("koc_slug");
    router.push("/login");
  };

  // ── Reorder (up/down)
  const handleMove = useCallback(
    async (id: string, direction: "up" | "down") => {
      const idx = links.findIndex((l) => l.id === id);
      if (idx < 0) return;
      const newLinks = [...links];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newLinks.length) return;
      [newLinks[idx], newLinks[swapIdx]] = [newLinks[swapIdx], newLinks[idx]];
      setLinks(newLinks);

      try {
        await fetch(`${API_URL}/api/links/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, orderedIds: newLinks.map((l) => l.id) }),
        });
      } catch {
        toast.error("Không lưu được thứ tự.");
        setLinks(links); // rollback
      }
    },
    [links, userId],
  );

  // ── Stats summary
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks ?? 0), 0);
  const activeCount = links.filter((l) => l.isActiveOnBio).length;
  const displayName = getDisplayName(profile, slug);

  if (!slug) return null;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar
        slug={slug}
        displayName={displayName}
        avatarUrl={profile?.avatarUrl ?? null}
        totalLinks={links.length}
        onLogout={handleLogout}
        onEditProfile={() => setShowProfileModal(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-zinc-800 px-6 py-3.5 flex items-center justify-between gap-4 bg-zinc-950 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {displayName.charAt(0)}
            </div>
            <p className="text-white text-xs font-semibold">@{slug}</p>
          </div>

          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-white">Sản phẩm</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {activeCount} đang hiện · {links.length - activeCount} đang ẩn · {totalClicks} lượt click
            </p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowProfileModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium transition-all cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Trang Bio
            </button>
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium transition-all cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Xem Bio
            </a>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Thêm
            </button>
            <button
              onClick={handleLogout}
              className="md:hidden p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-5 py-5 max-w-3xl w-full">
          {loading ? (
            <div className="flex items-center gap-3 py-20 text-zinc-600">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col gap-3">
              <p className="text-sm text-zinc-500">{error}</p>
              <button
                onClick={() => fetchDashboard(slug)}
                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 w-fit cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : links.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl">
                📦
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">Chưa có sản phẩm nào</p>
                <p className="text-xs text-zinc-600 mt-1">Thêm sản phẩm affiliate để hiển thị trên Bio Link.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Thêm sản phẩm đầu tiên
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-1.5 text-[10px] font-medium text-zinc-700 uppercase tracking-wide">
                <span className="hidden sm:block w-7" />
                <span className="w-4" />
                <span className="w-10 shrink-0">Ảnh</span>
                <span className="flex-1">Sản phẩm</span>
              </div>

              {links.map((link, i) => (
                <ProductCard
                  key={link.id}
                  link={link}
                  index={i + 1}
                  userId={userId}
                  onDelete={(id) => setLinks((prev) => prev.filter((l) => l.id !== id))}
                  onToggle={(id, active) =>
                    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, isActiveOnBio: active } : l)))
                  }
                  onEdit={(l) => setEditingLink(l)}
                  canMoveUp={i > 0}
                  canMoveDown={i < links.length - 1}
                  onMoveUp={(id) => handleMove(id, "up")}
                  onMoveDown={(id) => handleMove(id, "down")}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddProductModal
          userId={userId}
          slug={slug}
          onSuccess={() => fetchDashboard(slug)}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingLink && (
        <EditProductModal
          link={editingLink}
          userId={userId}
          onSuccess={(updated) => {
            setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setEditingLink(null);
            toast.success("Đã cập nhật sản phẩm.");
          }}
          onClose={() => setEditingLink(null)}
        />
      )}
      {showProfileModal && profile && (
        <ProfileModal
          profile={profile}
          slug={slug}
          onSuccess={(updated) => {
            setProfile(updated);
            setShowProfileModal(false);
            toast.success("Đã cập nhật trang Bio.");
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      <ToastContainer />
    </div>
  );
}
