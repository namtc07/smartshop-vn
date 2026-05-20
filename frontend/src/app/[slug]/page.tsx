import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Product {
  id: string;
  platform: string;
  originalUrl: string;
  name: string;
  imageUrl: string | null;
  currentPrice: number | null;
}

interface ShortLink {
  id: string;
  userId: string;
  productId: string;
  shortCode: string;
  affiliateDeepLink: string;
  isActiveOnBio: boolean;
  Product: Product;
}

// Hàm format tên KOC từ slug (ví dụ: linh-beauty -> Linh Beauty)
function formatKocName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Fetch dữ liệu server-side
async function getBioLinks(slug: string): Promise<ShortLink[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/b/${slug}`, {
      cache: 'no-store', // Đảm bảo lấy dữ liệu mới nhất
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch bio links');
    }

    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error('Error fetching bio links:', error);
    // Fallback trả về null để hiển thị màn hình thông báo lỗi thay vì crash
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BioPage({ params }: PageProps) {
  const { slug } = await params;
  const links = await getBioLinks(slug);

  // Nếu không tìm thấy hoặc lỗi kết nối (links === null)
  if (links === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-4 text-red-400 text-2xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold mb-2">Không tìm thấy trang Bio</h1>
        <p className="text-sm text-slate-400 max-w-xs">
          Trang Bio của KOC <span className="text-indigo-400 font-semibold">@{slug}</span> không tồn tại hoặc hệ thống đang gặp sự cố kết nối.
        </p>
      </div>
    );
  }

  const kocName = formatKocName(slug);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-0 sm:p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/10 blur-[120px]" />
      </div>

      {/* Main Container - Mobile-first Layout */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-x-0 sm:border-x border-slate-800/60 min-h-screen sm:min-h-[850px] sm:my-4 sm:rounded-3xl p-6 flex flex-col items-center relative z-10 shadow-2xl">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mt-6 mb-8 text-center">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl mb-4 relative">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
              {/* Sinh avatar chữ cái đầu hoặc ảnh mặc định */}
              {kocName.charAt(0)}
            </div>
            {/* Verified Badge */}
            <span className="absolute bottom-0 right-1 bg-indigo-500 text-white rounded-full p-1 border-2 border-slate-900 text-xs">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{kocName}</h1>
          <p className="text-sm text-indigo-400/90 font-medium mt-1">@ {slug}</p>
          <span className="mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/60 text-slate-300">
            KOC Affiliate Partner
          </span>
        </div>

        {/* Links Section */}
        <div className="w-full flex-1 flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1 px-1">
            Danh sách sản phẩm gợi ý
          </h2>
          
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl text-center">
              <span className="text-4xl mb-2">📦</span>
              <p className="text-sm text-slate-400">KOC này chưa thêm sản phẩm nào vào Bio Link.</p>
            </div>
          ) : (
            links.map((link) => {
              const product = link.Product;
              const formattedPrice = product.currentPrice
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)
                : 'Xem chi tiết';
              
              // Endpoint redirect tracking ở Backend API
              const redirectUrl = `${API_URL}/${link.shortCode}`;

              return (
                <a
                  key={link.id}
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 p-3 bg-slate-950/40 hover:bg-slate-850/80 border border-slate-800/50 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-indigo-500/5"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700/30 flex-shrink-0">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={true} // Tránh lỗi DNS nếu cache ảnh hoặc optimize không tải được
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                    <div>
                      {/* Platform Tag */}
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase mb-1.5 ${
                        product.platform.toLowerCase() === 'shopee'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {product.platform}
                      </span>
                      {/* Product Name */}
                      <h3 className="text-sm font-semibold text-slate-200 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200">
                        {product.name}
                      </h3>
                    </div>

                    {/* Price and Action Row */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-pink-400">
                        {formattedPrice}
                      </span>
                      <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1">
                        Mua ngay
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 mb-2 text-center">
          <a
            href="https://smartshop.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-500 hover:text-slate-400 uppercase tracking-widest font-semibold transition-colors duration-200"
          >
            Powered by SmartShop VN
          </a>
        </div>
      </div>
    </div>
  );
}
