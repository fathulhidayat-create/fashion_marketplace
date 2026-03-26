import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            category: { select: { id: true, name: true, slug: true } },
            seller: { select: { id: true, name: true } },
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true, wishlist: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: wishlist })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = z.object({ productId: z.string().cuid() }).parse(await request.json())

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: body.productId } },
    })

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } })
      return NextResponse.json({ message: 'Dihapus dari wishlist', added: false })
    }

    await prisma.wishlist.create({
      data: { userId: session.user.id, productId: body.productId },
    })

    return NextResponse.json({ message: 'Ditambahkan ke wishlist', added: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
