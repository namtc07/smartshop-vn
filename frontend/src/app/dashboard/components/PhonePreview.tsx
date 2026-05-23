'use client';

import { memo, useMemo } from 'react';
import type { UserProfile, ShortLink } from './types';
import { formatPrice, getDisplayName } from './types';
import {
  resolveTheme, getFontFamily, getBtnRadius, getAvatarRadius, getSpacing,
  getBgStyle, getPatternOverlay,
} from './themePresets';

interface PhonePreviewProps {
  profile: UserProfile | null;
  links: ShortLink[];
  slug: string;
}

function PhonePreviewInner({ profile, links, slug }: PhonePreviewProps) {
  const theme = useMemo(() => resolveTheme(profile?.themeSettings), [profile?.themeSettings]);
  const displayName = getDisplayName(profile, slug);
  const visible = useMemo(() => links.filter(l => l.isActiveOnBio).slice(0, 6), [links]);
  const totalActive = links.filter(l => l.isActiveOnBio).length;
  const fontFamily = getFontFamily(theme.fontFamily);
  const sp = getSpacing(theme.spacing);
  const bgStyle = getBgStyle(theme);
  const pattern = getPatternOverlay(theme.bgPattern, theme.bgPatternOpacity);

  const cardClass = (() => {
    switch (theme.cardStyle) {
      case 'glass':    return 'bg-white/10 backdrop-blur-sm border border-white/15';
      case 'solid':    return 'bg-white/20 border border-white/10';
      case 'outline':  return 'bg-transparent border-2 border-white/30';
      case 'minimal':  return 'bg-transparent border-b border-white/15';
      case 'shadow':   return 'bg-white/15 border border-white/10 shadow-lg shadow-black/30';
      default:         return 'bg-white/10 border border-white/15';
    }
  })();

  return (
    <div className="w-full flex flex-col items-center gap-3 animate-fade-in">
      <div className="phone-frame w-[280px]">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-20 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          <div className="w-8 h-1 rounded-full bg-zinc-800" />
        </div>

        {/* Screen */}
        <div
          className="relative w-full rounded-[2rem] overflow-hidden"
          style={{ ...bgStyle, height: 560, fontFamily, color: theme.textColor }}
        >
          {pattern && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: pattern,
                backgroundSize: theme.bgPattern === 'dots' ? '16px 16px' : theme.bgPattern === 'grid' ? '24px 24px' : undefined,
              }}
            />
          )}

          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-5 z-10 pointer-events-none">
            <span className="text-[10px] font-semibold opacity-80 tabular-nums">9:41</span>
            <div className="flex items-center gap-1 opacity-80">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M2 22h20V2L2 22z"/></svg>
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C16.14 9.14 7.87 9.14 5 13z"/></svg>
              <div className="w-5 h-2 rounded-sm border border-current relative">
                <div className="absolute inset-0.5 bg-current rounded-[1px]" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className={`absolute inset-0 pt-8 overflow-y-auto scrollbar-hide flex flex-col px-4 ${theme.layout === 'left' ? 'items-start' : 'items-center'}`} style={{ gap: sp.gap }}>
            {/* Profile header */}
            <div className={`flex flex-col pt-3 ${theme.layout === 'left' ? 'items-start text-left' : 'items-center text-center'} w-full`}>
              <div
                className="flex items-center justify-center font-bold overflow-hidden"
                style={{
                  width: 64,
                  height: 64,
                  fontSize: 22,
                  color: 'white',
                  borderRadius: getAvatarRadius(theme.avatarShape),
                  backgroundColor: theme.primaryColor,
                  boxShadow:
                    theme.avatarRing === 'glow' ? `0 0 20px ${theme.primaryColor}` :
                    theme.avatarRing === 'gradient' ? `0 0 0 2px transparent, 0 0 0 4px ${theme.secondaryColor}` :
                    theme.avatarRing === 'solid' ? `0 0 0 2px rgba(255,255,255,0.4)` :
                    undefined,
                }}
              >
                {profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" style={{ borderRadius: getAvatarRadius(theme.avatarShape) }} />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <h1 className="text-base font-bold tracking-tight mt-2.5">{displayName}</h1>
              <p className="text-[11px] opacity-60 mt-0.5">@{slug}</p>
              {profile?.bio && (
                <p className="text-[10px] opacity-60 mt-1.5 leading-snug line-clamp-2 max-w-[200px]">{profile.bio}</p>
              )}

              {profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
                <div className={`flex items-center gap-1.5 mt-2.5 ${theme.layout === 'left' ? 'self-start' : ''}`}>
                  {Object.entries(profile.socialLinks).map(([key, val]) =>
                    val ? (
                      <div key={key} className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[9px] opacity-70 capitalize">
                        {key.charAt(0)}
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </div>

            {/* Products */}
            <div className="w-full flex flex-col pb-6" style={{ gap: Math.max(8, parseInt(sp.gap) - 4) + 'px' }}>
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-40">
                  <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-[10px]">Chưa có sản phẩm</p>
                </div>
              ) : (
                visible.map(link => (
                  <div
                    key={link.id}
                    className={`flex gap-2 items-center ${cardClass}`}
                    style={{
                      borderRadius: theme.cardStyle === 'minimal' ? '0' : getBtnRadius(theme.btnStyle),
                      padding: '8px',
                    }}
                  >
                    <div
                      className="w-10 h-10 overflow-hidden shrink-0 flex items-center justify-center text-base"
                      style={{
                        borderRadius: getBtnRadius(theme.btnStyle),
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      {link.Product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={link.Product.imageUrl} alt={link.Product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{link.Product.platform?.toLowerCase() === 'shopee' ? '🛍️' : '🎵'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                        <span className="text-[7px] font-bold uppercase px-1 py-0.5 rounded" style={{ backgroundColor: theme.secondaryColor + '33', color: theme.secondaryColor }}>
                          {link.Product.platform}
                        </span>
                        {link.badgeText && (
                          <span className="text-[7px] font-bold uppercase px-1 py-0.5 rounded bg-rose-500/30 text-rose-200">
                            {link.badgeText}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold leading-tight line-clamp-1">{link.Product.name}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] font-bold opacity-80">{formatPrice(link.Product.currentPrice)}</span>
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: theme.primaryColor, borderRadius: getBtnRadius(theme.btnStyle) }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {totalActive > visible.length && (
                <p className="text-center text-[9px] opacity-40 pt-1">+{totalActive - visible.length} sản phẩm khác</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--dash-surface)] border border-[var(--dash-border)]">
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[10px] font-medium text-[var(--dash-text-mute)]">Live preview · {slug}</span>
      </div>
    </div>
  );
}

const PhonePreview = memo(PhonePreviewInner);
export default PhonePreview;
