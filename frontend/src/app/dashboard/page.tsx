'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import Sidebar from './components/Sidebar';
import ProductCard from './components/ProductCard';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import ProfileModal from './components/ProfileModal';
import ToastContainer, { toast, checkClickMilestone } from './components/Toast';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ThemeCustomizer from './components/ThemeCustomizer';
import QRCodeModal from './components/QRCodeModal';
import RevenueDashboard from './components/RevenueDashboard';
import { DashboardThemeProvider } from './components/ThemeProvider';
import UserMenu from './components/UserMenu';
import PhonePreview from './components/PhonePreview';
import StatsHero from './components/StatsHero';
import CommandPalette from './components/CommandPalette';
import { SkeletonHero, SkeletonProductList } from './components/Skeleton';
import EmptyState from './components/EmptyState';
import SmartPasteBanner from './components/SmartPasteBanner';
import BulkActionsBar from './components/BulkActionsBar';
import QuickFilter from './components/QuickFilter';
import { ShortLink, UserProfile, Category, DashboardTab, getDisplayName } from './components/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DashboardPage() {
  return (
    <DashboardThemeProvider>
      <DashboardInner />
    </DashboardThemeProvider>
  );
}

function DashboardInner() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [slug, setSlug] = useState('');
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<DashboardTab>('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [pasteUrl, setPasteUrl] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Quick filter / selection state
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'hidden' | 'featured'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Auth guard
  useEffect(() => {
    const uid = localStorage.getItem('koc_user_id');
    const sl = localStorage.getItem('koc_slug');
    if (!uid || !sl) { router.replace('/login'); return; }
    setUserId(uid);
    setSlug(sl);
  }, [router]);

  const fetchDashboard = useCallback(async (s: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/dashboard/${s}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const raw = json.data;
      setLinks(Array.isArray(raw?.links) ? raw.links : []);
      setCategories(Array.isArray(raw?.categories) ? raw.categories : []);
      if (raw?.user) setProfile(raw.user);
    } catch {
      setError('Không kết nối được server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (slug) fetchDashboard(slug); }, [slug, fetchDashboard]);

  // Milestone check
  useEffect(() => {
    if (!slug || links.length === 0) return;
    const total = links.reduce((s, l) => s + (l.clicks ?? 0), 0);
    checkClickMilestone(slug, total);
  }, [slug, links]);

  // Global Cmd/Ctrl + K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('koc_user_id');
    localStorage.removeItem('koc_slug');
    router.push('/login');
  }, [router]);

  // ── Drag & drop reorder
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLinks(prev => {
      const oldIdx = prev.findIndex(l => l.id === active.id);
      const newIdx = prev.findIndex(l => l.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return prev;
      const next = arrayMove(prev, oldIdx, newIdx);
      // Persist
      fetch(`${API_URL}/api/links/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orderedIds: next.map(l => l.id) }),
      }).catch(() => toast.error('Không lưu được thứ tự.'));
      return next;
    });
  }, [userId]);

  // ── Stable callbacks
  const handleDelete = useCallback((id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }, []);
  const handleToggle = useCallback((id: string, active: boolean) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, isActiveOnBio: active } : l));
  }, []);
  const handleEdit = useCallback((l: ShortLink) => setEditingLink(l), []);
  const handleInlineUpdate = useCallback((id: string, patch: { name?: string; currentPrice?: number | null }) => {
    setLinks(prev => prev.map(l =>
      l.id === id ? { ...l, Product: { ...l.Product, ...patch } } : l,
    ));
  }, []);
  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (checked) n.add(id); else n.delete(id);
      return n;
    });
  }, []);

  const handleCopyBio = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
      toast.success('Đã copy link bio!');
    } catch {
      toast.error('Không copy được.');
    }
  }, [slug]);

  const handleSmartPaste = useCallback((url: string) => {
    setPasteUrl(url);
    setShowAddModal(true);
  }, []);

  // ── Derived
  const displayName = getDisplayName(profile, slug);

  const counts = useMemo(() => ({
    all: links.length,
    active: links.filter(l => l.isActiveOnBio).length,
    hidden: links.filter(l => !l.isActiveOnBio).length,
    featured: links.filter(l => l.isFeatured).length,
  }), [links]);

  const filteredLinks = useMemo(() => {
    let result = links;
    if (filter === 'active')   result = result.filter(l => l.isActiveOnBio);
    if (filter === 'hidden')   result = result.filter(l => !l.isActiveOnBio);
    if (filter === 'featured') result = result.filter(l => l.isFeatured);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(l =>
        l.Product.name.toLowerCase().includes(q) ||
        l.Product.platform.toLowerCase().includes(q) ||
        l.Category?.name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [links, filter, query]);

  const TAB_TITLES: Record<DashboardTab, string> = {
    products: 'Sản phẩm',
    analytics: 'Thống kê',
    revenue: 'Doanh thu',
    theme: 'Giao diện',
  };
  const TAB_DESCRIPTIONS: Record<DashboardTab, string> = {
    products: 'Affiliate links hiển thị trên trang bio của bạn',
    analytics: 'Lượt click, thiết bị & nguồn truy cập',
    revenue: 'Hoa hồng và ước tính doanh thu theo tháng',
    theme: 'Tuỳ chỉnh màu sắc, font và bố cục trang bio',
  };

  if (!slug) return null;

  const showPreview = activeTab !== 'theme' && activeTab !== 'revenue';
  const selectionMode = selectedIds.size > 0;

  return (
    <>
      <div className="dashboard-mesh" />

      <div className="relative flex min-h-screen text-[var(--dash-text)]">
        <Sidebar
          totalLinks={links.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCommand={() => setPaletteOpen(true)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="border-b border-[var(--dash-border)] bg-[var(--dash-bg-elevated)] px-5 sm:px-8 py-3 flex items-center gap-4 sticky top-0 z-10">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-xs">S</div>
              <span className="text-sm font-bold text-[var(--dash-text)]">SmartShop</span>
            </div>

            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--dash-text)] tracking-tight">{TAB_TITLES[activeTab]}</h1>
                {activeTab === 'products' && links.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                    {links.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--dash-text-dim)] mt-0.5">{TAB_DESCRIPTIONS[activeTab]}</p>
            </div>

            {/* Mobile tab switcher */}
            <div className="md:hidden flex gap-1 p-0.5 bg-[var(--dash-surface)] rounded-lg border border-[var(--dash-border)]">
              {(['products', 'analytics', 'revenue', 'theme'] as DashboardTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    activeTab === tab ? 'bg-violet-600 text-white' : 'text-[var(--dash-text-dim)]'
                  }`}
                >
                  {tab === 'products' ? '📦' : tab === 'analytics' ? '📊' : tab === 'revenue' ? '💰' : '🎨'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {activeTab === 'products' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-violet-500/20"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm sản phẩm
                </button>
              )}
              <button
                onClick={() => setPaletteOpen(true)}
                title="Command palette (⌘K)"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--dash-border)] hover:border-[var(--dash-border-strong)] bg-[var(--dash-surface)] hover:bg-[var(--dash-surface-hover)] text-[var(--dash-text-mute)] hover:text-[var(--dash-text)] transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <UserMenu
                slug={slug}
                displayName={displayName}
                avatarUrl={profile?.avatarUrl ?? null}
                email={profile?.email}
                onEditProfile={() => setShowProfileModal(true)}
                onShowQR={() => setShowQRModal(true)}
                onLogout={handleLogout}
              />
            </div>
          </header>

          {/* Body grid */}
          <div className={`flex-1 grid gap-6 px-5 sm:px-8 py-6 ${showPreview ? 'lg:grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>
            <main className="min-w-0">
              {/* PRODUCTS */}
              {activeTab === 'products' && (
                <>
                  {loading ? (
                    <div className="flex flex-col gap-5">
                      <SkeletonHero />
                      <SkeletonProductList count={5} />
                    </div>
                  ) : error ? (
                    <div className="py-20 flex flex-col gap-3">
                      <p className="text-sm text-[var(--dash-text-mute)]">{error}</p>
                      <button onClick={() => fetchDashboard(slug)} className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 w-fit cursor-pointer">Thử lại</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <SmartPasteBanner onUse={handleSmartPaste} />
                      <StatsHero slug={slug} links={links} />

                      {links.length === 0 ? (
                        <EmptyState
                          illustration="products"
                          title="Chưa có sản phẩm nào"
                          description="Thêm sản phẩm affiliate Shopee hoặc TikTok Shop để bắt đầu kiếm hoa hồng."
                          action={
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-violet-500/30"
                            >
                              Thêm sản phẩm đầu tiên →
                            </button>
                          }
                        />
                      ) : (
                        <div className="flex flex-col gap-3">
                          <QuickFilter
                            query={query}
                            onQueryChange={setQuery}
                            filter={filter}
                            onFilterChange={setFilter}
                            counts={counts}
                          />

                          {filteredLinks.length === 0 ? (
                            <EmptyState
                              illustration="search"
                              title="Không tìm thấy sản phẩm"
                              description={query ? `Không có kết quả cho "${query}"` : 'Thử bộ lọc khác'}
                              action={
                                <button
                                  onClick={() => { setQuery(''); setFilter('all'); }}
                                  className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 cursor-pointer"
                                >
                                  Xoá bộ lọc
                                </button>
                              }
                            />
                          ) : (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext items={filteredLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-col gap-1.5">
                                  {filteredLinks.map((link, i) => (
                                    <ProductCard
                                      key={link.id}
                                      link={link}
                                      index={i + 1}
                                      userId={userId}
                                      selected={selectedIds.has(link.id)}
                                      selectionMode={selectionMode}
                                      onSelect={handleSelect}
                                      onDelete={handleDelete}
                                      onToggle={handleToggle}
                                      onEdit={handleEdit}
                                      onInlineUpdate={handleInlineUpdate}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ANALYTICS */}
              {activeTab === 'analytics' && <AnalyticsDashboard slug={slug} />}

              {/* REVENUE */}
              {activeTab === 'revenue' && profile && (
                <RevenueDashboard
                  userId={userId}
                  profile={profile}
                  onProfileUpdate={updated => setProfile(updated)}
                />
              )}

              {/* THEME */}
              {activeTab === 'theme' && profile && (
                <ThemeCustomizer
                  profile={profile}
                  onSuccess={updated => {
                    setProfile(updated);
                    toast.success('Đã lưu giao diện.');
                  }}
                />
              )}
            </main>

            {showPreview && (
              <aside className="hidden lg:block">
                <div className="sticky top-[88px]">
                  <PhonePreview profile={profile} links={links} slug={slug} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedIds={Array.from(selectedIds)}
        userId={userId}
        totalLinks={links.length}
        onClear={() => setSelectedIds(new Set())}
        onSelectAll={() => setSelectedIds(new Set(links.map(l => l.id)))}
        onActionComplete={() => { setSelectedIds(new Set()); fetchDashboard(slug); }}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAddProduct={() => setShowAddModal(true)}
        onTabChange={setActiveTab}
        onCopyBio={handleCopyBio}
        onShowQR={() => setShowQRModal(true)}
        onEditProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
      />

      {showAddModal && (
        <AddProductModal
          userId={userId}
          slug={slug}
          categories={categories}
          initialUrl={pasteUrl ?? undefined}
          onSuccess={() => fetchDashboard(slug)}
          onClose={() => { setShowAddModal(false); setPasteUrl(null); }}
        />
      )}
      {editingLink && (
        <EditProductModal
          link={editingLink}
          userId={userId}
          categories={categories}
          onSuccess={updated => {
            setLinks(prev => prev.map(l => l.id === updated.id ? updated : l));
            setEditingLink(null);
            toast.success('Đã cập nhật sản phẩm.');
          }}
          onClose={() => setEditingLink(null)}
        />
      )}
      {showProfileModal && profile && (
        <ProfileModal
          profile={profile}
          slug={slug}
          onSuccess={updated => {
            setProfile(updated);
            setShowProfileModal(false);
            toast.success('Đã cập nhật trang Bio.');
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}
      {showQRModal && (
        <QRCodeModal
          slug={slug}
          avatarUrl={profile?.avatarUrl ?? null}
          onClose={() => setShowQRModal(false)}
        />
      )}

      <ToastContainer />
    </>
  );
}
