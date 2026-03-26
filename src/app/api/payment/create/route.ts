import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID diperlukan' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        userId: session.user.id,
      },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    if (order.payment?.snapToken) {
      return NextResponse.json({ snapToken: order.payment.snapToken })
    }

    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY
    if (!midtransServerKey) {
      return NextResponse.json({ error: 'Konfigurasi pembayaran belum lengkap' }, { status: 500 })
    }

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1'
      : 'https://app.sandbox.midtrans.com/snap/v1'

    const transactionData = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: order.total,
      },
      customer_details: {
        first_name: order.user?.name ?? 'Pembeli',
        email: order.user?.email ?? '',
        phone: order.user?.phone ?? '',
        billing_address: {
          first_name: order.shippingAddress?.recipientName ?? '',
          phone: order.shippingAddress?.phone ?? '',
          address: order.shippingAddress?.address ?? '',
          city: order.shippingAddress?.city ?? '',
          postal_code: order.shippingAddress?.postalCode ?? '',
          country_code: 'IDN',
        },
        shipping_address: {
          first_name: order.shippingAddress?.recipientName ?? '',
          phone: order.shippingAddress?.phone ?? '',
          address: order.shippingAddress?.address ?? '',
          city: order.shippingAddress?.city ?? '',
          postal_code: order.shippingAddress?.postalCode ?? '',
          country_code: 'IDN',
        },
      },
      item_details: order.items.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.productName.substring(0, 50),
      })),
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL}/pesanan/${order.orderNumber}`,
      },
    }

    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(midtransServerKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(transactionData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Midtrans error:', errorData)
      return NextResponse.json(
        { error: 'Gagal membuat transaksi pembayaran' },
        { status: 500 }
      )
    }

    const snapData = await response.json()

    // Save snap token
    await prisma.paymentTransaction.upsert({
      where: { orderId: order.id },
      update: { snapToken: snapData.token, status: 'pending' },
      create: {
        orderId: order.id,
        snapToken: snapData.token,
        amount: order.total,
        status: 'pending',
      },
    })

    return NextResponse.json({ snapToken: snapData.token, redirectUrl: snapData.redirect_url })
  } catch (error) {
    console.error('POST /api/payment/create error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
