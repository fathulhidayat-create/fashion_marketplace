import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = z
      .object({
        productId: z.string().cuid(),
        orderId: z.string().cuid().optional(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(3).max(500).optional(),
      })
      .parse(await request.json())

    // Check if user has ordered this product
    if (body.orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: body.orderId,
          userId: session.user.id,
          status: 'SELESAI',
          items: { some: { productId: body.productId } },
        },
      })
      if (!order) {
        return NextResponse.json(
          { error: 'Anda belum membeli produk ini' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate review
    const existing = await prisma.review.findFirst({
      where: { userId: session.user.id, productId: body.productId },
    })
    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: body.rating, comment: body.comment },
      })
      return NextResponse.json({ data: updated, message: 'Ulasan diperbarui' })
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: body.productId,
        orderId: body.orderId,
        rating: body.rating,
        comment: body.comment,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Data tidak valid', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
