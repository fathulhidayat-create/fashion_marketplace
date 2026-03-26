'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, MapPin, CreditCard, Package, Loader2, ExternalLink } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { OrderType } from '@/types'
import Image from 'next/image'

declare global {
  interface Window { snap: any }
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const router = useRouter()
  const { success, error } = useToast()
  const [order, setOrder] = useState<OrderType | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/pesanan/${orderNumber}`)
        const data = await res.json()
        if (res.ok) setOrder(data.data)
        else router.push('/pesanan')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderNumber, router])

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey) return
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handlePay = async () => {
    if (!order) return
    setPaying(true)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderNumber }),
      })
      const data = await res.json()
      if (data.snapToken && window.snap) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => { success('Pembayaran Berhasil!'); router.refresh() },
          onPending: () => success('Menunggu Pembayaran'),
          onError: () => error('Pembayaran Gagal'),
          onClose: () => {},
        })
      }
    } catch {
      error('Gagal', 'Terjadi kesalahan')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  if (!order) return null

  const statusSteps = ['DIBUAT', 'DIBAYAR', 'DIPROSES', 'DIKIRIM', 'SELESAI']
  const currentStep = order.status === 'BATAL' ? -1 : statusSteps.indexOf(order.status)
  const statusLabels: Record<string, string> = {
    DIBUAT: 'Dibuat', DIBAYAR: 'Dibayar', DIPROSES: 'Diproses', DIKIRIM: 'Dikirim', SELESAI: 'Selesai'
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Pesanan
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-500 text-sm mt-1">{formatDateTime(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Status Tracker */}
        {order.status !== 'BATAL' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-xl border border-border p-5 mb-4"
          >
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Status Pesanan</h3>
            <div className="flex items-center">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                        i <= currentStep
                          ? 'bg-gold border-gold text-white'
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 text-center ${
                        i <= currentStep ? 'text-gold font-medium' : 'text-gray-400'
                      }`}
                    >
                      {statusLabels[step]}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mt-[-14px] ${
                        i < currentStep ? 'bg-gold' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pay Now CTA */}
        {order.status === 'DIBUAT' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-amber-800 text-sm">Menunggu Pembayaran</p>
              <p className="text-xs text-amber-600 mt-0.5">Selesaikan pembayaran untuk memproses pesanan</p>
            </div>
            <Button variant="primary" size="sm" onClick={handlePay} loading={paying}>
              Bayar Sekarang
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {/* Order Items */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-gold" />
              <h3 className="font-semibold text-gray-900 text-sm">Produk Pesanan</h3>
            </div>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/produk/${item.product?.slug ?? ''}`}>
                      <p className="text-sm font-medium text-gray-900 hover:text-gold transition-colors line-clamp-1">
                        {item.productName}
                      </p>
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-500">{item.variant.value}</p>
                    )}
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                <h3 className="font-semibold text-gray-900 text-sm">Alamat Pengiriman</h3>
              </div>
              <p className="font-medium text-gray-900">{order.shippingAddress.recipientName}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.province} {order.shippingAddress.postalCode}
              </p>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-gold" />
              <h3 className="font-semibold text-gray-900 text-sm">Rincian Pembayaran</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkir</span>
                <span>{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-gold">{formatPrice(order.total)}</span>
              </div>
              {order.payment && (
                <div className="text-xs text-gray-500 mt-2">
                  Status Pembayaran:{' '}
                  <span className={`font-medium ${
                    order.payment.status === 'success' ? 'text-green-600' :
                    order.payment.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {order.payment.status === 'success' ? 'Berhasil' :
                     order.payment.status === 'pending' ? 'Menunggu' : 'Gagal'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
