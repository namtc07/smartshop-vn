'use client';

import Link from 'next/link';
import type { DashboardTab } from './types';

interface SidebarProps {
  totalLinks: number;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenCommand: () => void;
}

const NAV_ITEMS: { tab: DashboardTab; label: string; description: string; icon: React.ReactNode }[] = [
  {
    tab: 'products',
    label: 'Sản phẩm',
    description: 'Quản lý affiliate links',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    ),
  },
  {
    tab: 'analytics',
    label: 'Thống kê',
    description: 'Click & conversion',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    tab: 'theme',
    label: 'Giao diện',
    description: 'Tuỳ chỉnh bio page',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    ),
  },
  {
    tab: 'revenue' as DashboardTab,
    label: 'Doanh thu',
    description: 'Hoa hồng & ước tính',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

export default function Sidebar({ totalLinks, activeTab, onTabChange, onOpenCommand }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[var(--dash-border)] bg-[var(--dash-bg)] h-screen sticky top-0 z-20">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5 w-fit cursor-pointer group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-violet-500 blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
              S
            </div>
          </div>
          <div>
            <p className="text-[var(--dash-text)] font-bold text-sm tracking-tight leading-none">SmartShop</p>
            <p className="text-[9px] text-[var(--dash-text-dim)] font-medium uppercase tracking-widest mt-0.5">KOC Studio</p>
          </div>
        </Link>
      </div>

      {/* Command palette trigger */}
      <div className="px-3 pb-4">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] hover:border-[var(--dash-border-strong)] text-left transition-colors cursor-pointer group"
        >
          <svg className="w-3.5 h-3.5 text-[var(--dash-text-dim)] group-hover:text-[var(--dash-text-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs text-[var(--dash-text-dim)] flex-1">Tìm lệnh...</span>
          <kbd className="text-[9px] font-mono text-[var(--dash-text-dim)] px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-bg-elevated)]">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        <div className="px-2.5 py-1.5 text-[9px] font-bold text-[var(--dash-text-faint)] uppercase tracking-widest">
          Workspace
        </div>
        {NAV_ITEMS.map(({ tab, label, description, icon }) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer group ${
                active
                  ? 'bg-gradient-to-r from-violet-500/15 to-fuchsia-500/5 text-[var(--dash-text)]'
                  : 'text-[var(--dash-text-mute)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text-soft)]'
              }`}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-gradient-to-b from-violet-400 to-fuchsia-500" />}
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                active
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-[var(--dash-text-dim)] group-hover:text-[var(--dash-text-mute)]'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {icon}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-tight">{label}</p>
                <p className={`text-[10px] truncate mt-0.5 ${active ? 'text-[var(--dash-text-mute)]' : 'text-[var(--dash-text-faint)]'}`}>
                  {description}
                </p>
              </div>
              {tab === 'products' && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  active ? 'bg-violet-500/25 text-violet-200' : 'bg-[var(--dash-surface-hover)] text-[var(--dash-text-dim)]'
                }`}>
                  {totalLinks}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Promo card */}
      <div className="px-3 pb-4">
        <div className="relative overflow-hidden rounded-xl p-3 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/15 to-transparent border border-violet-500/20">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-violet-500/30 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-base">✨</span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Mẹo</p>
            </div>
            <p className="text-[11px] text-[var(--dash-text-soft)] leading-snug">
              Đánh dấu sản phẩm <span className="font-semibold text-violet-300">Nổi bật</span> để tăng tỉ lệ click 3-5x.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
