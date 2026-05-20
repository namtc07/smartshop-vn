import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linh Beauty – Bio Link | SmartShop VN',
  description: 'Trang Bio Link của Linh Beauty – KOC Affiliate Partner tại SmartShop VN.',
};

const DEMO_LINKS = [
  {
    id: '1',
    shortCode: 'demo-1',
    Product: {
      id: 'p1',
      platform: 'Shopee',
      name: 'Kem dưỡng ẩm da mặt ban đêm Pro-X Olay 50g dưỡng ẩm chuyên sâu',
      imageUrl: null,
      currentPrice: 320000,
    },
  },
  {
    id: '2',
    shortCode: 'demo-2',
    Product: {
      id: 'p2',
      platform: 'TikTok Shop',
      name: 'Son môi lì matte siêu lâu trôi Romand Zero Velvet Tint màu đỏ đất',
      imageUrl: null,
      currentPrice: 189000,
    },
  },
  {
    id: '3',
    shortCode: 'demo-3',
    Product: {
      id: 'p3',
      platform: 'Shopee',
      name: 'Serum Vitamin C Skin1004 Madagascar Centella Ampoule 100ml dưỡng sáng',
      imageUrl: null,
      currentPrice: 560000,
    },
  },
  {
    id: '4',
    shortCode: 'demo-4',
    Product: {
      id: 'p4',
      platform: 'TikTok Shop',
      name: 'Tẩy trang Bioderma Sensibio H2O 500ml dịu nhẹ cho da nhạy cảm',
      imageUrl: null,
      currentPrice: 430000,
    },
  },
  {
    id: '5',
    shortCode: 'demo-5',
    Product: {
      id: 'p5',
      platform: 'Shopee',
      name: 'Kem chống nắng Anessa Perfect UV Sunscreen SPF50+ PA++++ 60ml',
      imageUrl: null,
      currentPrice: 680000,
    },
  },
];

const PRODUCT_EMOJIS: Record<string, string> = {
  'p1': '🧴',
  'p2': '💄',
  'p3': '✨',
  'p4': '💧',
  'p5': '☀️',
};

export default function DemoKocPage() {
  const kocName = 'Linh Beauty';
  const slug = 'linh-beauty';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-0 sm:p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/10 blur-[120px]" />
      </div>

      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-indigo-600/90 backdrop-blur-md py-2 px-4 text-white text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse" />
        Đây là trang Bio Link demo – dữ liệu mẫu
        <a
          href="/"
          className="ml-2 underline underline-offset-2 hover:text-indigo-200 transition-colors"
        >
          ← Về trang chủ
        </a>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border-x-0 sm:border-x border-slate-800/60 min-h-screen sm:min-h-[850px] sm:my-4 sm:rounded-3xl p-6 flex flex-col items-center relative z-10 shadow-2xl mt-8">

        {/* Profile Header */}
        <div className="flex flex-col items-center mt-6 mb-8 text-center">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl mb-4 relative">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
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

          {DEMO_LINKS.map((link) => {
            const product = link.Product;
            const formattedPrice = product.currentPrice
              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)
              : 'Xem chi tiết';
            const emoji = PRODUCT_EMOJIS[product.id] || '🛍️';

            return (
              <div
                key={link.id}
                className="group flex gap-4 p-3 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/50 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-indigo-500/5 cursor-pointer"
              >
                {/* Product Image Placeholder */}
                <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700/30 flex-shrink-0 flex items-center justify-center text-3xl">
                  {emoji}
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

                  {/* Price and Action */}
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
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 mb-2 text-center">
          <a
            href="/"
            className="text-[10px] text-slate-500 hover:text-slate-400 uppercase tracking-widest font-semibold transition-colors duration-200"
          >
            Powered by SmartShop VN
          </a>
        </div>
      </div>
    </div>
  );
}
