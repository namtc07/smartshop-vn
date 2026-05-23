'use client';

import type { ReactNode } from 'react';

type Accent = 'violet' | 'emerald' | 'sky' | 'amber' | 'rose';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: Accent;
  hint?: string;
}

const ACCENT_MAP: Record<Accent, { bg: string; text: string; ring: string }> = {
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', ring: 'ring-violet-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', ring: 'ring-sky-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', ring: 'ring-rose-500/20' },
};

export default function StatCard({ label, value, icon, accent = 'violet', hint }: StatCardProps) {
  const a = ACCENT_MAP[accent];
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.bg} ${a.text} ring-1 ${a.ring}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {icon}
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-xl font-bold text-white leading-tight mt-0.5">{value}</p>
        {hint && <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  );
}
