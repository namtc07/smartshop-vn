export interface Product {
  id: string;
  platform: string;
  originalUrl: string;
  name: string;
  imageUrl: string | null;
  currentPrice: number | null;
}

export interface ShortLink {
  id: string;
  shortCode: string;
  affiliateDeepLink: string;
  isActiveOnBio: boolean;
  sortOrder: number;
  clicks?: number;
  Product: Product;
}

export interface UserProfile {
  id: string;
  email: string;
  bioPageSlug: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export interface AddForm {
  platform: 'Shopee' | 'TikTok Shop';
  originalUrl: string;
  name: string;
  imageUrl: string;
  currentPrice: string;
  affiliateDeepLink: string;
}

export const EMPTY_FORM: AddForm = {
  platform: 'Shopee',
  originalUrl: '',
  name: '',
  imageUrl: '',
  currentPrice: '',
  affiliateDeepLink: '',
};

export function formatPrice(price: number | null): string {
  if (!price) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function getDisplayName(profile: UserProfile | null, slug: string): string {
  if (profile?.displayName) return profile.displayName;
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
