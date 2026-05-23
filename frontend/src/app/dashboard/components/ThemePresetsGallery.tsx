'use client';

import { THEME_PRESETS, resolveTheme, getFontFamily, getBtnRadius, getAvatarRadius, getBgStyle, getPatternOverlay } from './themePresets';
import type { ThemeSettings } from './types';

interface ThemePresetsProps {
  current: ThemeSettings;
  onSelect: (preset: ThemeSettings) => void;
}

export default function ThemePresets({ current, onSelect }: ThemePresetsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {THEME_PRESETS.map(preset => {
        const t = resolveTheme(preset.theme);
        const bg = getBgStyle(t);
        const pattern = getPatternOverlay(t.bgPattern, t.bgPatternOpacity);
        const isActive = current.bgGradientFrom === preset.theme.bgGradientFrom
          && current.primaryColor === preset.theme.primaryColor
          && current.bgPattern === preset.theme.bgPattern;

        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.theme)}
            className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer hover:scale-[1.02] ${
              isActive
                ? 'border-violet-500 ring-2 ring-violet-500/40 shadow-lg shadow-violet-500/20'
                : 'border-[var(--dash-border)] hover:border-[var(--dash-border-strong)]'
            }`}
            title={preset.description}
          >
            {/* Preview area */}
            <div
              className="relative h-32 flex flex-col items-center justify-center gap-1.5 px-3 overflow-hidden"
              style={{ ...bg, fontFamily: getFontFamily(t.fontFamily) }}
            >
              {pattern && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: pattern,
                    backgroundSize: t.bgPattern === 'dots' ? '16px 16px' : t.bgPattern === 'grid' ? '24px 24px' : undefined,
                  }}
                />
              )}
              {/* Mini avatar */}
              <div
                className="relative w-7 h-7 flex items-center justify-center font-bold text-white text-xs shadow"
                style={{
                  borderRadius: getAvatarRadius(t.avatarShape),
                  backgroundColor: t.primaryColor,
                  boxShadow: t.avatarRing === 'glow' ? `0 0 12px ${t.primaryColor}` : undefined,
                }}
              >
                A
              </div>
              {/* Mini button */}
              <div
                className="relative w-16 h-2.5"
                style={{ backgroundColor: t.primaryColor, borderRadius: getBtnRadius(t.btnStyle) }}
              />
              <div
                className="relative w-16 h-2.5 opacity-60"
                style={{ backgroundColor: t.primaryColor, borderRadius: getBtnRadius(t.btnStyle) }}
              />

              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Label */}
            <div className="px-3 py-2 bg-[var(--dash-surface-solid)] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--dash-text)] truncate flex items-center gap-1">
                  <span className="text-sm">{preset.emoji}</span>
                  {preset.name}
                </p>
                <p className="text-[10px] text-[var(--dash-text-dim)] truncate">{preset.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
