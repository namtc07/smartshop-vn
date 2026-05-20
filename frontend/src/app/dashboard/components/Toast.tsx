'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
type ToastListener = (toasts: Toast[]) => void;
const listeners: Set<ToastListener> = new Set();
let toasts: Toast[] = [];

function notify() {
  listeners.forEach(fn => fn([...toasts]));
}

export const toast = {
  show(message: string, type: ToastType = 'success') {
    const id = ++toastId;
    toasts = [...toasts, { id, message, type }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 2800);
  },
  success: (msg: string) => toast.show(msg, 'success'),
  error: (msg: string) => toast.show(msg, 'error'),
  info: (msg: string) => toast.show(msg, 'info'),
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
      {items.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border pointer-events-auto
            animate-in slide-in-from-bottom-2 fade-in duration-200
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
      ))}
    </div>
  );
}
