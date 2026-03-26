'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import Skeleton from '@/components/ui/Skeleton'

export default function WishlistPage() {
  const { success, error } = useToast()
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist')
      const data = await res.json()
      setWishlist(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setWishlist((prev) => prev.filter((w) => w.productId !== productId))
        success('Dihapus dari wishlist')
      }
    } catch { error('Gagal', 'Terjadi kesalahan') }
  }

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (res.ok) success('Ditambahkan ke keranjang')
      else error('Gagal', 'Stok mungkin habis')
    } catch { error('Gagal', 'Terjadi kesalahan') }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    </div>
  )

  if (wishlist.length === 0) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-12 h-12 text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Wishlist Kosong</h2>
        <p className="text-gray-500 mb-6">Simpan produk favoritmu di sini</p>
        <Link href="/produk" className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-medium hover:bg-gold-500 transition-colors">
          Jelajahi Produk <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist ({wishlist.length})</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface rounded-xl border border-border overflow-hidden group"
            >
              <Link href={`/produk/${item.product.slug}`}>
                <div className="relative aspect-[3/4] bg-gray-50">
                  <Image src={item.product.images?.[0]?.url ?? '/placeholder-product.jpg'} alt={item.product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
              <div className="p-3">
                <p className="text-xs text-gray-500 mb-0.5">{item.product.category?.name}</p>
                <Link href={`/produk/${item.product.slug}`}>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gold transition-colors mb-2">{item.product.name}</p>
                </Link>
                <p className="text-sm font-bold text-gray-900 mb-3">{formatPrice(item.product.price)}</p>
                <div className="flex gap-2">
                  <button onClick={() => addToCart(item.productId)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-gold-50 text-gold border border-gold-200 rounded-lg hover:bg-gold hover:text-white transition-all">
                    <ShoppingBag className="w-3 h-3" /> Keranjang
                  </button>
                  <button onClick={() => removeFromWishlist(item.productId)} className="p-1.5 border border-border rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
