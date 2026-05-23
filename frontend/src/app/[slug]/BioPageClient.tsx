'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { UserProfile, ShortLink, Category } from '../dashboard/components/types';
import {
  resolveTheme, getFontFamily, getBtnRadius, getAvatarRadius, getSpacing,
  getBgStyle, getPatternOverlay,
} from '../dashboard/components/themePresets';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Countdown Timer component
function CountdownTimer({ endDate }: { endDate: string }) {
  const calc = () => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endDate]);
  if (!time) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
      ⚡ Còn {time.h > 0 ? `${time.h}g ` : ''}{time.m}p {time.s}s
    </span>
  );
}

// ── Video embed helper
function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let id = '';
      if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
      else if (u.pathname.includes('/shorts/')) id = u.pathname.split('/shorts/')[1].split('/')[0];
      else id = u.searchParams.get('v') || '';
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (u.hostname.includes('tiktok.com')) {
      const m = u.pathname.match(/\/video\/(\d+)/);
      return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
    }
    return null;
  } catch { return null; }
}

// ── Social icon definitions
const SOCIAL_ICONS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  tiktok: {
    label: 'TikTok',
    color: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.37 6.37 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/>
      </svg>
    ),
  },
  instagram: {
    label: 'Instagram',
    color: '#E1306C',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  zalo: {
    label: 'Zalo',
    color: '#0068FF',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.988-5.367 11.988-11.987C24.005 5.367 18.641.026 12.017.026z"/>
      </svg>
    ),
  },
};

// ── Badge styles
const BADGE_STYLES: Record<string, string> = {
  default: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
  sale: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
  hot: 'bg-red-500/20 text-red-300 border border-red-500/40',
};

function getBadgeClass(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('sale') || lower.includes('%')) return BADGE_STYLES.sale;
  if (lower.includes('hot') || lower.includes('flash')) return BADGE_STYLES.hot;
  return BADGE_STYLES.default;
}

