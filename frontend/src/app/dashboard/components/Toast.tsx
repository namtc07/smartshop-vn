'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'achievement';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
  emoji?: string;
}

let toastId = 0;
type ToastListener = (toasts: Toast[]) => void;
const listeners: Set<ToastListener> = new Set();
let toasts: Toast[] = [];

function notify() {
  listeners.forEach(fn => fn([...toasts]));
}

export const toast = {
  show(message: string, type: ToastType = 'success', opts?: { title?: string; emoji?: string; duration?: number }) {
    const id = ++toastId;
    toasts = [...toasts, { id, message, type, title: opts?.title, emoji: opts?.emoji }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, opts?.duration ?? (type === 'achievement' ? 5000 : 2800));
  },
  success: (msg: string) => toast.show(msg, 'success'),
  error: (msg: string) => toast.show(msg, 'error'),
  info: (msg: string) => toast.show(msg, 'info'),
  achievement: (title: string, message: string, emoji = '🎉') =>
    toast.show(message, 'achievement', { title, emoji }),
};

export default function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const fn: ToastListener = (t) => setItems(t);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {items.map(t => {
        if (t.type === 'achievement') {
          return (
            <div
              key={t.id}
              className="relative overflow-hidden flex items-start gap-3 pl-3 pr-5 py-3 rounded-xl shadow-2xl pointer-events-auto animate-pop-in min-w-[280px] max-w-md"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)] pointer-events-none" />
              {/* Confetti dots */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-confetti" />
              <div className="absolute top-3 right-6 w-1 h-1 rounded-full bg-pink-200 animate-confetti" style={{ animationDelay: '0.1s' }} />
              <div className="absolute bottom-2 right-3 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-confetti" style={{ animationDelay: '0.2s' }} />
              <div className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
                {t.emoji ?? '🎉'}
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Thành tựu mới</p>
                {t.title && <p className="text-sm font-extrabold text-white leading-tight mt-0.5">{t.title}</p>}
                <p className="text-xs text-white/90 mt-0.5">{t.message}</p>
              </div>
            </div>
          );
        }
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border pointer-events-auto animate-slide-up
              ${t.type === 'success' ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400' :
                t.type === 'error'   ? 'bg-zinc-900 border-red-500/30 text-red-400' :
                                       'bg-zinc-900 border-zinc-700 text-zinc-300'}`}
          >
            {t.type === 'success' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────
// Milestone detector — fires achievement toast
// when total clicks crosses 100/500/1K/5K/10K.
// Persisted per-slug in localStorage.
// ───────────────────────────────────────────────

const MILESTONES: { value: number; label: string; emoji: string }[] = [
  { value: 100,   label: '100 lượt click đầu tiên!', emoji: '🚀' },
  { value: 500,   label: 'Đạt 500 lượt click!', emoji: '🔥' },
  { value: 1000,  label: '1.000 lượt click!', emoji: '💎' },
  { value: 5000,  label: '5.000 lượt click!', emoji: '🏆' },
  { value: 10000, label: '10.000 lượt click! Siêu KOC!', emoji: '👑' },
];

export function checkClickMilestone(slug: string, totalClicks: number) {
  if (typeof window === 'undefined') return;
  const storageKey = `koc_milestones_${slug}`;
  let seen: number[] = [];
  try {
    seen = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch { seen = []; }

  for (const m of MILESTONES) {
    if (totalClicks >= m.value && !seen.includes(m.value)) {
      toast.achievement(m.label, `Bạn đã đạt mốc ${m.value.toLocaleString('vi-VN')} lượt click — keep going!`, m.emoji);
      seen.push(m.value);
    }
  }
  try { localStorage.setItem(storageKey, JSON.stringify(seen)); } catch { /* ignore */ }
}
