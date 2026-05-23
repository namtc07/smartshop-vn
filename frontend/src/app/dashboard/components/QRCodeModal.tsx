'use client';

import { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface QRCodeModalProps {
  slug: string;
  avatarUrl: string | null;
  onClose: () => void;
}

export default function QRCodeModal({ slug, avatarUrl, onClose }: QRCodeModalProps) {
  const bioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}`
    : `https://smartshop.vn/${slug}`;

  const handleDownload = () => {
    const canvas = document.getElementById('qr-download-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-${slug}.png`;
    link.href = url;
    link.click();
  };

  const imageSettings = avatarUrl ? {
    src: avatarUrl,
    width: 36,
    height: 36,
    excavate: true,
  } : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-5 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div>
          <h2 className="text-sm font-semibold text-white text-center">QR Code Bio Link</h2>
          <p className="text-xs text-zinc-500 text-center mt-0.5">/{slug}</p>
        </div>

        {/* QR Code display */}
        <div className="p-4 bg-white rounded-2xl shadow-xl">
          <QRCodeSVG
            value={bioUrl}
            size={200}
            level="H"
            imageSettings={imageSettings}
            bgColor="#ffffff"
            fgColor="#1e1b4b"
          />
        </div>

        {/* Hidden canvas for download */}
        <div className="hidden">
          <QRCodeCanvas
            id="qr-download-canvas"
            value={bioUrl}
            size={512}
            level="H"
            imageSettings={imageSettings ? { ...imageSettings, width: 90, height: 90 } : undefined}
            bgColor="#ffffff"
            fgColor="#1e1b4b"
          />
        </div>

        <p className="text-[11px] text-zinc-500 text-center">{bioUrl}</p>

        <button
          onClick={handleDownload}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Tải xuống PNG
        </button>
      </div>
    </div>
  );
}