// ── Video lightbox
function VideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {embedUrl ? (
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Video review"
            />
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-white/70 text-sm mb-4">Không thể nhúng video này trực tiếp.</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              Mở video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component
interface BioPageClientProps {
  user: UserProfile;
  links: ShortLink[];
  slug: string;
}

export default function BioPageClient({ user, links, slug }: BioPageClientProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  const theme = useMemo(() => resolveTheme(user.themeSettings), [user.themeSettings]);
  const themeBg = useMemo(() => getBgStyle(theme), [theme]);
  const themePattern = useMemo(() => getPatternOverlay(theme.bgPattern, theme.bgPatternOpacity), [theme.bgPattern, theme.bgPatternOpacity]);
  const themeFontFamily = useMemo(() => getFontFamily(theme.fontFamily), [theme.fontFamily]);
  const themeSpacing = useMemo(() => getSpacing(theme.spacing), [theme.spacing]);
  const themeBtnRadius = useMemo(() => getBtnRadius(theme.btnStyle), [theme.btnStyle]);
  const themeAvatarRadius = useMemo(() => getAvatarRadius(theme.avatarShape), [theme.avatarShape]);

  // Collect unique categories from links
  const categories = useMemo<Category[]>(() => {
    const map = new Map<string, Category>();
    for (const link of links) {
      if (link.Category) map.set(link.Category.id, link.Category);
    }
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [links]);

  const filteredLinks = useMemo(() => {
    let result = links;
    if (activeCategory) result = result.filter(l => l.categoryId === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.Product.name.toLowerCase().includes(q) || l.Product.platform.toLowerCase().includes(q),
      );
    }
    return result;
  }, [links, activeCategory, search]);

  const kocName = user.displayName || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const socialLinks = user.socialLinks || {};
  const hasSocial = Object.values(socialLinks).some(Boolean);

  const trackAndRedirect = useCallback(
    (shortCode: string, affiliateDeepLink: string) => {
      window.open(`${API_URL}/${shortCode}`, '_blank', 'noopener,noreferrer');
    },
    [],
  );

  return (
    <div
      style={{ ...themeBg, fontFamily: themeFontFamily, color: theme.textColor }}
      className="min-h-screen flex justify-center p-0 sm:p-4"
    >
      {/* Pattern overlay */}
      {themePattern && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: themePattern,
            backgroundSize: theme.bgPattern === 'dots' ? '16px 16px' : theme.bgPattern === 'grid' ? '24px 24px' : undefined,
          }}
        />
      )}
      {/* BG decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/8 blur-[120px]" />
      </div>

      {/* Video lightbox */}
      {activeVideoUrl && <VideoModal videoUrl={activeVideoUrl} onClose={() => setActiveVideoUrl(null)} />}

      {/* Main container */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-x-0 sm:border-x border-slate-800/60 min-h-screen sm:min-h-[850px] sm:my-4 sm:rounded-3xl p-6 flex flex-col items-center relative z-10 shadow-2xl">

        {/* Profile header */}
        <div className="flex flex-col items-center mt-6 mb-6 text-center w-full">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl mb-4 relative">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={kocName} fill sizes="96px" className="object-cover rounded-full" unoptimized />
              ) : (
                kocName.charAt(0)
              )}
            </div>
            <span className="absolute bottom-0 right-1 bg-indigo-500 text-white rounded-full p-1 border-2 border-slate-900 text-xs">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">{kocName}</h1>
          <p className="text-sm text-indigo-400/90 font-medium mt-1">@{slug}</p>
          {user.bio && <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">{user.bio}</p>}
          <span className="mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/60 text-slate-300">
            KOC Affiliate Partner
          </span>

          {/* Social icons */}
          {hasSocial && (
            <div className="flex items-center gap-3 mt-4">
              {Object.entries(SOCIAL_ICONS).map(([key, social]) => {
                const url = socialLinks[key as keyof typeof socialLinks];
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.label}
                    className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all duration-200 hover:scale-110"
                  >
                    {social.icon}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Search bar + layout toggle */}
        <div className="w-full mb-4 flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>}
          </div>
          {/* Layout toggle */}
          <button
            onClick={() => setLayout(l => l === 'list' ? 'grid' : 'list')}
            className="shrink-0 w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all"
            title={layout === 'list' ? 'Chuyển sang dạng lưới' : 'Chuyển sang dạng danh sách'}
          >
            {layout === 'list' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="w-full mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                activeCategory === null
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product list */}
        <div className="w-full flex-1 flex flex-col gap-4">
          {!search && !activeCategory && (
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1 px-1">
              Danh sách sản phẩm gợi ý
            </h2>
          )}

          {filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl text-center">
              <span className="text-4xl mb-2">🔍</span>
              <p className="text-sm text-slate-400">
                {search ? `Không tìm thấy sản phẩm cho "${search}"` : 'Chưa có sản phẩm trong danh mục này.'}
              </p>
            </div>
          ) : layout === 'grid' ? (
            /* ── GRID LAYOUT ── */
            <div className="grid grid-cols-2 gap-3">
              {filteredLinks.map(link => {
                const product = link.Product;
                const price = product.currentPrice
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)
                  : 'Xem giá';
                return (
                  <div key={link.id} className="relative group">
                    {link.badgeText && (
                      <span className={`absolute -top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold ${getBadgeClass(link.badgeText)} animate-pulse`}>{link.badgeText}</span>
                    )}
                    {link.isFeatured && !link.badgeText && (
                      <span className="absolute -top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">Nổi bật</span>
                    )}
                    <button
                      onClick={() => trackAndRedirect(link.shortCode, link.affiliateDeepLink)}
                      className="w-full flex flex-col bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/50 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 text-left"
                      style={{ borderColor: link.isFeatured ? `${theme.primaryColor}30` : undefined }}
                    >
                      <div className="w-full aspect-square relative bg-slate-800">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} fill sizes="50vw" className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">{product.platform?.toLowerCase() === 'shopee' ? '🛍️' : '🎵'}</div>
                        )}
                        {link.videoUrl && (
                          <button onClick={e => { e.stopPropagation(); setActiveVideoUrl(link.videoUrl!); }} className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                          </button>
                        )}
                      </div>
                      <div className="p-2.5 flex flex-col gap-1">
                        {link.endDate && <CountdownTimer endDate={link.endDate} />}
                        <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight">{product.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-pink-400">{price}</span>
                          <span className="text-[10px] font-semibold" style={{ color: theme.primaryColor }}>Mua →</span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── LIST LAYOUT ── */
            filteredLinks.map(link => {
              const product = link.Product;
              const formattedPrice = product.currentPrice
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)
                : 'Xem chi tiết';
              const isFeatured = link.isFeatured;

              return (
                <div
                  key={link.id}
                  className={`group relative ${isFeatured ? 'ring-1 ring-indigo-500/40' : ''} rounded-2xl transition-all duration-300`}
                >
                  {/* Featured glow */}
                  {isFeatured && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                  )}

                  {/* Badge */}
                  {link.badgeText && (
                    <span className={`absolute -top-2.5 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold ${getBadgeClass(link.badgeText)} animate-pulse`}>
                      {link.badgeText}
                    </span>
                  )}
                  {isFeatured && !link.badgeText && (
                    <span className="absolute -top-2.5 left-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Nổi bật
                    </span>
                  )}

                  <button
                    onClick={() => trackAndRedirect(link.shortCode, link.affiliateDeepLink)}
                    className="w-full flex gap-4 p-3 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/50 hover:border-indigo-500/40 rounded-2xl transition-all duration-300 text-left"
                    style={{ borderColor: isFeatured ? `${theme.primaryColor}30` : undefined }}
                  >
                    {/* Product image */}
                    <div className={`${isFeatured ? 'w-24 h-24' : 'w-20 h-20'} relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700/30 flex-shrink-0 transition-all duration-300`}>
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          {product.platform?.toLowerCase() === 'shopee' ? '🛍️' : '🎵'}
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                      <div>
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            product.platform.toLowerCase() === 'shopee'
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>{product.platform}</span>
                          {link.Category && <span className="ml-1 inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-slate-700/60 text-slate-400">{link.Category.name}</span>}
                        </div>
                        {link.endDate && <CountdownTimer endDate={link.endDate} />}
                        <h3 className="text-sm font-semibold text-slate-200 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200 mt-0.5">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <span className="text-sm font-bold text-pink-400">{formattedPrice}</span>
                        <span className="text-xs font-semibold group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1 shrink-0" style={{ color: theme.primaryColor }}>
                          Mua ngay
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Video review button */}
                  {link.videoUrl && (
                    <button
                      onClick={e => { e.stopPropagation(); setActiveVideoUrl(link.videoUrl!); }}
                      className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white text-[10px] font-semibold backdrop-blur-sm transition-all hover:scale-105"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Xem Review
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 mb-2 text-center">
          <a
            href="https://smartshop.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-500 hover:text-slate-400 uppercase tracking-widest font-semibold transition-colors duration-200"
          >
            Powered by SmartShop VN
          </a>
        </div>
      </div>
    </div>
  );
}
