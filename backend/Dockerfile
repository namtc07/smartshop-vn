FROM node:18-alpine

# Cài đặt openssl cho Prisma hoạt động trên Alpine
RUN apk add --no-cache openssl postgresql-client

WORKDIR /app

# Copy file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies bao gồm cả devDependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Chạy lệnh
CMD ["npm", "run", "dev"]
