'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { CartItemType } from '@/types'
import Skeleton from '@/components/ui/Skeleton'

export default function CartPage() {
  const { success, error } = useToast()
  const [cartItems, setCartItems] = useState<CartItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      setCartItems(data.data?.items ?? [])
    } catch {
      error('Gagal', 'Gagal memuat keranjang')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const updateQuantity = async (itemId: string, quantity: number) => {
    setUpdatingItem(itemId)
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity }),
      })
      if (res.ok) {
        await fetchCart()
        if (quantity === 0) success('Dihapus', 'Item dihapus dari keranjang')
      } else {
        const data = await res.json()
        error('Gagal', data.error)
      }
    } catch {
      error('Gagal', 'Terjadi kesalahan')
    } finally {
      setUpdatingItem(null)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal > 200000 ? 0 : 15000

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 bg-surface rounded-xl border border-border">
              <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gold" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-6">Belum ada produk di keranjang Anda</p>
          <Link href="/produk">
            <Button size="lg">
              Mulai Belanja <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Keranjang Belanja
          <span className="ml-3 text-lg font-normal text-gray-500">
            ({cartItems.length} item)
          </span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 p-4 bg-surface rounded-xl border border-border"
              >
                {/* Image */}
                <Link href={`/produk/${item.product.slug}`}>
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image
                      src={item.product.images?.[0]?.url ?? '/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/produk/${item.product.slug}`}>
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-gold transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.variant.type === 'SIZE' ? 'Ukuran' : 'Warna'}:{' '}
                      {item.variant.value}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, 0)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={updatingItem === item.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updatingItem === item.id || item.quantity <= 1}
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={
                        updatingItem === item.id || item.quantity >= item.product.stock
                      }
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-gold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkir</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                  </span>
                </div>
                {shippingCost === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    🎉 Gratis ongkir untuk pembelian di atas Rp 200.000
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(subtotal + shippingCost)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button fullWidth size="lg">
                  Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/produk" className="block text-center mt-3 text-sm text-gray-500 hover:text-gold transition-colors">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
