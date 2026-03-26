'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import ProductCard from '@/components/shop/ProductCard'
import { ProductWithDetails } from '@/types'
import { ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface TrendingProductsProps {
  products: ProductWithDetails[]
}

export default function TrendingProducts({ products }: TrendingProductsProps) {
  const { data: session } = useSession()
  const { success, error } = useToast()
  const router = useRouter()

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      router.push('/auth/masuk')
      return
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (res.ok) {
        success('Berhasil!', 'Produk ditambahkan ke keranjang')
      } else {
        const data = await res.json()
        error('Gagal', data.error || 'Gagal menambahkan ke keranjang')
      }
    } catch {
      error('Gagal', 'Terjadi kesalahan')
    }
  }

  if (products.length === 0) return null

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Produk Terbaru</h2>
            <p className="text-gray-500">Koleksi fashion pilihan kami untukmu</p>
          </div>
          <Link
            href="/produk"
            className="hidden sm:flex items-center gap-2 text-gold hover:text-gold-500 font-medium text-sm transition-colors"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-500 font-medium text-sm transition-colors"
          >
            Lihat Semua Produk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
