# FashionMarket — Marketplace Fashion Mix & Formal

Platform marketplace fashion fullstack menggunakan Next.js (App Router) + TypeScript, Tailwind CSS, Framer Motion, Prisma ORM + PostgreSQL, NextAuth, dan Midtrans Snap sandbox.

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (route handlers)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v4 (credentials + JWT, role-based: USER/SELLER/ADMIN)
- **Payment**: Midtrans Snap (sandbox)

## Setup Lokal

### 1. Clone & Install

```bash
git clone https://github.com/fathulhidayat-create/fashion_marketplace.git
cd fashion_marketplace
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env` dan isi nilai yang sesuai:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fashion_marketplace"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="isi-dengan-string-random-minimal-32-karakter"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxx"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxx"
MIDTRANS_IS_PRODUCTION="false"
```

### 3. Jalankan PostgreSQL (Docker)

```bash
docker-compose up -d
```

### 4. Migrasi Database

```bash
npx prisma migrate dev --name init
```

### 5. Seed Data

```bash
npx prisma db seed
```

Akun default setelah seed:
| Role   | Email                        | Password      |
|--------|------------------------------|---------------|
| Admin  | admin@fashionmarket.id       | admin123456   |
| Seller | seller@fashionmarket.id      | seller123456  |
| User   | user@fashionmarket.id        | user123456    |

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Struktur Halaman

| Path | Deskripsi |
|------|-----------|
| `/` | Home (hero, kategori, promo, trending) |
| `/produk` | Browse produk (search, filter, sort, pagination) |
| `/produk/[slug]` | Detail produk |
| `/cart` | Keranjang belanja |
| `/checkout` | Checkout + Midtrans Snap |
| `/pesanan` | Riwayat pesanan |
| `/pesanan/[orderNumber]` | Detail pesanan |
| `/wishlist` | Wishlist |
| `/auth/masuk` | Login |
| `/auth/daftar` | Register |
| `/dashboard/penjual` | Dashboard seller |
| `/dashboard/admin` | Dashboard admin |

## Midtrans Webhook

Untuk development, gunakan [ngrok](https://ngrok.com) untuk expose localhost:

```bash
ngrok http 3000
```

Daftarkan URL webhook di dashboard Midtrans:
```
https://your-ngrok-url.ngrok.io/api/payment/notification
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npx prisma studio    # Prisma GUI
npx prisma migrate dev   # Jalankan migrasi
npx prisma db seed   # Seed data
```
