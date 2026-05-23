import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BioPageClient from './BioPageClient';
import type { UserProfile, ShortLink } from '../dashboard/components/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BioData {
  user: UserProfile;
  links: ShortLink[];
}

async function getBioData(slug: string): Promise<BioData | null> {
  try {
    const res = await fetch(`${API_URL}/api/b/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data?.user) return null;
    return { user: json.data.user, links: json.data.links ?? [] };
  } catch {
    return null;
  }
}

function formatSlugName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBioData(slug);
  if (!data) return { title: 'Không tìm thấy | SmartShop VN' };

  const { user } = data;
  const name = user.displayName || formatSlugName(slug);
  const title = user.seoTitle || `${name} | SmartShop VN`;
  const description = user.seoDescription || user.bio || `Trang sản phẩm affiliate của ${name} trên SmartShop VN`;
  const image = user.ogImage || user.avatarUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      ...(image ? { images: [{ url: image, width: 400, height: 400 }] } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function BioPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getBioData(slug);

  if (!data) {
    notFound();
  }

  return <BioPageClient user={data.user} links={data.links} slug={slug} />;
}
