'use client';

export function SkeletonHero() {
  return (
    <div className="rounded-2xl bg-[var(--dash-surface-solid)] border border-[var(--dash-border)] p-6 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <div className="h-5 w-20 rounded-full bg-[var(--dash-surface-hover)]" />
          <div className="h-12 w-40 rounded-lg bg-[var(--dash-surface-hover)]" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 rounded-lg bg-[var(--dash-surface-hover)]" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-3 w-24 rounded bg-[var(--dash-surface-hover)]" />
          <div className="h-16 rounded-lg bg-[var(--dash-surface-hover)]" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-solid)] relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="hidden sm:block w-3 h-8 rounded bg-[var(--dash-surface-hover)]" />
      <div className="w-10 h-10 rounded-lg bg-[var(--dash-surface-hover)] shrink-0" />
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex gap-1.5">
          <div className="h-3 w-12 rounded bg-[var(--dash-surface-hover)]" />
          <div className="h-3 w-10 rounded bg-[var(--dash-surface-hover)]" />
        </div>
        <div className="h-3 w-3/5 rounded bg-[var(--dash-surface-hover)]" />
        <div className="h-3 w-1/3 rounded bg-[var(--dash-surface-hover)]" />
      </div>
    </div>
  );
}

export function SkeletonChart({ height = 180 }: { height?: number }) {
  return (
    <div className="bg-[var(--dash-surface-solid)] border border-[var(--dash-border)] rounded-xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="h-3 w-32 rounded bg-[var(--dash-surface-hover)] mb-4" />
      <div className="flex items-end gap-2" style={{ height }}>
        {[60, 80, 40, 90, 70, 55, 85].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-[var(--dash-surface-hover)]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonProductList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
