'use client';

import { useEffect, useState } from 'react';

const SHOPEE_RE = /https?:\/\/(?:[a-z]+\.)?shopee\.[a-z.]+\/[\w\-?=&%./]+/i;
const TIKTOK_RE = /https?:\/\/(?:[\w-]+\.)?tiktok\.com\/(?:view|shop)\/[\w\-?=&%./]+/i;

interface SmartPasteBannerProps {
  onUse: (url: string) => void;
}

export default function SmartPasteBanner({ onUse }: SmartPasteBannerProps) {
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function checkClipboard() {
      try {
        // Only works when document has focus & user has interacted
        if (!document.hasFocus()) return;
        if (!navigator.clipboard?.readText) return;
        const text = await navigator.clipboard.readText();
        if (cancelled || !text) return;
        const m = text.match(SHOPEE_RE) || text.match(TIKTOK_RE);
        if (m) {
          const url = m[0];
          // Skip if already dismissed this session
          if (dismissed.has(url)) return;
          setDetectedUrl(url);
        }
      } catch {
        // Permission denied — silent
      }
    }

    checkClipboard();
    const onFocus = () => checkClipboard();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [dismissed]);

  if (!detectedUrl) return null;

  const isShopee = SHOPEE_RE.test(detectedUrl);
  const platform = isShopee ? 'Shopee' : 'TikTok Shop';
  const emoji = isShopee ? '🛍️' : '🎵';

  const dismiss = () => {
    setDismissed(prev => new Set(prev).add(detectedUrl));
    setDetectedUrl(null);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-transparent p-4 animate-slide-up">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xl shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">📋 Đã phát hiện link {platform}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">Smart paste</span>
          </div>
          <p className="text-xs text-[var(--dash-text-mute)] mt-0.5 truncate font-mono">{detectedUrl}</p>
        </div>
        <button
          onClick={() => { onUse(detectedUrl); setDetectedUrl(null); }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-violet-500/20 shrink-0"
        >
          Thêm ngay
        </button>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-md text-[var(--dash-text-dim)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-all cursor-pointer shrink-0"
          aria-label="Đóng"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
