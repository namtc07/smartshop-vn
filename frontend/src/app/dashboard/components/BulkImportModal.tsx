'use client';

import { useState, useRef } from 'react';
import { toast } from './Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BulkRow {
  name: string;
  platform: string;
  originalUrl: string;
  affiliateDeepLink: string;
  currentPrice: string;
  imageUrl: string;
}

interface BulkImportModalProps {
  userId: string;
  slug: string;
  onSuccess: () => void;
  onClose: () => void;
}

function parseCSV(text: string): BulkRow[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  // Skip header row
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    return {
      name: cols[0] || '',
      platform: cols[1] || 'Shopee',
      originalUrl: cols[2] || '',
      affiliateDeepLink: cols[3] || '',
      currentPrice: cols[4] || '',
      imageUrl: cols[5] || '',
    };
  }).filter(r => r.name && r.originalUrl && r.affiliateDeepLink);
}

const TEMPLATE = `name,platform,originalUrl,affiliateDeepLink,currentPrice,imageUrl
Kem dưỡng da ban đêm,Shopee,https://shopee.vn/...,https://s.shopee.vn/...,320000,https://...
Son môi đỏ cherry,TikTok Shop,https://tiktok.com/...,https://tiktok.com/...,150000,`;

export default function BulkImportModal({ userId, slug, onSuccess, onClose }: BulkImportModalProps) {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    const errors: string[] = [];
    let done = 0;
    setProgress({ done: 0, total: rows.length, errors: [] });

    for (const row of rows) {
      try {
        const res = await fetch(`${API_URL}/api/links/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            platform: row.platform,
            originalUrl: row.originalUrl,
            name: row.name,
            imageUrl: row.imageUrl || null,
            currentPrice: row.currentPrice ? parseFloat(row.currentPrice) : null,
            affiliateDeepLink: row.affiliateDeepLink,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) errors.push(`"${row.name}": ${json.message}`);
      } catch {
        errors.push(`"${row.name}": Lỗi kết nối`);
      }
      done++;
      setProgress({ done, total: rows.length, errors: [...errors] });
    }

    setImporting(false);
    if (errors.length === 0) {
      toast.success(`Đã import thành công ${rows.length} sản phẩm!`);
      onSuccess();
      onClose();
    } else {
      toast.error(`${done - errors.length}/${rows.length} thành công. ${errors.length} lỗi.`);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartshop-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Import sản phẩm từ CSV</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Thêm nhiều sản phẩm cùng lúc</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Step 1: Download template */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/60">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-300 mb-1">Tải file mẫu CSV</p>
              <button onClick={downloadTemplate} className="text-xs text-violet-400 hover:text-violet-300 underline cursor-pointer">
                Tải smartshop-template.csv
              </button>
              <p className="text-[10px] text-zinc-600 mt-1">Các cột: name, platform, originalUrl, affiliateDeepLink, currentPrice, imageUrl</p>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/60">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-zinc-300 mb-2">Upload file CSV đã điền</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-xs font-medium transition-all cursor-pointer"
              >
                Chọn file CSV
              </button>
            </div>
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-300 mb-2">
                Xem trước — <span className="text-violet-400">{rows.length} sản phẩm</span>
              </p>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-800 divide-y divide-zinc-800">
                {rows.map((row, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      row.platform?.toLowerCase() === 'shopee' ? 'text-orange-400 bg-orange-500/10' : 'text-sky-400 bg-sky-500/10'
                    }`}>{row.platform}</span>
                    <span className="text-xs text-zinc-300 flex-1 truncate">{row.name}</span>
                    {row.currentPrice && <span className="text-xs text-zinc-500 shrink-0">{Number(row.currentPrice).toLocaleString('vi-VN')}đ</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Đang import...</span>
                <span>{progress.done}/{progress.total}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div
                  className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              {progress.errors.length > 0 && (
                <div className="text-[10px] text-red-400 space-y-0.5 max-h-20 overflow-y-auto">
                  {progress.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white text-sm font-medium transition-all cursor-pointer">Huỷ</button>
            <button
              onClick={handleImport}
              disabled={importing || rows.length === 0}
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold transition-all cursor-pointer"
            >
              {importing ? `Đang import (${progress?.done}/${progress?.total})...` : `Import ${rows.length > 0 ? `${rows.length} sản phẩm` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
