/* eslint-disable @next/next/no-html-link-for-pages */
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Background ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-pink-900/15 blur-[160px]" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[120px]" />
      </div>

      {/* === NAVBAR === */}
      <header className="relative z-10 border-b border-slate-800/60 backdrop-blur-md bg-slate-950/70 sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/30">
              S
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Smart<span className="text-indigo-400">Shop</span>
            </span>
          </div>
          {/* Nav Links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">Cách hoạt động</a>
            <a href="#features" className="hover:text-white transition-colors duration-200">Tính năng</a>
            <a href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</a>
          </nav>
          {/* CTA */}
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 hidden sm:block"
            >
              Đăng nhập
            </a>
            <a
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40"
            >
              Đăng ký
            </a>
          </div>
        </div>
      </header>

      {/* === HERO SECTION === */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Nền tảng Affiliate cho KOC &amp; Content Creator
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
          Biến{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            link affiliate
          </span>{" "}
          thành
          <br className="hidden sm:block" />
          nguồn thu nhập thụ động
        </h1>

        {/* Sub */}
        <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
          SmartShop giúp KOC tạo trang Bio Link cá nhân, quản lý sản phẩm affiliate từ{" "}
          <span className="text-orange-400 font-semibold">Shopee</span> &amp;{" "}
          <span className="text-cyan-400 font-semibold">TikTok Shop</span>, và theo dõi hiệu quả chuyển đổi theo thời
          gian thực.
        </p>

        {/* CTA Buttons */}
        <div id="get-started" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/demo-koc"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-300 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
          >
            Xem Bio Link mẫu
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5"
          >
            Tìm hiểu thêm
          </a>
        </div>

        {/* Social Proof Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {[
            { icon: "🛍️", text: "Shopee Affiliate" },
            { icon: "🎵", text: "TikTok Shop" },
            { icon: "📊", text: "Tracking realtime" },
            { icon: "🔗", text: "Short Link" },
          ].map((item) => (
            <span
              key={item.text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/50 text-slate-300 text-xs font-medium"
            >
              <span>{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>
      </section>

      {/* === PREVIEW MOCKUP === */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20 flex justify-center">
        <div className="w-full max-w-sm rounded-3xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-slate-950/80 overflow-hidden">
          {/* Mockup header bar */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-3 text-[10px] text-slate-500 font-mono">smartshop.vn/linh-beauty</span>
          </div>
          {/* Mockup profile */}
          <div className="flex flex-col items-center pt-6 pb-4 px-5">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 mb-3">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xl font-black text-white">
                L
              </div>
            </div>
            <p className="text-white font-bold text-base">Linh Beauty</p>
            <p className="text-indigo-400 text-xs mt-0.5">@linh-beauty</p>
            <span className="mt-2 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-300">
              KOC Affiliate Partner
            </span>
          </div>
          {/* Mockup products */}
          <div className="px-4 pb-5 flex flex-col gap-2.5">
            {[
              { name: "Kem dưỡng da ban đêm Pro-X", price: "320.000 ₫", platform: "shopee", emoji: "🧴" },
              { name: "Son môi lì matte siêu lâu trôi", price: "189.000 ₫", platform: "tiktok", emoji: "💄" },
              { name: "Serum vitamin C Skin1004", price: "560.000 ₫", platform: "shopee", emoji: "✨" },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mb-1 ${p.platform === "shopee" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"}`}
                  >
                    {p.platform}
                  </span>
                  <p className="text-slate-200 text-xs font-medium leading-tight truncate">{p.name}</p>
                  <p className="text-pink-400 text-xs font-bold mt-0.5">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest font-bold text-indigo-400 mb-3">Đơn giản &amp; Hiệu quả</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Hoạt động như thế nào?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: "🔗",
              title: "Thêm link affiliate",
              desc: "Dán link sản phẩm từ Shopee hoặc TikTok Shop. Hệ thống tự động lấy thông tin sản phẩm, giá, ảnh.",
              color: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
              badge: "text-indigo-400",
            },
            {
              step: "02",
              icon: "🎨",
              title: "Tạo Bio Link cá nhân",
              desc: "Tùy chỉnh trang Bio Link với tên, ảnh đại diện. Chia sẻ một link duy nhất chứa tất cả sản phẩm.",
              color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
              badge: "text-purple-400",
            },
            {
              step: "03",
              icon: "📈",
              title: "Theo dõi chuyển đổi",
              desc: "Xem thống kê click, doanh thu theo thời gian thực. Tối ưu danh sách sản phẩm hiệu quả nhất.",
              color: "from-pink-500/20 to-pink-600/5 border-pink-500/20",
              badge: "text-pink-400",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`relative p-6 rounded-2xl border bg-gradient-to-br ${item.color} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{item.icon}</span>
                <span className={`text-xs font-black ${item.badge} opacity-40`}>{item.step}</span>
              </div>
              <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest font-bold text-pink-400 mb-3">Dành riêng cho KOC</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Tính năng nổi bật</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: "⚡",
              title: "Short Link tự động",
              desc: "Rút gọn link affiliate dài thành short link ngắn gọn, dễ share, dễ nhớ.",
            },
            {
              icon: "🛒",
              title: "Hỗ trợ đa sàn",
              desc: "Tích hợp Shopee Affiliate và TikTok Shop trong một nơi quản lý duy nhất.",
            },
            {
              icon: "👤",
              title: "Bio Link Profile",
              desc: "Trang giới thiệu cá nhân đẹp, mobile-first, tối ưu cho người dùng điện thoại.",
            },
            {
              icon: "📊",
              title: "Analytics realtime",
              desc: "Thống kê số lần click, tỉ lệ chuyển đổi và doanh thu theo từng sản phẩm.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex gap-4 p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                {f.icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === CTA BANNER === */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/20 p-10 text-center backdrop-blur-sm">
          {/* Decoration blobs inside */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-pink-600/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest font-bold text-indigo-300 mb-4">Bắt đầu miễn phí</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Sẵn sàng tạo trang
              <br />
              Bio Link của bạn?
            </h2>
            <p className="text-slate-400 text-base mb-8 max-w-md mx-auto">
              Tham gia cùng hàng trăm KOC đang dùng SmartShop để tối ưu doanh thu affiliate.
            </p>
            <a
              href="/demo-koc"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all duration-300 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Xem demo ngay
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="relative z-10 border-t border-slate-800/60 py-8 text-center">
        <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold">
          © 2025 SmartShop VN · Nền tảng Affiliate dành cho KOC
        </p>
      </footer>
    </div>
  );
}
