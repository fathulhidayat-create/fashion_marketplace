import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  search: z.string().optional(),
  kategori: z.string().optional(),
  minHarga: z.coerce.number().optional(),
  maxHarga: z.coerce.number().optional(),
  sort: z.enum(['terbaru', 'termurah', 'termahal', 'terpopuler']).default('terbaru'),
  ukuran: z.string().optional(),
  warna: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams.entries()))

    const skip = (query.page - 1) * query.limit

    const where: any = { status: 'ACTIVE' }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search.toLowerCase() } },
      ]
    }

    if (query.kategori) {
      where.category = { slug: query.kategori }
    }

    if (query.minHarga || query.maxHarga) {
      where.price = {}
      if (query.minHarga) where.price.gte = query.minHarga
      if (query.maxHarga) where.price.lte = query.maxHarga
    }

    const orderBy: any =
      query.sort === 'terbaru'
        ? { createdAt: 'desc' }
        : query.sort === 'termurah'
        ? { price: 'asc' }
        : query.sort === 'termahal'
        ? { price: 'desc' }
        : { createdAt: 'desc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, name: true, image: true } },
          variants: true,
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true, wishlist: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    const productsWithRating = products.map((p) => ({
      ...p,
      averageRating:
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0,
    }))

    return NextResponse.json({
      data: productsWithRating,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 })
    }
    console.error('GET /api/produk error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }
    if (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
    }

    const bodySchema = z.object({
      name: z.string().min(3).max(200),
      description: z.string().min(10),
      price: z.number().int().positive(),
      originalPrice: z.number().int().positive().optional(),
      stock: z.number().int().min(0),
      categoryId: z.string().cuid(),
      tags: z.array(z.string()).optional().default([]),
      images: z
        .array(z.object({ url: z.string().url(), altText: z.string().optional(), order: z.number().default(0) }))
        .optional()
        .default([]),
      variants: z
        .array(
          z.object({
            type: z.enum(['SIZE', 'COLOR']),
            value: z.string(),
            stock: z.number().int().min(0).default(0),
            priceAdjustment: z.number().int().default(0),
          })
        )
        .optional()
        .default([]),
    })

    const body = bodySchema.parse(await request.json())

    const slug = body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        originalPrice: body.originalPrice,
        stock: body.stock,
        categoryId: body.categoryId,
        sellerId: session.user.id,
        tags: body.tags,
        status: session.user.role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
        images: { create: body.images },
        variants: { create: body.variants },
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Data tidak valid', details: error.errors }, { status: 400 })
    }
    console.error('POST /api/produk error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
