'use client';

import { useEffect, useRef, useState } from 'react';
import { useDashboardTheme } from './ThemeProvider';
import { toast } from './Toast';

interface UserMenuProps {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  email?: string;
  onEditProfile: () => void;
  onShowQR: () => void;
  onLogout: () => void;
}

export default function UserMenu({
  slug,
  displayName,
  avatarUrl,
  email,
  onEditProfile,
  onShowQR,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useDashboardTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleCopyBio = async () => {
    try {
      const url = `${window.location.origin}/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success('Đã copy link bio!');
      setOpen(false);
    } catch {
      toast.error('Không copy được.');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-[var(--dash-border)] hover:border-[var(--dash-border-strong)] bg-[var(--dash-surface)] hover:bg-[var(--dash-surface-hover)] transition-colors cursor-pointer"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs">
            {displayName.charAt(0)}
          </div>
        )}
        <span className="text-xs font-semibold text-[var(--dash-text-soft)] hidden sm:block max-w-[100px] truncate">{displayName}</span>
        <svg className={`w-3 h-3 text-[var(--dash-text-dim)] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-xl glass-card shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Profile header */}
          <div className="p-4 border-b border-[var(--dash-border)] bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold ring-2 ring-violet-500/30">
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--dash-text)] truncate">{displayName}</p>
                {email && <p className="text-[11px] text-[var(--dash-text-dim)] truncate">{email}</p>}
              </div>
            </div>
          </div>

          {/* Bio link card */}
          <div className="px-3 py-3 border-b border-[var(--dash-border)]">
            <button
              onClick={handleCopyBio}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[var(--dash-surface-hover)] hover:ring-1 hover:ring-violet-500/30 border border-[var(--dash-border)] transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-md bg-violet-500/15 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[10px] text-[var(--dash-text-dim)] font-medium uppercase tracking-wide">Bio link</p>
                <p className="text-xs font-mono text-[var(--dash-text-soft)] truncate">/{slug}</p>
              </div>
              <svg className="w-3.5 h-3.5 text-[var(--dash-text-dim)] group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="py-1.5">
            <MenuItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              }
              label="Chỉnh sửa hồ sơ"
              onClick={() => { onEditProfile(); setOpen(false); }}
            />
            <MenuItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              }
              label="Mở trang Bio"
              onClick={() => { window.open(`/${slug}`, '_blank'); setOpen(false); }}
            />
            <MenuItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              }
              label="QR Code"
              onClick={() => { onShowQR(); setOpen(false); }}
            />
          </div>

          {/* Theme toggle */}
          <div className="border-t border-[var(--dash-border)] py-2 px-3">
            <div className="flex items-center justify-between p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--dash-text-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {theme === 'dark' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  )}
                </svg>
                <span className="text-xs font-medium text-[var(--dash-text-soft)]">
                  {theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
                </span>
              </div>
              <button
                onClick={toggle}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${theme === 'dark' ? 'bg-violet-600' : 'bg-zinc-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-[var(--dash-border)] py-1.5">
            <MenuItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              }
              label="Đăng xuất"
              destructive
              onClick={() => { onLogout(); setOpen(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
        destructive
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-[var(--dash-text-soft)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)]'
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {icon}
      </svg>
      {label}
    </button>
  );
}
