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

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { order: 'asc' }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    })

    return NextResponse.json({ data: cart })
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
        productId: z.string().cuid(),
        variantId: z.string().cuid().optional(),
        quantity: z.number().int().positive().default(1),
      })
      .parse(await request.json())

    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      include: { variants: true },
    })

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Produk tidak tersedia' }, { status: 400 })
    }

    if (product.stock < body.quantity) {
      return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 })
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: session.user.id } })
    }

    const price = body.variantId
      ? product.price + (product.variants.find((v) => v.id === body.variantId)?.priceAdjustment ?? 0)
      : product.price

    // Upsert cart item
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: body.productId, variantId: body.variantId ?? null },
    })

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + body.quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: body.productId,
          variantId: body.variantId,
          quantity: body.quantity,
          price,
        },
      })
    }

    return NextResponse.json({ message: 'Produk ditambahkan ke keranjang' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = z
      .object({ itemId: z.string().cuid(), quantity: z.number().int().min(0) })
      .parse(await request.json())

    const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
    if (!cart) return NextResponse.json({ error: 'Keranjang tidak ditemukan' }, { status: 404 })

    const item = await prisma.cartItem.findFirst({
      where: { id: body.itemId, cartId: cart.id },
    })
    if (!item) return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })

    if (body.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: body.itemId } })
    } else {
      await prisma.cartItem.update({ where: { id: body.itemId }, data: { quantity: body.quantity } })
    }

    return NextResponse.json({ message: 'Keranjang diperbarui' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
    if (!cart) return NextResponse.json({ error: 'Keranjang tidak ditemukan' }, { status: 404 })

    if (itemId) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } })
    } else {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }

    return NextResponse.json({ message: 'Item dihapus dari keranjang' })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
