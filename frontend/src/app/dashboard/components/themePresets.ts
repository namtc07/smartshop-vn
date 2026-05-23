import type { ThemeSettings } from './types';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  theme: ThemeSettings;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Tím đêm sâu lắng',
    emoji: '🌙',
    theme: {
      bgType: 'gradient',
      bgGradientFrom: '#0f0c29',
      bgGradientTo: '#302b63',
      bgGradientAngle: 135,
      bgPattern: 'none',
      primaryColor: '#a78bfa',
      secondaryColor: '#f0abfc',
      btnStyle: 'rounded',
      cardStyle: 'glass',
      avatarShape: 'circle',
      avatarRing: 'gradient',
      layout: 'centered',
      spacing: 'normal',
      fontFamily: 'inter',
      animation: 'fade',
      hoverEffect: 'lift',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Hoàng hôn cam hồng',
    emoji: '🌅',
    theme: {
      bgType: 'gradient',
      bgGradientFrom: '#ff6e7f',
      bgGradientTo: '#bfe9ff',
      bgGradientAngle: 160,
      bgPattern: 'noise',
      bgPatternOpacity: 15,
      primaryColor: '#dc2626',
      secondaryColor: '#fbbf24',
      btnStyle: 'pill',
      cardStyle: 'glass',
      avatarShape: 'circle',
      avatarRing: 'glow',
      layout: 'centered',
      spacing: 'normal',
      fontFamily: 'poppins',
      animation: 'slide',
      hoverEffect: 'lift',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Trắng tinh khôi',
    emoji: '⚪',
    theme: {
      bgType: 'solid',
      bgColor: '#fafafa',
      bgPattern: 'none',
      primaryColor: '#18181b',
      secondaryColor: '#71717a',
      textColor: '#18181b',
      btnStyle: 'square',
      cardStyle: 'outline',
      avatarShape: 'square',
      avatarRing: 'none',
      layout: 'left',
      spacing: 'spacious',
      fontFamily: 'inter',
      animation: 'fade',
      hoverEffect: 'none',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Xanh biển mơ màng',
    emoji: '🌊',
    theme: {
      bgType: 'gradient',
      bgGradientFrom: '#0c1f33',
      bgGradientTo: '#1e3a5f',
      bgGradientAngle: 180,
      bgPattern: 'waves',
      bgPatternOpacity: 20,
      primaryColor: '#06b6d4',
      secondaryColor: '#7dd3fc',
      btnStyle: 'rounded',
      cardStyle: 'glass',
      avatarShape: 'circle',
      avatarRing: 'solid',
      layout: 'centered',
      spacing: 'normal',
      fontFamily: 'manrope',
      animation: 'fade',
      hoverEffect: 'glow',
    },
  },
  {
    id: 'y2k',
    name: 'Y2K',
    description: 'Hồng cyber 2000',
    emoji: '💖',
    theme: {
      bgType: 'gradient',
      bgGradientFrom: '#ff006e',
      bgGradientTo: '#8338ec',
      bgGradientAngle: 135,
      bgPattern: 'grid',
      bgPatternOpacity: 25,
      primaryColor: '#fb7185',
      secondaryColor: '#fde047',
      btnStyle: 'pill',
      cardStyle: 'shadow',
      avatarShape: 'squircle',
      avatarRing: 'gradient',
      layout: 'centered',
      spacing: 'normal',
      fontFamily: 'space-grotesk',
      animation: 'pop',
      hoverEffect: 'scale',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Đen trắng sang trọng',
    emoji: '⚫',
    theme: {
      bgType: 'solid',
      bgColor: '#0a0a0a',
      bgPattern: 'dots',
      bgPatternOpacity: 8,
      primaryColor: '#fafafa',
      secondaryColor: '#a1a1aa',
      btnStyle: 'square',
      cardStyle: 'outline',
      avatarShape: 'square',
      avatarRing: 'none',
      layout: 'left',
      spacing: 'spacious',
      fontFamily: 'jakarta',
      animation: 'fade',
      hoverEffect: 'lift',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Xanh rừng tươi mát',
    emoji: '🌿',
    theme: {
      bgType: 'gradient',
      bgGradientFrom: '#134e4a',
      bgGradientTo: '#064e3b',
      bgGradientAngle: 165,
      bgPattern: 'noise',
      bgPatternOpacity: 12,
      primaryColor: '#34d399',
      secondaryColor: '#a7f3d0',
      btnStyle: 'rounded',
      cardStyle: 'glass',
      avatarShape: 'circle',
      avatarRing: 'glow',
      layout: 'centered',
      spacing: 'normal',
      fontFamily: 'playfair',
      animation: 'fade',
      hoverEffect: 'lift',
    },
  },
  {
    id: 'gradient-mesh',
    name: 'Aurora',
    description: 'Mesh gradient ảo diệu',
    emoji: '✨',
    theme: {
      bgType: 'gradient',
      bgGradientFrom: '#1e1b4b',
      bgGradientTo: '#831843',
      bgGradientAngle: 135,
      bgPattern: 'mesh',
      bgPatternOpacity: 40,
      primaryColor: '#c084fc',
      secondaryColor: '#f0abfc',
      btnStyle: 'pill',
      cardStyle: 'glass',
      avatarShape: 'circle',
      avatarRing: 'gradient',
      layout: 'centered',
      spacing: 'spacious',
      fontFamily: 'inter',
      animation: 'pop',
      hoverEffect: 'glow',
    },
  },
  {
    id: 'peach',
    name: 'Peach',
    description: 'Đào ngọt nhẹ nhàng',
    emoji: '🍑',
    theme: {
      bgType: 'gradient',
      bgGradientFrom: '#fee2e2',
      bgGradientTo: '#fed7aa',
      bgGradientAngle: 160,
      bgPattern: 'none',
      primaryColor: '#f97316',
      secondaryColor: '#ec4899',
      textColor: '#7c2d12',
      btnStyle: 'rounded',
      cardStyle: 'glass',
      avatarShape: 'circle',
      avatarRing: 'solid',
      layout: 'centered',
      spacing: 'normal',
      fontFamily: 'poppins',
      animation: 'fade',
      hoverEffect: 'lift',
    },
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Hoàng gia xanh navy',
    emoji: '👑',
    theme: {
      bgType: 'solid',
      bgColor: '#1e1b4b',
      bgPattern: 'grid',
      bgPatternOpacity: 8,
      primaryColor: '#fbbf24',
      secondaryColor: '#e0e7ff',
      btnStyle: 'square',
      cardStyle: 'shadow',
      avatarShape: 'square',
      avatarRing: 'solid',
      layout: 'centered',
      spacing: 'normal',
      fontFamily: 'playfair',
      animation: 'fade',
      hoverEffect: 'glow',
    },
  },
];

export const DEFAULT_THEME: ThemeSettings = THEME_PRESETS[0].theme;

// Resolve theme with fallbacks for missing fields (back-compat with old btnColor)
export function resolveTheme(t: ThemeSettings | null | undefined): Required<ThemeSettings> {
  const d = DEFAULT_THEME;
  return {
    bgType: t?.bgType ?? d.bgType ?? 'gradient',
    bgColor: t?.bgColor ?? d.bgColor ?? '#020617',
    bgGradientFrom: t?.bgGradientFrom ?? d.bgGradientFrom ?? '#1e1b4b',
    bgGradientTo: t?.bgGradientTo ?? d.bgGradientTo ?? '#020617',
    bgGradientAngle: t?.bgGradientAngle ?? d.bgGradientAngle ?? 135,
    bgPattern: t?.bgPattern ?? d.bgPattern ?? 'none',
    bgPatternOpacity: t?.bgPatternOpacity ?? d.bgPatternOpacity ?? 20,
    primaryColor: t?.primaryColor ?? t?.btnColor ?? d.primaryColor ?? '#7c3aed',
    secondaryColor: t?.secondaryColor ?? d.secondaryColor ?? '#f0abfc',
    textColor: t?.textColor ?? d.textColor ?? '#ffffff',
    btnColor: t?.btnColor ?? t?.primaryColor ?? d.primaryColor ?? '#7c3aed',
    btnStyle: t?.btnStyle ?? d.btnStyle ?? 'rounded',
    cardStyle: t?.cardStyle ?? d.cardStyle ?? 'glass',
    avatarShape: t?.avatarShape ?? d.avatarShape ?? 'circle',
    avatarRing: t?.avatarRing ?? d.avatarRing ?? 'gradient',
    layout: t?.layout ?? d.layout ?? 'centered',
    spacing: t?.spacing ?? d.spacing ?? 'normal',
    fontStyle: t?.fontStyle ?? d.fontStyle ?? 'default',
    fontFamily: t?.fontFamily ?? d.fontFamily ?? 'inter',
    animation: t?.animation ?? d.animation ?? 'fade',
    hoverEffect: t?.hoverEffect ?? d.hoverEffect ?? 'lift',
  };
}

export function getFontFamily(family: ThemeSettings['fontFamily']): string {
  switch (family) {
    case 'inter': return 'var(--font-inter), system-ui, sans-serif';
    case 'poppins': return 'var(--font-poppins), system-ui, sans-serif';
    case 'playfair': return 'var(--font-playfair), Georgia, serif';
    case 'space-grotesk': return 'var(--font-space-grotesk), system-ui, sans-serif';
    case 'manrope': return 'var(--font-manrope), system-ui, sans-serif';
    case 'jakarta': return 'var(--font-jakarta), system-ui, sans-serif';
    default: return 'system-ui, -apple-system, sans-serif';
  }
}

export function getBtnRadius(style: ThemeSettings['btnStyle']): string {
  return style === 'pill' ? '9999px' : style === 'square' ? '6px' : '14px';
}

export function getAvatarRadius(shape: ThemeSettings['avatarShape']): string {
  return shape === 'square' ? '12px' : shape === 'squircle' ? '32%' : '9999px';
}

export function getSpacing(s: ThemeSettings['spacing']): { gap: string; padding: string } {
  switch (s) {
    case 'compact': return { gap: '8px', padding: '12px' };
    case 'spacious': return { gap: '20px', padding: '20px' };
    default: return { gap: '14px', padding: '16px' };
  }
}

export function getBgStyle(t: Required<ThemeSettings>): React.CSSProperties {
  if (t.bgType === 'gradient') {
    return { background: `linear-gradient(${t.bgGradientAngle}deg, ${t.bgGradientFrom}, ${t.bgGradientTo})` };
  }
  return { backgroundColor: t.bgColor };
}

export function getPatternOverlay(pattern: ThemeSettings['bgPattern'], opacity: number): string | null {
  const o = Math.max(0, Math.min(100, opacity)) / 100;
  switch (pattern) {
    case 'dots':
      return `radial-gradient(circle, rgba(255,255,255,${o}) 1px, transparent 1px) 0 0 / 16px 16px`;
    case 'grid':
      return `linear-gradient(rgba(255,255,255,${o}) 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, rgba(255,255,255,${o}) 1px, transparent 1px) 0 0 / 24px 24px`;
    case 'noise':
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='${o}'/%3E%3C/svg%3E")`;
    case 'waves':
      return `repeating-linear-gradient(45deg, rgba(255,255,255,${o * 0.5}) 0 1px, transparent 1px 12px), repeating-linear-gradient(-45deg, rgba(255,255,255,${o * 0.5}) 0 1px, transparent 1px 12px)`;
    case 'mesh':
      return `radial-gradient(at 20% 10%, rgba(255,255,255,${o * 0.6}) 0px, transparent 50%), radial-gradient(at 80% 90%, rgba(255,255,255,${o * 0.4}) 0px, transparent 50%)`;
    default:
      return null;
  }
}
