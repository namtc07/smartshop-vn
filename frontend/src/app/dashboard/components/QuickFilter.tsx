'use client';

import { useEffect, useRef } from 'react';

type FilterOption = { value: string; label: string; count?: number };

interface QuickFilterProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: 'all' | 'active' | 'hidden' | 'featured';
  onFilterChange: (f: 'all' | 'active' | 'hidden' | 'featured') => void;
  counts: { all: number; active: number; hidden: number; featured: number };
}

const FILTERS: FilterOption[] = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'active',   label: 'Đang hiện' },
  { value: 'hidden',   label: 'Đang ẩn' },
  { value: 'featured', label: 'Nổi bật' },
];

export default function QuickFilter({
  query, onQueryChange, filter, onFilterChange, counts,
}: QuickFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global "/" focuses search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--dash-text-dim)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full pl-9 pr-12 py-2 text-xs bg-[var(--dash-surface-solid)] border border-[var(--dash-border)] hover:border-[var(--dash-border-strong)] focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 rounded-lg text-[var(--dash-text)] placeholder-[var(--dash-text-dim)] transition-colors focus:outline-none"
        />
        {query ? (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-dim)] hover:text-[var(--dash-text)] transition-colors"
            aria-label="Xoá"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[var(--dash-text-dim)] px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-bg-elevated)]">/</kbd>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-1 p-0.5 bg-[var(--dash-surface-solid)] rounded-lg border border-[var(--dash-border)]">
        {FILTERS.map(opt => {
          const c = counts[opt.value as keyof typeof counts];
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value as typeof filter)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-[var(--dash-text-dim)] hover:text-[var(--dash-text-soft)]'
              }`}
            >
              {opt.label}
              <span className={`text-[9px] tabular-nums px-1 rounded ${active ? 'bg-violet-500/20' : 'bg-[var(--dash-surface-hover)]'}`}>{c}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
