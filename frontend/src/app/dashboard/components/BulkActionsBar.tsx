'use client';

import { useState } from 'react';
import { toast } from './Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BulkActionsBarProps {
  selectedIds: string[];
  userId: string;
  totalLinks: number;
  onClear: () => void;
  onSelectAll: () => void;
  onActionComplete: () => void;
}

export default function BulkActionsBar({
  selectedIds,
  userId,
  totalLinks,
  onClear,
  onSelectAll,
  onActionComplete,
}: BulkActionsBarProps) {
  const [busy, setBusy] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  const runBulk = async (action: 'hide' | 'show' | 'feature' | 'unfeature' | 'delete') => {
    if (action === 'delete' && !confirm(`Xoá ${selectedIds.length} sản phẩm? Hành động này không thể hoàn tác.`)) return;
    setBusy(action);
    try {
      const res = await fetch(`${API_URL}/api/links/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ids: selectedIds, action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(`Đã ${MESSAGES[action]} ${selectedIds.length} sản phẩm.`);
      onActionComplete();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setBusy(null);
    }
  };

  const allSelected = selectedIds.length === totalLinks && totalLinks > 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 pl-2 pr-3 py-2 rounded-2xl bg-[var(--dash-bg-elevated)] border border-[var(--dash-border-strong)] shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30">
          <div className="w-5 h-5 rounded bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
            {selectedIds.length}
          </div>
          <span className="text-xs font-semibold text-violet-300">đã chọn</span>
        </div>

        <button
          onClick={allSelected ? onClear : onSelectAll}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--dash-text-mute)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors cursor-pointer"
        >
          {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>

        <div className="w-px h-6 bg-[var(--dash-border)]" />

        <BulkBtn label="Hiện" icon="show" loading={busy === 'show'} onClick={() => runBulk('show')} />
        <BulkBtn label="Ẩn" icon="hide" loading={busy === 'hide'} onClick={() => runBulk('hide')} />
        <BulkBtn label="Nổi bật" icon="star" loading={busy === 'feature'} onClick={() => runBulk('feature')} />
        <BulkBtn label="Bỏ NB" icon="unstar" loading={busy === 'unfeature'} onClick={() => runBulk('unfeature')} />

        <div className="w-px h-6 bg-[var(--dash-border)]" />

        <BulkBtn label="Xoá" icon="trash" loading={busy === 'delete'} destructive onClick={() => runBulk('delete')} />

        <button
          onClick={onClear}
          aria-label="Đóng"
          className="ml-1 p-1.5 rounded-lg text-[var(--dash-text-dim)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const MESSAGES: Record<string, string> = {
  hide: 'ẩn',
  show: 'hiện',
  feature: 'đánh dấu nổi bật',
  unfeature: 'bỏ nổi bật',
  delete: 'xoá',
};

const ICONS: Record<string, React.ReactNode> = {
  show: <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
  hide: <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />,
  star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.075 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.673z" />,
  unstar: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888M3 3l18 18M2.075 10.1l3.976 2.888a1 1 0 01.363 1.118l-1.518 4.674c-.3.922.755 1.688 1.538 1.118l3.976-2.888a1 1 0 011.176 0l3.976 2.888" />,
  trash: <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
};

function BulkBtn({
  label, icon, loading, destructive, onClick,
}: {
  label: string;
  icon: keyof typeof ICONS;
  loading?: boolean;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
        destructive
          ? 'text-rose-400 hover:bg-rose-500/10'
          : 'text-[var(--dash-text-soft)] hover:bg-[var(--dash-surface-hover)]'
      }`}
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {ICONS[icon]}
        </svg>
      )}
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}
