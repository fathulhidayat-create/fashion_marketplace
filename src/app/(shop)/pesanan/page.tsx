'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { OrderType } from '@/types'
import Skeleton from '@/components/ui/Skeleton'

export default function PesananPage() {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/pesanan')
      const data = await res.json()
      setOrders(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gold" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Pesanan</h2>
          <p className="text-gray-500 mb-6">Mulai belanja dan buat pesanan pertamamu</p>
          <Link href="/produk">
            <button className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-medium hover:bg-gold-500 transition-colors">
              Mulai Belanja <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>

        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/pesanan/${order.orderNumber}`}>
                <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gold transition-colors" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {order.items?.length ?? 0} produk
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-gray-500">Total Pembayaran</span>
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>

                  {order.status === 'DIBUAT' && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        ⚠️ Menunggu pembayaran — selesaikan sebelum pesanan dibatalkan
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
