export interface Product {
  id: string;
  platform: string;
  originalUrl: string;
  name: string;
  imageUrl: string | null;
  currentPrice: number | null;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface ShortLink {
  id: string;
  shortCode: string;
  customShortCode: string | null;
  commissionRate: number | null;
  conversionRate: number | null;
  affiliateDeepLink: string;
  isActiveOnBio: boolean;
  sortOrder: number;
  isFeatured: boolean;
  badgeText: string | null;
  videoUrl: string | null;
  categoryId: string | null;
  startDate: string | null;
  endDate: string | null;
  clicks?: number;
  Product: Product;
  Category?: Category | null;
}

export interface SocialLinks {
  tiktok?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  zalo?: string;
}

export interface ThemeSettings {
  // Background
  bgType?: 'solid' | 'gradient' | 'pattern';
  bgColor?: string;
  bgGradientFrom?: string;
  bgGradientTo?: string;
  bgGradientAngle?: number;
  bgPattern?: 'none' | 'dots' | 'grid' | 'noise' | 'waves' | 'mesh';
  bgPatternOpacity?: number;

  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  /** @deprecated use primaryColor */
  btnColor?: string;

  // Buttons / cards
  btnStyle?: 'rounded' | 'pill' | 'square';
  cardStyle?: 'glass' | 'solid' | 'outline' | 'minimal' | 'shadow';

  // Avatar
  avatarShape?: 'circle' | 'squircle' | 'square';
  avatarRing?: 'none' | 'gradient' | 'solid' | 'glow';

  // Layout
  layout?: 'centered' | 'left' | 'compact';
  spacing?: 'compact' | 'normal' | 'spacious';

  // Typography
  fontStyle?: 'default' | 'serif' | 'rounded';
  fontFamily?: 'system' | 'inter' | 'poppins' | 'playfair' | 'space-grotesk' | 'manrope' | 'jakarta';

  // Effects
  animation?: 'none' | 'fade' | 'slide' | 'pop';
  hoverEffect?: 'none' | 'lift' | 'glow' | 'scale';
}

export interface UserProfile {
  id: string;
  email: string;
  bioPageSlug: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: SocialLinks | null;
  themeSettings: ThemeSettings | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  defaultConversionRate: number | null;
  defaultCommissionRate: number | null;
}

export interface AddForm {
  platform: 'Shopee' | 'TikTok Shop';
  originalUrl: string;
  name: string;
  imageUrl: string;
  currentPrice: string;
  affiliateDeepLink: string;
  isFeatured: boolean;
  badgeText: string;
  videoUrl: string;
  categoryId: string;
  startDate: string;
  endDate: string;
}

export const EMPTY_FORM: AddForm = {
  platform: 'Shopee',
  originalUrl: '',
  name: '',
  imageUrl: '',
  currentPrice: '',
  affiliateDeepLink: '',
  isFeatured: false,
  badgeText: '',
  videoUrl: '',
  categoryId: '',
  startDate: '',
  endDate: '',
};

export function formatPrice(price: number | null): string {
  if (!price) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function getDisplayName(profile: UserProfile | null, slug: string): string {
  if (profile?.displayName) return profile.displayName;
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export type DashboardTab = 'products' | 'analytics' | 'revenue' | 'theme';

export interface RevenueEntry {
  id: string;
  userId: string;
  month: string;
  platform: string;
  actualAmount: number;
  notes: string | null;
  createdAt: string;
}

export interface ProductProfitability {
  id: string;
  name: string;
  platform: string;
  imageUrl: string | null;
  price: number;
  clicks: number;
  commissionRate: number;
  conversionRate: number;
  estimatedOrders: number;
  estimatedRevenue: number | null;
  isActiveOnBio: boolean;
  isFeatured: boolean;
}
