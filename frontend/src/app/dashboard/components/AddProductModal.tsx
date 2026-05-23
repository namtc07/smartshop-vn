'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AddForm, EMPTY_FORM, Category } from './types';
import { toast } from './Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AddProductModalProps {
  userId: string;
  slug: string;
  categories: Category[];
  initialUrl?: string;
  onSuccess: () => void;
  onClose: () => void;
}

interface MetadataResult {
  name: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  platform: 'Shopee' | 'TikTok Shop' | 'Lazada' | null;
  originalUrl: string;
  blocked?: boolean;
  note?: string | null;
}

const URL_RE = /^https?:\/\/\S+$/i;

export default function AddProductModal({ userId, slug, categories, initialUrl, onSuccess, onClose }: AddProductModalProps) {
  const [form, setForm] = useState<AddForm>(() => {
    if (initialUrl) {
      const platform: AddForm['platform'] = initialUrl.toLowerCase().includes('tiktok') ? 'TikTok Shop' : 'Shopee';
      return { ...EMPTY_FORM, originalUrl: initialUrl, platform };
    }
    return EMPTY_FORM;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [autoFilling, setAutoFilling] = useState(false);
  const [filledFields, setFilledFields] = useState<Set<string>>(new Set());
  const [scrapeNote, setScrapeNote] = useState<string | null>(null);
  const lastScrapedRef = useRef<string>('');

  const fillFromMetadata = useCallback((meta: MetadataResult) => {
    const filled = new Set<string>();
    setForm(prev => {
      const next = { ...prev };
      if (meta.originalUrl && !prev.originalUrl) {
        next.originalUrl = meta.originalUrl;
        filled.add('originalUrl');
      }
      if (meta.name && !prev.name.trim()) {
        next.name = meta.name;
        filled.add('name');
      }
      if (meta.imageUrl && !prev.imageUrl.trim()) {
        next.imageUrl = meta.imageUrl;
        filled.add('imageUrl');
      }
      if (meta.currentPrice != null && !prev.currentPrice) {
        next.currentPrice = String(Math.round(meta.currentPrice));
        filled.add('currentPrice');
      }
      if (meta.platform && (meta.platform === 'Shopee' || meta.platform === 'TikTok Shop')) {
        next.platform = meta.platform;
        filled.add('platform');
      }
      // Pre-fill affiliate deep link with originalUrl as a starting point
      // (user can replace with their actual affiliate link)
      if (meta.originalUrl && !prev.affiliateDeepLink.trim()) {
        next.affiliateDeepLink = meta.originalUrl;
        filled.add('affiliateDeepLink');
      }
      return next;
    });
    setFilledFields(filled);
    setTimeout(() => setFilledFields(new Set()), 2500);
  }, []);

  const scrapeMetadata = useCallback(async (url: string, opts?: { silent?: boolean }) => {
    if (!URL_RE.test(url.trim()) || lastScrapedRef.current === url.trim()) return;
    lastScrapedRef.current = url.trim();
    setAutoFilling(true);
    setScrapeNote(null);
    try {
      const res = await fetch(`${API_URL}/api/links/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Không lấy được thông tin sản phẩm.');
      const data: MetadataResult = json.data;
      fillFromMetadata(data);

      // Always pre-fill original URL & platform even when scrape "blocked"
      if (data.blocked && data.note) {
        setScrapeNote(data.note);
      }

      if (!opts?.silent) {
        const got = [
          data.name && 'tên',
          data.imageUrl && 'ảnh',
          data.currentPrice != null && 'giá',
        ].filter(Boolean).join(', ');
        if (got) toast.success(`Đã tự fill: ${got}`);
        else if (data.blocked) toast.info('Trang chặn auto-fill — nhập tay nhé.');
        else toast.info('Không trích xuất được thông tin từ trang này.');
      }
    } catch (err: unknown) {
      if (!opts?.silent) toast.error(err instanceof Error ? err.message : 'Không lấy được thông tin.');
    } finally {
      setAutoFilling(false);
    }
  }, [fillFromMetadata]);

  // Auto-scrape when modal opens with initialUrl
  useEffect(() => {
    if (initialUrl && URL_RE.test(initialUrl)) {
      scrapeMetadata(initialUrl, { silent: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.originalUrl.trim() || !form.name.trim() || !form.affiliateDeepLink.trim()) {
      setError('Vui lòng điền đủ các trường bắt buộc.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/links/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: form.platform,
          originalUrl: form.originalUrl.trim(),
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || null,
          currentPrice: form.currentPrice ? parseFloat(form.currentPrice) : null,
          affiliateDeepLink: form.affiliateDeepLink.trim(),
          isFeatured: form.isFeatured,
          badgeText: form.badgeText.trim() || null,
          videoUrl: form.videoUrl.trim() || null,
          categoryId: form.categoryId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Thêm sản phẩm thất bại.');

      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (URL_RE.test(text.trim())) {
        setForm(f => ({ ...f, originalUrl: text.trim() }));
        scrapeMetadata(text.trim());
      } else {
        toast.error('Clipboard không chứa URL hợp lệ.');
      }
    } catch {
      toast.error('Không đọc được clipboard.');
    }
  };

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all";
  const filledClass = "border-emerald-500/40 ring-1 ring-emerald-500/20";
  const labelClass = "block text-xs font-medium text-zinc-400 mb-2";

  const fieldClass = (name: string) =>
    filledFields.has(name) ? `${inputClass} ${filledClass}` : inputClass;

  const FilledBadge = ({ name }: { name: string }) =>
    filledFields.has(name) ? (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 ml-1 animate-fade-in">
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        ĐÃ FILL
      </span>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Thêm sản phẩm</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Sẽ hiển thị trên trang <span className="text-zinc-400">/{slug}</span></p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* ✨ Auto-fill banner */}
          <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">✨</span>
              <p className="text-xs font-bold text-violet-300">Dán link → Tự fill thông tin</p>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.originalUrl}
                onChange={e => setForm(f => ({ ...f, originalUrl: e.target.value }))}
                onPaste={e => {
                  const pasted = e.clipboardData.getData('text').trim();
                  if (URL_RE.test(pasted)) {
                    // give the input a tick to apply the paste, then scrape
                    setTimeout(() => scrapeMetadata(pasted), 50);
                  }
                }}
                placeholder="Dán link Shopee / TikTok Shop..."
                className={`flex-1 bg-zinc-900/70 border border-violet-500/20 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all`}
              />
              <button
                type="button"
                onClick={() => form.originalUrl ? scrapeMetadata(form.originalUrl) : handlePasteUrl()}
                disabled={autoFilling}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-violet-500/20 shrink-0"
              >
                {autoFilling ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang fill...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {form.originalUrl ? 'Tự fill' : 'Dán & fill'}
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5">Tự động lấy tên, ảnh, giá từ trang sản phẩm. Affiliate link sẽ pre-fill = link gốc, bạn đổi sang link affiliate riêng nếu có.</p>

            {scrapeNote && (
              <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[10px] text-amber-300/90 leading-snug">{scrapeNote}</p>
              </div>
            )}
          </div>

          {/* Platform */}
          <div>
            <label className={labelClass}>Nền tảng <FilledBadge name="platform" /></label>
            <div className="flex gap-2">
              {(['Shopee', 'TikTok Shop'] as const).map(pl => (
                <button key={pl} type="button" onClick={() => setForm(f => ({ ...f, platform: pl }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                    form.platform === pl
                      ? pl === 'Shopee' ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' : 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {pl === 'Shopee' ? '🛍' : '🎵'} {pl}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelClass}>Tên sản phẩm <span className="text-red-500">*</span><FilledBadge name="name" /></label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Kem dưỡng da ban đêm Pro-X..." className={fieldClass('name')} />
          </div>

          {/* Affiliate Deep Link */}
          <div>
            <label className={labelClass}>Affiliate Deep Link <span className="text-red-500">*</span><FilledBadge name="affiliateDeepLink" /></label>
            <input type="url" value={form.affiliateDeepLink} onChange={e => setForm(f => ({ ...f, affiliateDeepLink: e.target.value }))} placeholder="https://s.shopee.vn/affiliate/..." className={fieldClass('affiliateDeepLink')} />
            <p className="text-[11px] text-zinc-600 mt-1">
              {filledFields.has('affiliateDeepLink')
                ? '⚠ Đang dùng link gốc. Đổi sang link affiliate của bạn để được hoa hồng.'
                : 'Link affiliate có tracking của bạn'}
            </p>
          </div>

          {/* Price + Image */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Giá (VND) <FilledBadge name="currentPrice" /></label>
              <input type="number" value={form.currentPrice} onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} placeholder="320000" min="0" className={fieldClass('currentPrice')} />
            </div>
            <div>
              <label className={labelClass}>URL ảnh <FilledBadge name="imageUrl" /></label>
              <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className={fieldClass('imageUrl')} />
            </div>
          </div>

          {/* Image preview */}
          {form.imageUrl && URL_RE.test(form.imageUrl) && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/40 border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="preview" className="w-14 h-14 rounded-lg object-cover bg-zinc-700" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold">Preview ảnh</p>
                <p className="text-[11px] text-zinc-400 truncate font-mono">{form.imageUrl}</p>
              </div>
            </div>
          )}

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer w-fit"
          >
            <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Tùy chọn nâng cao
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-3 bg-zinc-800/30 rounded-xl p-3 border border-zinc-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-300">Sản phẩm nổi bật</p>
                <button type="button" onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isFeatured ? 'bg-violet-600' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div>
                <label className={labelClass}>Badge (ví dụ: &quot;Sale 50%&quot;)</label>
                <input type="text" value={form.badgeText} onChange={e => setForm(f => ({ ...f, badgeText: e.target.value }))} placeholder="Flash Sale, Hot Deal..." maxLength={20} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>URL Video Review</label>
                <input type="url" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className={inputClass} />
              </div>
              {categories.length > 0 && (
                <div>
                  <label className={labelClass}>Danh mục</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inputClass}>
                    <option value="">— Không có danh mục —</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">{error}</p>}
          {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">✓ Thêm thành công! Đang cập nhật danh sách...</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all cursor-pointer">Huỷ</button>
            <button type="submit" disabled={submitting || success} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all cursor-pointer">
              {submitting ? 'Đang thêm...' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
