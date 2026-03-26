import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 10)
    const skip = (page - 1) * limit

    const where: any = {}
    if (session.user.role === 'USER') {
      where.userId = session.user.id
    } else if (session.user.role === 'SELLER') {
      // Seller sees orders containing their products
      where.items = { some: { product: { sellerId: session.user.id } } }
    }
    // ADMIN sees all orders

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { select: { id: true, slug: true } },
              variant: true,
            },
          },
          shippingAddress: true,
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
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

    const body = z
      .object({
        shippingAddress: z.object({
          recipientName: z.string().min(2),
          phone: z.string().min(8),
          address: z.string().min(5),
          city: z.string().min(2),
          province: z.string().min(2),
          postalCode: z.string().min(5),
        }),
        notes: z.string().optional(),
        shippingCost: z.number().int().min(0).default(0),
      })
      .parse(await request.json())

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 })
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok ${item.product.name} tidak mencukupi` },
          { status: 400 }
        )
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal + body.shippingCost
    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        subtotal,
        shippingCost: body.shippingCost,
        total,
        notes: body.notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.product.name,
            productImage: item.product.images?.[0] as string | undefined,
          })),
        },
        shippingAddress: { create: body.shippingAddress },
        payment: {
          create: {
            amount: total,
            status: 'pending',
          },
        },
      },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
      },
    })

    // Reduce stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Data tidak valid', details: error.errors }, { status: 400 })
    }
    console.error('POST /api/pesanan error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
