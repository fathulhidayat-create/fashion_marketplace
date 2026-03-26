import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where:{slug:'kemeja'}, update:{}, create:{name:'Kemeja',slug:'kemeja',description:'Kemeja formal dan kasual'} }),
    prisma.category.upsert({ where:{slug:'blazer'}, update:{}, create:{name:'Blazer',slug:'blazer',description:'Blazer elegan'} }),
    prisma.category.upsert({ where:{slug:'dress'}, update:{}, create:{name:'Dress',slug:'dress',description:'Dress modern'} }),
    prisma.category.upsert({ where:{slug:'outer'}, update:{}, create:{name:'Outer',slug:'outer',description:'Jaket dan outer'} }),
    prisma.category.upsert({ where:{slug:'celana'}, update:{}, create:{name:'Celana',slug:'celana',description:'Celana formal dan kasual'} }),
    prisma.category.upsert({ where:{slug:'sepatu'}, update:{}, create:{name:'Sepatu',slug:'sepatu',description:'Sepatu fashion'} }),
    prisma.category.upsert({ where:{slug:'tas'}, update:{}, create:{name:'Tas',slug:'tas',description:'Tas wanita dan pria'} }),
    prisma.category.upsert({ where:{slug:'aksesori'}, update:{}, create:{name:'Aksesori',slug:'aksesori',description:'Aksesori fashion'} }),
  ])

  // Admin user
  const adminPassword = await bcrypt.hash('admin123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fashionmarket.id' },
    update: {},
    create: { name:'Admin FashionMarket', email:'admin@fashionmarket.id', password:adminPassword, role:'ADMIN' },
  })

  // Seller user
  const sellerPassword = await bcrypt.hash('seller123456', 12)
  const seller = await prisma.user.upsert({
    where: { email: 'seller@fashionmarket.id' },
    update: {},
    create: { name:'Toko Fashion Official', email:'seller@fashionmarket.id', password:sellerPassword, role:'SELLER' },
  })

  // Test user
  const userPassword = await bcrypt.hash('user123456', 12)
  await prisma.user.upsert({
    where: { email: 'user@fashionmarket.id' },
    update: {},
    create: { name:'Budi Santoso', email:'user@fashionmarket.id', password:userPassword, role:'USER' },
  })

  // Sample products
  const sampleProducts = [
    { name:'Kemeja Formal Slim Fit Putih', slug:'kemeja-formal-slim-fit-putih', desc:'Kemeja formal slim fit bahan premium. Cocok untuk meeting dan acara formal.', price:185000, original:250000, stock:50, cat:'kemeja', tags:['formal','kemeja','slim-fit'] },
    { name:'Blazer Wanita Elegan Navy', slug:'blazer-wanita-elegan-navy', desc:'Blazer wanita bahan wool blend premium. Tampil profesional dan elegan.', price:450000, original:600000, stock:30, cat:'blazer', tags:['blazer','formal','wanita'] },
    { name:'Dress Midi Floral Modern', slug:'dress-midi-floral-modern', desc:'Dress midi dengan motif bunga elegan. Nyaman dipakai sepanjang hari.', price:320000, original:420000, stock:25, cat:'dress', tags:['dress','floral','wanita'] },
    { name:'Outer Varsity Jacket Hitam', slug:'outer-varsity-jacket-hitam', desc:'Jaket varsity stylish bahan tebal. Cocok untuk tampilan kasual kekinian.', price:275000, original:350000, stock:40, cat:'outer', tags:['outer','jaket','casual'] },
    { name:'Celana Chino Premium Khaki', slug:'celana-chino-premium-khaki', desc:'Celana chino premium bahan katun stretch. Nyaman dan stylish.', price:195000, original:260000, stock:60, cat:'celana', tags:['celana','chino','casual'] },
    { name:'Kemeja Batik Modern Pria', slug:'kemeja-batik-modern-pria', desc:'Kemeja batik motif modern. Memadukan tradisi dan gaya kontemporer.', price:225000, original:300000, stock:35, cat:'kemeja', tags:['batik','kemeja','pria'] },
    { name:'Blazer Oversized Cream', slug:'blazer-oversized-cream', desc:'Blazer oversized trend terkini. Bahan berkualitas tinggi, nyaman dipakai.', price:395000, original:520000, stock:20, cat:'blazer', tags:['blazer','oversized','trendy'] },
    { name:'Dress Formal Midi Black', slug:'dress-formal-midi-black', desc:'Dress formal warna hitam klasik. Sempurna untuk acara resmi dan dinner.', price:385000, original:500000, stock:15, cat:'dress', tags:['dress','formal','hitam'] },
  ]

  const imageUrls: Record<string, string> = {
    kemeja: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    blazer: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4f7c?w=600',
    dress: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600',
    outer: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
    celana: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
  }

  for (const p of sampleProducts) {
    const cat = categories.find(c => c.slug === p.cat)!
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name, slug: p.slug, description: p.desc,
          price: p.price, originalPrice: p.original,
          stock: p.stock, categoryId: cat.id, sellerId: seller.id,
          status: 'ACTIVE', tags: p.tags,
          images: { create: [{ url: imageUrls[p.cat] ?? 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600', order: 0 }] },
          variants: {
            create: [
              { type:'SIZE', value:'S', stock:10, priceAdjustment:0 },
              { type:'SIZE', value:'M', stock:15, priceAdjustment:0 },
              { type:'SIZE', value:'L', stock:15, priceAdjustment:0 },
              { type:'SIZE', value:'XL', stock:10, priceAdjustment:0 },
            ]
          }
        }
      })
    }
  }

  console.log('✅ Seed selesai')
  console.log('👤 Admin: admin@fashionmarket.id / admin123456')
  console.log('🛍️ Seller: seller@fashionmarket.id / seller123456')
  console.log('👤 User: user@fashionmarket.id / user123456')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
