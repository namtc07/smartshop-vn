'use client';

import { useState } from 'react';

interface ExtensionConnectModalProps {
  slug: string;
  userId: string;
  onClose: () => void;
}

export default function ExtensionConnectModal({ slug, userId, onClose }: ExtensionConnectModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const fields = [
    { key: 'slug', label: 'Slug', value: slug },
    { key: 'userId', label: 'User ID', value: userId },
    { key: 'apiUrl', label: 'API URL', value: apiUrl },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Kết nối Chrome Extension</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Copy thông tin vào extension</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Steps */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <svg className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-violet-300 leading-relaxed">
              Mở extension → nhập từng trường bên dưới vào form đăng nhập.
            </p>
          </div>

          {/* Fields */}
          {fields.map(({ key, label, value }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">{label}</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono truncate">
                  {value}
                </div>
                <button
                  onClick={() => copy(value, key)}
                  className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    copied === key
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                  }`}
                >
                  {copied === key ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ))}

          <div className="border-t border-zinc-800 pt-3 flex flex-col gap-1.5">
            <p className="text-[11px] text-zinc-600 font-medium uppercase tracking-wide">Hướng dẫn cài extension</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Chrome → <code className="text-zinc-400">chrome://extensions</code> → bật <strong className="text-zinc-300">Developer mode</strong> → <strong className="text-zinc-300">Load unpacked</strong> → chọn thư mục <code className="text-zinc-400">extension/</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
