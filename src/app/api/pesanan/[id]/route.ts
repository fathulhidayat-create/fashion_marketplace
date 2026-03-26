import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
        ...(session.user.role === 'USER' ? { userId: session.user.id } : {}),
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, slug: true } },
            variant: true,
          },
        },
        shippingAddress: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data: order })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = z
      .object({ status: z.enum(['DIBUAT', 'DIBAYAR', 'DIPROSES', 'DIKIRIM', 'SELESAI', 'BATAL']) })
      .parse(await request.json())

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    // Only seller/admin can change status, or user can cancel their own order
    if (
      session.user.role === 'USER' &&
      order.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
    }

    if (session.user.role === 'USER' && body.status !== 'BATAL') {
      return NextResponse.json({ error: 'Pembeli hanya bisa membatalkan pesanan' }, { status: 403 })
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: body.status },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
