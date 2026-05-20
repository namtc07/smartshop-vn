# SmartShop VN - KOC Affiliate Bio Link SaaS

Hệ thống B2B SaaS hỗ trợ KOC làm Affiliate Marketing, tích hợp Chrome Extension để crawl sản phẩm nhanh và hiển thị trang Bio Link tối ưu.

## Cấu trúc thư mục

- `/backend`: Node.js Express API + Prisma + PostgreSQL (Docker)
- `/frontend`: Next.js (App Router) + Tailwind CSS (Bio Page)
- `/chrome-extension`: Chrome Extension (Manifest V3) để crawl sản phẩm

---

## Hướng dẫn Chạy Hệ thống

### Cách 1: Sử dụng Docker (Khuyến nghị)

Yêu cầu máy tính có cài đặt và khởi động Docker Daemon.

1. Tại thư mục gốc dự án, chạy lệnh khởi động các container:
   ```bash
   docker compose up --build -d
   ```
2. Docker Compose sẽ tự động:
   - Khởi động PostgreSQL 15 database.
   - Migrate Prisma schema và seed tài khoản KOC mẫu:
     - **Email**: `linh.beauty@gmail.com`
     - **Slug Bio**: `linh-beauty`
     - **ID User**: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
   - Khởi chạy Backend API lắng nghe tại `http://localhost:3000`.

3. Khởi chạy Next.js Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   Trang Bio Link sẽ hoạt động tại `http://localhost:3001` (hoặc `http://localhost:3000` tùy thuộc cổng Next.js chọn, thông thường Next.js sẽ tự chọn cổng 3001 nếu cổng 3000 bị chiếm bởi Backend).

---

### Cách 2: Chạy trực tiếp Local (Dự phòng bằng SQLite)

Nếu môi trường của bạn không chạy được Docker hoặc khởi động Docker quá lâu, bạn có thể chuyển dự án sang chạy SQLite cục bộ:

1. Chuyển đổi file cấu hình cơ sở dữ liệu:
   Mở file `backend/prisma/schema.prisma` và sửa phần `datasource db`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
2. Mở file `backend/.env` và sửa:
   ```env
   PORT=3000
   DATABASE_URL="file:./dev.db"
   ```
3. Cài đặt các package của backend và migrate database cục bộ:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run dev
   ```
   API Backend của bạn đã chạy tại `http://localhost:3000` mà không cần Docker.

---

## Kiểm thử Chrome Extension

1. Mở trình duyệt Chrome, truy cập địa chỉ `chrome://extensions/`.
2. Bật chế độ nhà phát triển (**Developer mode**) ở góc trên bên phải.
3. Nhấn nút **Load unpacked** (Tải tiện ích đã giải nén) ở góc trên bên trái.
4. Chọn thư mục `/chrome-extension` trong thư mục dự án này.
5. Truy cập bất kỳ trang chi tiết sản phẩm Shopee hoặc Lazada.
6. Mở extension, nhập Link Affiliate và nhấn **Thêm vào Bio Link**.
7. Truy cập Bio Link trên Next.js (Ví dụ: `http://localhost:3001/linh-beauty`) để xem sản phẩm vừa thêm.
