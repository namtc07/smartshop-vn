'use client';

import type { ReactNode } from 'react';

interface EmptyStateProps {
  illustration: 'products' | 'analytics' | 'search';
  title: string;
  description: string;
  action?: ReactNode;
}

const ILLUSTRATIONS: Record<EmptyStateProps['illustration'], ReactNode> = {
  products: (
    <svg viewBox="0 0 240 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ill-prod-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(139 92 246 / 0.2)" />
          <stop offset="100%" stopColor="rgb(236 72 153 / 0.1)" />
        </linearGradient>
        <linearGradient id="ill-prod-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(139 92 246 / 0.6)" />
          <stop offset="100%" stopColor="rgb(124 58 237 / 0.4)" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="90" r="80" fill="url(#ill-prod-bg)" />
      {/* Floating cards */}
      <g transform="translate(60 50)" opacity="0.6">
        <rect width="60" height="80" rx="10" fill="url(#ill-prod-card)" />
        <rect x="8" y="8" width="44" height="32" rx="4" fill="rgb(255 255 255 / 0.15)" />
        <rect x="8" y="50" width="32" height="4" rx="2" fill="rgb(255 255 255 / 0.4)" />
        <rect x="8" y="60" width="20" height="4" rx="2" fill="rgb(255 255 255 / 0.25)" />
      </g>
      <g transform="translate(135 35) rotate(8 30 40)">
        <rect width="60" height="80" rx="10" fill="url(#ill-prod-card)" />
        <rect x="8" y="8" width="44" height="32" rx="4" fill="rgb(255 255 255 / 0.15)" />
        <rect x="8" y="50" width="32" height="4" rx="2" fill="rgb(255 255 255 / 0.4)" />
        <rect x="8" y="60" width="20" height="4" rx="2" fill="rgb(255 255 255 / 0.25)" />
      </g>
      {/* Plus icon center */}
      <circle cx="120" cy="90" r="22" fill="rgb(139 92 246)" />
      <path d="M120 80v20M110 90h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* Sparkles */}
      <g fill="rgb(244 114 182)">
        <circle cx="40" cy="40" r="2" />
        <circle cx="200" cy="50" r="3" />
        <circle cx="50" cy="140" r="2" />
        <circle cx="190" cy="135" r="2.5" />
      </g>
    </svg>
  ),

  analytics: (
    <svg viewBox="0 0 240 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ill-ana-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(56 189 248 / 0.2)" />
          <stop offset="100%" stopColor="rgb(139 92 246 / 0.1)" />
        </linearGradient>
        <linearGradient id="ill-ana-line" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgb(139 92 246 / 0)" />
          <stop offset="100%" stopColor="rgb(139 92 246 / 0.4)" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="200" height="140" rx="14" fill="url(#ill-ana-bg)" stroke="rgb(139 92 246 / 0.25)" />
      {/* Bars */}
      {[
        { x: 40, h: 50 },
        { x: 70, h: 80 },
        { x: 100, h: 30 },
        { x: 130, h: 95 },
        { x: 160, h: 65 },
        { x: 190, h: 40 },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={140 - b.h} width="18" height={b.h} rx="3" fill="rgb(139 92 246)" opacity={0.4 + i * 0.1} />
      ))}
      {/* Trend line */}
      <path d="M 50 120 Q 80 90, 105 100 T 165 60 T 200 80" stroke="rgb(244 114 182)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Dots */}
      <circle cx="50" cy="120" r="4" fill="rgb(244 114 182)" />
      <circle cx="200" cy="80" r="4" fill="rgb(244 114 182)" />
    </svg>
  ),

  search: (
    <svg viewBox="0 0 240 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ill-search-bg">
          <stop offset="0%" stopColor="rgb(139 92 246 / 0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="90" r="80" fill="url(#ill-search-bg)" />
      <circle cx="105" cy="80" r="38" fill="none" stroke="rgb(139 92 246 / 0.7)" strokeWidth="6" />
      <line x1="135" y1="108" x2="165" y2="138" stroke="rgb(139 92 246 / 0.7)" strokeWidth="8" strokeLinecap="round" />
      <path d="M 90 75 Q 105 65, 120 75" stroke="rgb(244 114 182)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="93" cy="73" r="2" fill="rgb(244 114 182)" />
      <circle cx="117" cy="73" r="2" fill="rgb(244 114 182)" />
    </svg>
  ),
};

export default function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 animate-fade-in">
      <div className="w-48 h-36 mb-4">{ILLUSTRATIONS[illustration]}</div>
      <h3 className="text-sm font-bold text-[var(--dash-text)]">{title}</h3>
      <p className="text-xs text-[var(--dash-text-dim)] mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
