'use client';

import { useState } from "react";
import { ShortLink, formatPrice } from './types';
import { toast } from "./Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ProductCardProps {
  link: ShortLink;
  index: number;
  userId: string;
  onDelete: (id: string) => void;
  onToggle: (id: string, newState: boolean) => void;
  onEdit: (link: ShortLink) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export default function ProductCard({
  link,
  index,
  userId,
  onDelete,
  onToggle,
  onEdit,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: ProductCardProps) {
  const p = link.Product;
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${API_URL}/${link.shortCode}`);
      toast.success("Đã copy link!");
    } catch {
      toast.error("Không copy được link.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/links/${link.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success("Đã xoá sản phẩm.");
      onDelete(link.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Xoá thất bại.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`${API_URL}/api/links/${link.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(json.data.isActiveOnBio ? "Đã hiện sản phẩm." : "Đã ẩn sản phẩm.");
      onToggle(link.id, json.data.isActiveOnBio);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Thất bại.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 group
      ${link.isActiveOnBio ? "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900" : "border-zinc-800/50 bg-zinc-900/20 opacity-60 hover:opacity-80"}`}
    >
      {/* Reorder */}
      <div className="hidden sm:flex flex-col gap-0.5 shrink-0">
        <button
          onClick={() => onMoveUp(link.id)}
          disabled={!canMoveUp}
          className="p-0.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={() => onMoveDown(link.id)}
          disabled={!canMoveDown}
          className="p-0.5 text-zinc-700 hover:text-zinc-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Index */}
      <span className="w-4 text-xs text-zinc-700 font-mono shrink-0 text-center">{index}</span>

      {/* Image */}
      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/50 shrink-0 overflow-hidden flex items-center justify-center text-base">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
        ) : (
          <span>{p.platform?.toLowerCase() === "shopee" ? "🛍️" : "🎵"}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
            ${p.platform?.toLowerCase() === "shopee" ? "text-orange-400 bg-orange-500/10" : "text-sky-400 bg-sky-500/10"}`}
          >
            {p.platform}
          </span>
          {!link.isActiveOnBio && <span className="text-[9px] text-zinc-600 font-medium">Đang ẩn</span>}
        </div>
        <p className="text-sm text-zinc-200 font-medium leading-snug line-clamp-1">{p.name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs font-semibold text-zinc-400">{formatPrice(p.currentPrice)}</span>
          {(link.clicks ?? 0) > 0 && <span className="text-[10px] text-zinc-600">{link.clicks} lượt click</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {/* Copy */}
        <button
          onClick={handleCopy}
          title="Copy link"
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        {/* Edit */}
        <button
          onClick={() => onEdit(link)}
          title="Sửa"
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={link.isActiveOnBio ? "Ẩn" : "Hiện"}
          className={`p-1.5 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed ${link.isActiveOnBio ? "text-emerald-500 hover:bg-emerald-500/10" : "text-zinc-500 hover:bg-zinc-800"}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {link.isActiveOnBio ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            )}
          </svg>
        </button>
        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Xoá"
          className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Short code – always visible small */}
      <span className="text-[10px] text-zinc-700 font-mono hidden lg:block shrink-0">/{link.shortCode}</span>
    </div>
  );
}
