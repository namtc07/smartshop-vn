'use client';

import { memo, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ShortLink, formatPrice } from './types';
import { toast } from "./Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ProductCardProps {
  link: ShortLink;
  index: number;
  userId: string;
  selected?: boolean;
  selectionMode?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, newState: boolean) => void;
  onEdit: (link: ShortLink) => void;
  onInlineUpdate?: (id: string, patch: { name?: string; currentPrice?: number | null }) => void;
}

function ProductCardInner({
  link,
  index,
  userId,
  selected = false,
  selectionMode = false,
  onSelect,
  onDelete,
  onToggle,
  onEdit,
  onInlineUpdate,
}: ProductCardProps) {
  const p = link.Product;
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'price' | null>(null);
  const [draftName, setDraftName] = useState(p.name);
  const [draftPrice, setDraftPrice] = useState(p.currentPrice?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: link.id });

  useEffect(() => { setDraftName(p.name); }, [p.name]);
  useEffect(() => { setDraftPrice(p.currentPrice?.toString() ?? ''); }, [p.currentPrice]);
  useEffect(() => {
    if (editingField) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingField]);

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

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

  const saveInline = async (field: 'name' | 'price') => {
    const patch: { name?: string; currentPrice?: number | null } = {};
    if (field === 'name') {
      const trimmed = draftName.trim();
      if (!trimmed || trimmed === p.name) { setEditingField(null); return; }
      patch.name = trimmed;
    } else {
      const parsed = draftPrice.trim() === '' ? null : Number(draftPrice.replace(/\D/g, ''));
      if (parsed === p.currentPrice) { setEditingField(null); return; }
      patch.currentPrice = parsed;
    }
    setEditingField(null);
    try {
      const res = await fetch(`${API_URL}/api/links/${link.id}/product`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onInlineUpdate?.(link.id, patch);
      toast.success('Đã cập nhật.');
    } catch (err: unknown) {
      // Reset draft on failure
      setDraftName(p.name);
      setDraftPrice(p.currentPrice?.toString() ?? '');
      toast.error(err instanceof Error ? err.message : 'Lưu thất bại.');
    }
  };

  const containerCls = `flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border transition-all duration-150 group bg-[var(--dash-surface-solid)]
    ${selected ? 'border-violet-500/60 ring-1 ring-violet-500/30' : link.isActiveOnBio ? 'border-[var(--dash-border)] hover:border-[var(--dash-border-strong)]' : 'border-[var(--dash-border)]/50 opacity-60 hover:opacity-90'}
    ${isDragging ? 'shadow-2xl ring-2 ring-violet-500/40' : ''}`;

  return (
    <div ref={setNodeRef} style={sortableStyle} className={containerCls}>
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="hidden sm:flex items-center justify-center w-6 h-8 -ml-1 text-[var(--dash-text-faint)] hover:text-[var(--dash-text-mute)] cursor-grab active:cursor-grabbing transition-colors touch-none"
        aria-label="Kéo để sắp xếp"
        title="Kéo để sắp xếp"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="6" cy="4" r="1.5" /><circle cx="6" cy="10" r="1.5" /><circle cx="6" cy="16" r="1.5" />
          <circle cx="14" cy="4" r="1.5" /><circle cx="14" cy="10" r="1.5" /><circle cx="14" cy="16" r="1.5" />
        </svg>
      </button>

      {/* Selection checkbox or index */}
      {selectionMode ? (
        <button
          onClick={() => onSelect?.(link.id, !selected)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            selected ? 'bg-violet-500 border-violet-500' : 'border-[var(--dash-border-strong)] hover:border-violet-400'
          }`}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ) : (
        <span className="w-4 text-xs text-[var(--dash-text-faint)] font-mono shrink-0 text-center">{index}</span>
      )}

      {/* Image */}
      <div className="w-10 h-10 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] shrink-0 overflow-hidden flex items-center justify-center text-base">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <span>{p.platform?.toLowerCase() === "shopee" ? "🛍️" : "🎵"}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
            ${p.platform?.toLowerCase() === "shopee" ? "text-orange-400 bg-orange-500/10" : "text-sky-400 bg-sky-500/10"}`}
          >
            {p.platform}
          </span>
          {link.isFeatured && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">★ Nổi bật</span>}
          {link.badgeText && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400">{link.badgeText}</span>}
          {link.videoUrl && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--dash-surface-hover)] text-[var(--dash-text-dim)]">▶ Video</span>}
          {!link.isActiveOnBio && <span className="text-[9px] text-[var(--dash-text-faint)] font-medium">Đang ẩn</span>}
        </div>

        {/* Name (inline-editable) */}
        {editingField === 'name' ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onBlur={() => saveInline('name')}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
              if (e.key === 'Escape') { setDraftName(p.name); setEditingField(null); }
            }}
            className="w-full text-sm font-medium leading-snug bg-[var(--dash-surface-hover)] border border-violet-500/50 rounded px-1.5 py-0.5 text-[var(--dash-text)] focus:outline-none focus:ring-1 focus:ring-violet-500/40"
          />
        ) : (
          <p
            className="text-sm text-[var(--dash-text-soft)] font-medium leading-snug line-clamp-1 cursor-text hover:bg-[var(--dash-surface-hover)] rounded px-1 -mx-1"
            onClick={onInlineUpdate ? () => setEditingField('name') : undefined}
            title={onInlineUpdate ? 'Click để sửa tên' : undefined}
          >
            {p.name}
          </p>
        )}

        <div className="flex items-center gap-3 mt-0.5">
          {/* Price (inline-editable) */}
          {editingField === 'price' ? (
            <input
              ref={inputRef}
              value={draftPrice}
              onChange={e => setDraftPrice(e.target.value.replace(/\D/g, ''))}
              onBlur={() => saveInline('price')}
              onKeyDown={e => {
                if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                if (e.key === 'Escape') { setDraftPrice(p.currentPrice?.toString() ?? ''); setEditingField(null); }
              }}
              placeholder="VND"
              className="w-24 text-xs font-semibold bg-[var(--dash-surface-hover)] border border-violet-500/50 rounded px-1.5 py-0.5 text-[var(--dash-text)] focus:outline-none focus:ring-1 focus:ring-violet-500/40 tabular-nums"
            />
          ) : (
            <span
              className="text-xs font-semibold text-[var(--dash-text-mute)] cursor-text hover:bg-[var(--dash-surface-hover)] rounded px-1 -mx-1"
              onClick={onInlineUpdate ? () => setEditingField('price') : undefined}
              title={onInlineUpdate ? 'Click để sửa giá' : undefined}
            >
              {formatPrice(p.currentPrice)}
            </span>
          )}
          {(link.clicks ?? 0) > 0 && <span className="text-[10px] text-[var(--dash-text-faint)]">{link.clicks} lượt click</span>}
          {link.Category && <span className="text-[10px] text-[var(--dash-text-faint)]">{link.Category.name}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        <button onClick={handleCopy} title="Copy link" className="p-1.5 rounded-md text-[var(--dash-text-dim)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-all cursor-pointer">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button onClick={() => onEdit(link)} title="Sửa chi tiết" className="p-1.5 rounded-md text-[var(--dash-text-dim)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-all cursor-pointer">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={link.isActiveOnBio ? "Ẩn" : "Hiện"}
          className={`p-1.5 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed ${link.isActiveOnBio ? "text-emerald-500 hover:bg-emerald-500/10" : "text-[var(--dash-text-dim)] hover:bg-[var(--dash-surface-hover)]"}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {link.isActiveOnBio ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
        </button>
        <button onClick={handleDelete} disabled={deleting} title="Xoá" className="p-1.5 rounded-md text-[var(--dash-text-faint)] hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:cursor-not-allowed">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <span className="text-[10px] text-[var(--dash-text-faint)] font-mono hidden lg:block shrink-0">/{link.shortCode}</span>
    </div>
  );
}

const ProductCard = memo(ProductCardInner, (prev, next) =>
  prev.link === next.link &&
  prev.index === next.index &&
  prev.userId === next.userId &&
  prev.selected === next.selected &&
  prev.selectionMode === next.selectionMode
);

export default ProductCard;
