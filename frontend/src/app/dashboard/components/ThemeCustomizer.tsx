'use client';

import { useState, useMemo } from 'react';
import type { ThemeSettings, UserProfile } from './types';
import ThemePresets from './ThemePresetsGallery';
import {
  resolveTheme, getFontFamily, getBtnRadius, getAvatarRadius, getSpacing,
  getBgStyle, getPatternOverlay, DEFAULT_THEME,
} from './themePresets';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ThemeCustomizerProps {
  profile: UserProfile;
  onSuccess: (updated: UserProfile) => void;
}

type Section = 'presets' | 'background' | 'colors' | 'typography' | 'layout' | 'effects';
type Device = 'mobile' | 'desktop';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'presets',    label: 'Mẫu sẵn',   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /> },
  { id: 'background', label: 'Nền',       icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { id: 'colors',     label: 'Màu sắc',    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /> },
  { id: 'typography', label: 'Font chữ',   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h12" /> },
  { id: 'layout',     label: 'Bố cục',     icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
  { id: 'effects',    label: 'Hiệu ứng',   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /> },
];

export default function ThemeCustomizer({ profile, onSuccess }: ThemeCustomizerProps) {
  const initial = useMemo(() => resolveTheme(profile.themeSettings), [profile.themeSettings]);
  const [theme, setTheme] = useState<ThemeSettings>(initial);
  const [section, setSection] = useState<Section>('presets');
  const [device, setDevice] = useState<Device>('mobile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const resolved = useMemo(() => resolveTheme(theme), [theme]);

  const update = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) =>
    setTheme(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${profile.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeSettings: theme }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onSuccess(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const reset = () => setTheme(DEFAULT_THEME);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 pb-8 items-start">
      {/* ── Controls ── */}
      <div className="flex flex-col gap-4 order-2 lg:order-1 min-w-0">
        {/* Section tabs */}
        <div className="flex gap-1 p-1 bg-[var(--dash-surface-solid)] rounded-xl border border-[var(--dash-border)] overflow-x-auto scrollbar-hide">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                section === s.id
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/15 text-violet-300 ring-1 ring-violet-500/30'
                  : 'text-[var(--dash-text-mute)] hover:text-[var(--dash-text)]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {s.icon}
              </svg>
              {s.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="glass-card rounded-xl p-5 min-h-[400px]">
          {section === 'presets' && (
            <SectionPresets theme={theme} onSelect={t => setTheme(prev => ({ ...prev, ...t }))} />
          )}
          {section === 'background' && (
            <SectionBackground theme={resolved} update={update} />
          )}
          {section === 'colors' && (
            <SectionColors theme={resolved} update={update} />
          )}
          {section === 'typography' && (
            <SectionTypography theme={resolved} update={update} />
          )}
          {section === 'layout' && (
            <SectionLayout theme={resolved} update={update} />
          )}
          {section === 'effects' && (
            <SectionEffects theme={resolved} update={update} />
          )}
        </div>

        {/* Save bar */}
        <div className="flex gap-2 sticky bottom-4 z-10">
          <button
            onClick={reset}
            className="px-4 py-3 rounded-xl bg-[var(--dash-surface-solid)] border border-[var(--dash-border)] hover:border-[var(--dash-border-strong)] text-[var(--dash-text-mute)] hover:text-[var(--dash-text)] text-sm font-medium transition-colors cursor-pointer"
            title="Khôi phục mặc định"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-violet-500/20"
          >
            {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu giao diện!' : 'Lưu giao diện'}
          </button>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-20">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-mute)]">Live preview</p>
          <div className="flex gap-1 p-0.5 bg-[var(--dash-surface-solid)] rounded-lg border border-[var(--dash-border)]">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded ${device === 'mobile' ? 'bg-violet-500/20 text-violet-300' : 'text-[var(--dash-text-dim)] hover:text-[var(--dash-text-mute)]'} transition-colors cursor-pointer`}
              title="Mobile"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded ${device === 'desktop' ? 'bg-violet-500/20 text-violet-300' : 'text-[var(--dash-text-dim)] hover:text-[var(--dash-text-mute)]'} transition-colors cursor-pointer`}
              title="Desktop"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <ThemePreviewCanvas theme={resolved} profile={profile} device={device} />

        <p className="text-[10px] text-[var(--dash-text-dim)] mt-3 text-center">
          ⌘ Click vào mẫu trên bên trái để áp dụng nhanh
        </p>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Live preview canvas
// ───────────────────────────────────────────────

function ThemePreviewCanvas({
  theme, profile, device,
}: {
  theme: ReturnType<typeof resolveTheme>;
  profile: UserProfile;
  device: Device;
}) {
  const bg = getBgStyle(theme);
  const pattern = getPatternOverlay(theme.bgPattern, theme.bgPatternOpacity);
  const isMobile = device === 'mobile';
  const sp = getSpacing(theme.spacing);

  const cardClass = (() => {
    switch (theme.cardStyle) {
      case 'glass':    return 'bg-white/10 backdrop-blur-sm border border-white/15';
      case 'solid':    return 'bg-white/20 border border-white/10';
      case 'outline':  return 'bg-transparent border-2 border-white/30';
      case 'minimal':  return 'bg-transparent border-b border-white/10 rounded-none';
      case 'shadow':   return 'bg-white/15 border border-white/10 shadow-lg shadow-black/30';
      default:         return 'bg-white/10 border border-white/15';
    }
  })();

  const wrapperClass = isMobile
    ? 'phone-frame w-[280px] mx-auto'
    : 'rounded-xl border border-[var(--dash-border)] overflow-hidden';

  const screenStyle: React.CSSProperties = isMobile
    ? { ...bg, height: 540, fontFamily: getFontFamily(theme.fontFamily), color: theme.textColor }
    : { ...bg, minHeight: 540, fontFamily: getFontFamily(theme.fontFamily), color: theme.textColor };

  const layoutCls = theme.layout === 'left' ? 'items-start text-left' : 'items-center text-center';

  return (
    <div className={wrapperClass}>
      {isMobile && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black z-20" />
      )}
      <div
        className={`relative ${isMobile ? 'rounded-[2rem]' : ''} overflow-hidden`}
        style={screenStyle}
      >
        {pattern && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: pattern,
              backgroundSize: theme.bgPattern === 'dots' ? '16px 16px' : theme.bgPattern === 'grid' ? '24px 24px' : undefined,
            }}
          />
        )}

        <div
          className={`relative ${isMobile ? 'pt-10' : 'pt-6'} overflow-y-auto h-full scrollbar-hide flex flex-col ${layoutCls} px-5`}
          style={{ gap: sp.gap }}
        >
          {/* Avatar */}
          <div
            className="relative flex items-center justify-center font-bold text-white shrink-0"
            style={{
              width: 72,
              height: 72,
              fontSize: 24,
              borderRadius: getAvatarRadius(theme.avatarShape),
              backgroundColor: theme.primaryColor,
              boxShadow:
                theme.avatarRing === 'glow' ? `0 0 25px ${theme.primaryColor}` :
                theme.avatarRing === 'gradient' ? `0 0 0 3px transparent, 0 0 0 5px ${theme.secondaryColor}` :
                theme.avatarRing === 'solid' ? `0 0 0 3px rgba(255,255,255,0.3)` :
                undefined,
            }}
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" style={{ borderRadius: getAvatarRadius(theme.avatarShape) }} />
            ) : (
              (profile.displayName || profile.bioPageSlug).charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex flex-col" style={{ gap: 2, alignItems: theme.layout === 'left' ? 'flex-start' : 'center' }}>
            <p className="font-bold text-base" style={{ color: theme.textColor }}>
              {profile.displayName || profile.bioPageSlug}
            </p>
            <p className="text-xs opacity-70">@{profile.bioPageSlug}</p>
            {profile.bio && <p className="text-xs opacity-60 mt-1 max-w-xs leading-snug">{profile.bio}</p>}
          </div>

          {/* Sample buttons */}
          {[1, 2, 3].map((i, idx) => (
            <button
              key={i}
              className={`w-full max-w-[260px] flex items-center gap-3 transition-transform ${
                theme.hoverEffect === 'lift' ? 'hover:-translate-y-0.5' :
                theme.hoverEffect === 'scale' ? 'hover:scale-[1.02]' : ''
              } ${cardClass}`}
              style={{
                borderRadius: theme.cardStyle === 'minimal' ? '0' : getBtnRadius(theme.btnStyle),
                padding: sp.padding,
                opacity: 1 - idx * 0.15,
              }}
            >
              <div
                className="w-10 h-10 shrink-0 flex items-center justify-center text-sm"
                style={{ borderRadius: getBtnRadius(theme.btnStyle), backgroundColor: theme.secondaryColor }}
              >
                {i === 1 ? '🛍️' : i === 2 ? '🎵' : '✨'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold leading-tight truncate">Sản phẩm mẫu #{i}</p>
                <p className="text-[10px] opacity-70 mt-0.5">299.000 ₫</p>
              </div>
              <div className="text-xs font-bold shrink-0" style={{ color: theme.primaryColor }}>→</div>
            </button>
          ))}

          <div className="text-center text-[10px] opacity-50 mt-2">Powered by SmartShop</div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────
// Sections
// ───────────────────────────────────────────────

function SectionPresets({ theme, onSelect }: { theme: ThemeSettings; onSelect: (t: ThemeSettings) => void }) {
  return (
    <div>
      <SectionHeader title="Mẫu giao diện" subtitle="Chọn 1 trong 10 mẫu được thiết kế sẵn để bắt đầu" />
      <ThemePresets current={theme} onSelect={onSelect} />
    </div>
  );
}

function SectionBackground({
  theme, update,
}: {
  theme: ReturnType<typeof resolveTheme>;
  update: <K extends keyof ThemeSettings>(k: K, v: ThemeSettings[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Nền trang" subtitle="Tuỳ chỉnh background của bio page" />

      <Field label="Kiểu nền">
        <ChipGroup
          value={theme.bgType}
          onChange={v => update('bgType', v as ThemeSettings['bgType'])}
          options={[
            { value: 'solid',    label: 'Màu đặc' },
            { value: 'gradient', label: 'Gradient' },
          ]}
        />
      </Field>

      {theme.bgType === 'solid' && (
        <Field label="Màu nền">
          <ColorPicker value={theme.bgColor} onChange={v => update('bgColor', v)} />
        </Field>
      )}

      {theme.bgType === 'gradient' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Màu đầu">
              <ColorPicker value={theme.bgGradientFrom} onChange={v => update('bgGradientFrom', v)} />
            </Field>
            <Field label="Màu cuối">
              <ColorPicker value={theme.bgGradientTo} onChange={v => update('bgGradientTo', v)} />
            </Field>
          </div>
          <Field label={`Góc gradient: ${theme.bgGradientAngle}°`}>
            <input
              type="range"
              min={0}
              max={360}
              value={theme.bgGradientAngle}
              onChange={e => update('bgGradientAngle', Number(e.target.value))}
              className="w-full accent-violet-500"
            />
          </Field>
        </>
      )}

      <Field label="Hoạ tiết (pattern)">
        <ChipGroup
          value={theme.bgPattern}
          onChange={v => update('bgPattern', v as ThemeSettings['bgPattern'])}
          options={[
            { value: 'none',  label: 'Không' },
            { value: 'dots',  label: 'Chấm tròn' },
            { value: 'grid',  label: 'Lưới' },
            { value: 'waves', label: 'Sóng' },
            { value: 'noise', label: 'Nhiễu' },
            { value: 'mesh',  label: 'Mesh' },
          ]}
        />
      </Field>

      {theme.bgPattern !== 'none' && (
        <Field label={`Độ đậm pattern: ${theme.bgPatternOpacity}%`}>
          <input
            type="range"
            min={5}
            max={60}
            value={theme.bgPatternOpacity}
            onChange={e => update('bgPatternOpacity', Number(e.target.value))}
            className="w-full accent-violet-500"
          />
        </Field>
      )}
    </div>
  );
}

function SectionColors({
  theme, update,
}: {
  theme: ReturnType<typeof resolveTheme>;
  update: <K extends keyof ThemeSettings>(k: K, v: ThemeSettings[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Bảng màu" subtitle="Màu chính cho nút bấm, accent và chữ" />

      <Field label="Màu chính (primary)">
        <ColorPicker value={theme.primaryColor} onChange={v => { update('primaryColor', v); update('btnColor', v); }} />
      </Field>

      <Field label="Màu phụ (secondary / accent icon)">
        <ColorPicker value={theme.secondaryColor} onChange={v => update('secondaryColor', v)} />
      </Field>

      <Field label="Màu chữ">
        <ColorPicker value={theme.textColor} onChange={v => update('textColor', v)} />
      </Field>

      <div className="rounded-lg bg-[var(--dash-surface-hover)] p-3 flex items-center gap-3">
        <span className="text-lg">💡</span>
        <div>
          <p className="text-[11px] font-semibold text-[var(--dash-text-soft)]">Mẹo phối màu</p>
          <p className="text-[10px] text-[var(--dash-text-dim)] mt-0.5">Primary nên nổi bật với nền. Secondary là màu accent dùng cho icon, badge.</p>
        </div>
      </div>
    </div>
  );
}

function SectionTypography({
  theme, update,
}: {
  theme: ReturnType<typeof resolveTheme>;
  update: <K extends keyof ThemeSettings>(k: K, v: ThemeSettings[K]) => void;
}) {
  const fonts: { value: ThemeSettings['fontFamily']; label: string; preview: string }[] = [
    { value: 'system',        label: 'System UI', preview: 'Aa' },
    { value: 'inter',         label: 'Inter',     preview: 'Aa' },
    { value: 'poppins',       label: 'Poppins',   preview: 'Aa' },
    { value: 'manrope',       label: 'Manrope',   preview: 'Aa' },
    { value: 'jakarta',       label: 'Jakarta',   preview: 'Aa' },
    { value: 'space-grotesk', label: 'Space Grotesk', preview: 'Aa' },
    { value: 'playfair',      label: 'Playfair',  preview: 'Aa' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Font chữ" subtitle="Chọn typography cho bio page" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {fonts.map(f => (
          <button
            key={f.value}
            onClick={() => update('fontFamily', f.value)}
            className={`flex flex-col items-start gap-1 p-3 rounded-lg border transition-all cursor-pointer ${
              theme.fontFamily === f.value
                ? 'border-violet-500/50 bg-violet-500/10'
                : 'border-[var(--dash-border)] hover:border-[var(--dash-border-strong)]'
            }`}
            style={{ fontFamily: getFontFamily(f.value) }}
          >
            <span className="text-3xl font-bold text-[var(--dash-text)]">{f.preview}</span>
            <span className="text-xs font-semibold text-[var(--dash-text-soft)]">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionLayout({
  theme, update,
}: {
  theme: ReturnType<typeof resolveTheme>;
  update: <K extends keyof ThemeSettings>(k: K, v: ThemeSettings[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Bố cục & spacing" subtitle="Hình dạng card, avatar và khoảng cách" />

      <Field label="Kiểu nút">
        <ChipGroup
          value={theme.btnStyle}
          onChange={v => update('btnStyle', v as ThemeSettings['btnStyle'])}
          options={[
            { value: 'rounded', label: 'Bo tròn' },
            { value: 'pill',    label: 'Viên thuốc' },
            { value: 'square',  label: 'Vuông' },
          ]}
        />
      </Field>

      <Field label="Kiểu card">
        <ChipGroup
          value={theme.cardStyle}
          onChange={v => update('cardStyle', v as ThemeSettings['cardStyle'])}
          options={[
            { value: 'glass',   label: 'Glass' },
            { value: 'solid',   label: 'Solid' },
            { value: 'outline', label: 'Outline' },
            { value: 'minimal', label: 'Minimal' },
            { value: 'shadow',  label: 'Shadow' },
          ]}
        />
      </Field>

      <Field label="Hình avatar">
        <ChipGroup
          value={theme.avatarShape}
          onChange={v => update('avatarShape', v as ThemeSettings['avatarShape'])}
          options={[
            { value: 'circle',   label: 'Tròn' },
            { value: 'squircle', label: 'Bo vừa' },
            { value: 'square',   label: 'Vuông' },
          ]}
        />
      </Field>

      <Field label="Viền avatar">
        <ChipGroup
          value={theme.avatarRing}
          onChange={v => update('avatarRing', v as ThemeSettings['avatarRing'])}
          options={[
            { value: 'none',     label: 'Không' },
            { value: 'solid',    label: 'Đơn sắc' },
            { value: 'gradient', label: 'Gradient' },
            { value: 'glow',     label: 'Toả sáng' },
          ]}
        />
      </Field>

      <Field label="Căn lề">
        <ChipGroup
          value={theme.layout}
          onChange={v => update('layout', v as ThemeSettings['layout'])}
          options={[
            { value: 'centered', label: 'Giữa' },
            { value: 'left',     label: 'Trái' },
          ]}
        />
      </Field>

      <Field label="Mật độ">
        <ChipGroup
          value={theme.spacing}
          onChange={v => update('spacing', v as ThemeSettings['spacing'])}
          options={[
            { value: 'compact',  label: 'Sát' },
            { value: 'normal',   label: 'Vừa' },
            { value: 'spacious', label: 'Thoáng' },
          ]}
        />
      </Field>
    </div>
  );
}

function SectionEffects({
  theme, update,
}: {
  theme: ReturnType<typeof resolveTheme>;
  update: <K extends keyof ThemeSettings>(k: K, v: ThemeSettings[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader title="Hiệu ứng" subtitle="Animation và tương tác" />

      <Field label="Animation khi load">
        <ChipGroup
          value={theme.animation}
          onChange={v => update('animation', v as ThemeSettings['animation'])}
          options={[
            { value: 'none',  label: 'Không' },
            { value: 'fade',  label: 'Fade' },
            { value: 'slide', label: 'Slide' },
            { value: 'pop',   label: 'Pop' },
          ]}
        />
      </Field>

      <Field label="Hover effect">
        <ChipGroup
          value={theme.hoverEffect}
          onChange={v => update('hoverEffect', v as ThemeSettings['hoverEffect'])}
          options={[
            { value: 'none',  label: 'Không' },
            { value: 'lift',  label: 'Nhô lên' },
            { value: 'glow',  label: 'Toả sáng' },
            { value: 'scale', label: 'Phóng to' },
          ]}
        />
      </Field>
    </div>
  );
}

// ───────────────────────────────────────────────
// Reusable controls
// ───────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-[var(--dash-text)]">{title}</h3>
      <p className="text-xs text-[var(--dash-text-dim)] mt-0.5">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[var(--dash-text-mute)] mb-2 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--dash-border)] bg-transparent"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] rounded-lg px-3 py-2 text-sm text-[var(--dash-text)] font-mono focus:outline-none focus:border-violet-500/50"
      />
    </div>
  );
}

function ChipGroup<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            value === opt.value
              ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
              : 'border-[var(--dash-border)] bg-[var(--dash-surface-hover)] text-[var(--dash-text-mute)] hover:border-[var(--dash-border-strong)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
