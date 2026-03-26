import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error('MIDTRANS_SERVER_KEY not configured')
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex')

    if (expectedSignature !== signature_key) {
      console.warn('Invalid Midtrans signature for order:', order_id)
      return NextResponse.json({ error: 'Signature tidak valid' }, { status: 403 })
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: { orderNumber: order_id },
      include: { payment: true },
    })

    if (!order) {
      console.warn('Order not found:', order_id)
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    // Map Midtrans status to our order status
    let newOrderStatus = order.status
    let paymentStatus = transaction_status

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newOrderStatus = 'DIBAYAR'
        paymentStatus = 'success'
      }
    } else if (transaction_status === 'settlement') {
      newOrderStatus = 'DIBAYAR'
      paymentStatus = 'success'
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      newOrderStatus = 'BATAL'
      paymentStatus = 'failed'
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending'
    }

    // Update order and payment
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: newOrderStatus },
      }),
      prisma.paymentTransaction.upsert({
        where: { orderId: order.id },
        update: {
          transactionId: transaction_id,
          status: paymentStatus,
          paymentType: payment_type,
          updatedAt: new Date(),
        },
        create: {
          orderId: order.id,
          transactionId: transaction_id,
          status: paymentStatus,
          amount: Number(gross_amount),
          paymentType: payment_type,
        },
      }),
    ])

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('POST /api/payment/notification error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
