'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, ShoppingBag, CreditCard, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { CartItemType } from '@/types'
import Image from 'next/image'

const checkoutSchema = z.object({
  recipientName: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().min(8, 'Nomor telepon tidak valid'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  city: z.string().min(2, 'Kota wajib diisi'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  postalCode: z.string().min(5, 'Kode pos 5 digit'),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

declare global {
  interface Window {
    snap: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [cartItems, setCartItems] = useState<CartItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) })

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      const items = data.data?.items ?? []
      if (items.length === 0) {
        router.push('/cart')
        return
      }
      setCartItems(items)
    } catch {
      router.push('/cart')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Load Midtrans Snap.js
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey) return

    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal > 200000 ? 0 : 15000
  const total = subtotal + shippingCost

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    try {
      // Create order
      const orderRes = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            recipientName: data.recipientName,
            phone: data.phone,
            address: data.address,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
          },
          notes: data.notes,
          shippingCost,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        error('Gagal', orderData.error)
        return
      }

      const order = orderData.data

      // Get Midtrans snap token
      const paymentRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderNumber }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        error('Gagal', paymentData.error ?? 'Gagal membuat transaksi')
        // Still redirect to orders page even if payment fails
        router.push('/pesanan')
        return
      }

      const { snapToken } = paymentData

      if (window.snap && snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: (result: any) => {
            success('Pembayaran Berhasil!', 'Pesanan Anda sedang diproses')
            router.push(`/pesanan/${order.orderNumber}`)
          },
          onPending: (result: any) => {
            success('Menunggu Pembayaran', 'Selesaikan pembayaran Anda')
            router.push(`/pesanan/${order.orderNumber}`)
          },
          onError: (result: any) => {
            error('Pembayaran Gagal', 'Silakan coba kembali')
            router.push(`/pesanan/${order.orderNumber}`)
          },
          onClose: () => {
            router.push(`/pesanan/${order.orderNumber}`)
          },
        })
      } else {
        // Fallback: redirect to order page
        success('Pesanan Dibuat', 'Silakan lanjutkan pembayaran')
        router.push(`/pesanan/${order.orderNumber}`)
      }
    } catch {
      error('Gagal', 'Terjadi kesalahan. Silakan coba lagi')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Shipping Address */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Penerima"
                    placeholder="Nama lengkap"
                    error={errors.recipientName?.message}
                    required
                    {...register('recipientName')}
                  />
                  <Input
                    label="Nomor Telepon"
                    type="tel"
                    placeholder="081234567890"
                    error={errors.phone?.message}
                    required
                    {...register('phone')}
                  />
                  <div className="sm:col-span-2">
                    <Textarea
                      label="Alamat Lengkap"
                      placeholder="Nama jalan, nomor, RT/RW, kelurahan"
                      error={errors.address?.message}
                      required
                      rows={3}
                      {...register('address')}
                    />
                  </div>
                  <Input
                    label="Kota"
                    placeholder="Contoh: Jakarta Selatan"
                    error={errors.city?.message}
                    required
                    {...register('city')}
                  />
                  <Input
                    label="Provinsi"
                    placeholder="Contoh: DKI Jakarta"
                    error={errors.province?.message}
                    required
                    {...register('province')}
                  />
                  <Input
                    label="Kode Pos"
                    placeholder="12345"
                    error={errors.postalCode?.message}
                    required
                    {...register('postalCode')}
                  />
                  <Textarea
                    label="Catatan (opsional)"
                    placeholder="Instruksi pengiriman khusus..."
                    rows={2}
                    {...register('notes')}
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Produk yang Dipesan</h2>
                </div>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <Image
                          src={item.product.images?.[0]?.url ?? '/placeholder-product.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-gray-500">{item.variant.value}</p>
                        )}
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Total Pembayaran</h2>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span
                      className={
                        shippingCost === 0 ? 'text-green-600 font-medium' : 'font-medium'
                      }
                    >
                      {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="bg-gold-50 border border-gold-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gold-700 font-medium">💳 Pembayaran via Midtrans</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Transfer Bank, GoPay, OVO, DANA, Kartu Kredit, dll.
                  </p>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
