'use client';

interface SidebarProps {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  totalLinks: number;
  onLogout: () => void;
  onEditProfile: () => void;
}

export default function Sidebar({ slug, displayName, avatarUrl, totalLinks, onLogout, onEditProfile }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800/60">
        <a href="/" className="flex items-center gap-2 w-fit cursor-pointer">
          <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center text-white font-black text-xs">
            S
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">SmartShop</span>
        </a>
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full shrink-0 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {displayName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{displayName}</p>
            <p className="text-zinc-500 text-[11px] truncate">@{slug}</p>
          </div>
          <button
            onClick={onEditProfile}
            className="p-1 rounded text-zinc-600 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            title="Chỉnh sửa hồ sơ"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-zinc-800 text-white text-xs font-medium">
          <svg
            className="w-3.5 h-3.5 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          Sản phẩm
          <span className="ml-auto text-[10px] font-semibold text-zinc-500 bg-zinc-700 px-1.5 py-0.5 rounded">
            {totalLinks}
          </span>
        </div>

        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-xs font-medium transition-colors duration-150 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Bio Link của tôi
          <svg
            className="w-3 h-3 ml-auto text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-zinc-800/60">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/8 text-xs font-medium transition-colors duration-150 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
