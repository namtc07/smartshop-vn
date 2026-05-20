#!/bin/sh

echo "Waiting for postgres..."

# Vòng lặp chờ PostgreSQL sẵn sàng
while ! pg_isready -h db -p 5432 -U postgres; do
  sleep 1
done

echo "PostgreSQL started"

# Thực hiện migration database của Prisma
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

# Chạy seed dữ liệu (nếu có script seed.js)
if [ -f "prisma/seed.js" ]; then
  echo "Seeding database..."
  npx prisma db seed
fi

# Thực thi lệnh CMD tiếp theo (ví dụ: npm run dev)
exec "$@"
