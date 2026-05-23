'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import type { DashboardTab } from './types';

export interface Command {
  id: string;
  label: string;
  hint?: string;
  shortcut?: string;
  group: 'Tác vụ' | 'Điều hướng' | 'Tài khoản';
  icon: React.ReactNode;
  run: () => void | Promise<void>;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: () => void;
  onTabChange: (tab: DashboardTab) => void;
  onCopyBio: () => void;
  onShowQR: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  onAddProduct,
  onTabChange,
  onCopyBio,
  onShowQR,
  onEditProfile,
  onLogout,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = useMemo(() => [
    {
      id: 'add-product', group: 'Tác vụ', label: 'Thêm sản phẩm mới', shortcut: 'A',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />,
      run: onAddProduct,
    },
    {
      id: 'copy-bio', group: 'Tác vụ', label: 'Copy link Bio', hint: 'Sao chép URL trang bio',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
      run: onCopyBio,
    },
    {
      id: 'qr', group: 'Tác vụ', label: 'Hiện QR Code',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />,
      run: onShowQR,
    },
    {
      id: 'tab-products', group: 'Điều hướng', label: 'Đi tới Sản phẩm', shortcut: '1',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
      run: () => onTabChange('products'),
    },
    {
      id: 'tab-analytics', group: 'Điều hướng', label: 'Đi tới Thống kê', shortcut: '2',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      run: () => onTabChange('analytics'),
    },
    {
      id: 'tab-theme', group: 'Điều hướng', label: 'Đi tới Giao diện', shortcut: '3',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
      run: () => onTabChange('theme'),
    },
    {
      id: 'edit-profile', group: 'Tài khoản', label: 'Chỉnh sửa hồ sơ',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
      run: onEditProfile,
    },
    {
      id: 'logout', group: 'Tài khoản', label: 'Đăng xuất',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
      run: onLogout,
    },
  ], [onAddProduct, onTabChange, onCopyBio, onShowQR, onEditProfile, onLogout]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.hint?.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q),
    );
  }, [commands, query]);

  // Group filtered
  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filtered.forEach(c => {
      groups[c.group] = groups[c.group] || [];
      groups[c.group].push(c);
    });
    return groups;
  }, [filtered]);

  // Flat order for arrow navigation
  const flat = useMemo(() => Object.values(grouped).flat(), [grouped]);

  const execute = useCallback((cmd: Command) => {
    onClose();
    setQuery('');
    setActiveIdx(0);
    // Give the modal a tick to unmount before running (avoids focus issues)
    setTimeout(() => cmd.run(), 0);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIdx(0);
    }
  }, [open]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(flat.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = flat[activeIdx];
        if (cmd) execute(cmd);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, flat, activeIdx, execute, onClose]);

  // Scroll active into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!open) return null;

  let runningIdx = 0;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl glass-card shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--dash-border)]">
          <svg className="w-4 h-4 text-[var(--dash-text-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Gõ lệnh hoặc tìm kiếm..."
            className="flex-1 py-4 bg-transparent text-sm text-[var(--dash-text)] placeholder-[var(--dash-text-dim)] focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-[var(--dash-text-dim)] px-2 py-1 rounded border border-[var(--dash-border)] bg-[var(--dash-surface-hover)]">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[var(--dash-text-dim)]">
              Không tìm thấy lệnh nào cho &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([group, cmds]) => (
              <div key={group} className="mb-1">
                <div className="px-4 py-1.5 text-[10px] font-bold text-[var(--dash-text-dim)] uppercase tracking-wider">
                  {group}
                </div>
                {cmds.map(cmd => {
                  const idx = runningIdx++;
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left cursor-pointer ${
                        active
                          ? 'bg-violet-500/15 text-[var(--dash-text)]'
                          : 'text-[var(--dash-text-soft)] hover:bg-[var(--dash-surface-hover)]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${active ? 'bg-violet-500/25 text-violet-300' : 'bg-[var(--dash-surface-hover)] text-[var(--dash-text-mute)]'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {cmd.icon}
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{cmd.label}</p>
                        {cmd.hint && <p className="text-[10px] text-[var(--dash-text-dim)] truncate">{cmd.hint}</p>}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] font-mono text-[var(--dash-text-dim)] px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-bg-elevated)]">{cmd.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--dash-border)] bg-[var(--dash-surface-hover)] text-[10px] text-[var(--dash-text-dim)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> chọn</span>
            <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> chạy</span>
          </div>
          <span className="flex items-center gap-1">
            Mở bằng <kbd className="font-mono px-1 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-bg-elevated)]">⌘K</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
