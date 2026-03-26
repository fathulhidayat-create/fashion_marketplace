import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        status: 'ACTIVE',
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        seller: { select: { id: true, name: true, image: true } },
        variants: true,
        reviews: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, wishlist: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

    return NextResponse.json({ data: { ...product, averageRating } })
  } catch (error) {
    console.error('GET /api/produk/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
    }

    const bodySchema = z.object({
      name: z.string().min(3).max(200).optional(),
      description: z.string().min(10).optional(),
      price: z.number().int().positive().optional(),
      originalPrice: z.number().int().positive().nullable().optional(),
      stock: z.number().int().min(0).optional(),
      categoryId: z.string().cuid().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE']).optional(),
    })

    const body = bodySchema.parse(await request.json())

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Data tidak valid', details: error.errors }, { status: 400 })
    }
    console.error('PUT /api/produk/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && product.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
    }

    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('DELETE /api/produk/[id] error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
