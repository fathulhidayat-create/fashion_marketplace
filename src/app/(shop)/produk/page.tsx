'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useSession } from 'next-auth/react'
import { ProductWithDetails, CategoryType, PaginationMeta } from '@/types'
import { formatPrice } from '@/lib/utils'

export default function ProdukPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { success, error } = useToast()

  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('kategori') ?? '')
  const [minHarga, setMinHarga] = useState(searchParams.get('minHarga') ?? '')
  const [maxHarga, setMaxHarga] = useState(searchParams.get('maxHarga') ?? '')
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'terbaru')
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1))

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedCategory) params.set('kategori', selectedCategory)
      if (minHarga) params.set('minHarga', minHarga)
      if (maxHarga) params.set('maxHarga', maxHarga)
      params.set('sort', sort)
      params.set('page', String(page))
      params.set('limit', '12')

      const res = await fetch(`/api/produk?${params.toString()}`)
      const data = await res.json()
      setProducts(data.data ?? [])
      setMeta(data.meta)
    } catch {
      error('Gagal', 'Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, minHarga, maxHarga, sort, page, error])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/kategori')
      const data = await res.json()
      setCategories(data.data ?? [])
    } catch {}
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
        error('Gagal', data.error)
      }
    } catch {
      error('Gagal', 'Terjadi kesalahan')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setMinHarga('')
    setMaxHarga('')
    setSort('terbaru')
    setPage(1)
  }

  const hasActiveFilters = search || selectedCategory || minHarga || maxHarga || sort !== 'terbaru'

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Produk</h1>
          <p className="text-gray-500">
            {meta ? `${meta.total} produk ditemukan` : 'Temukan fashion terbaik untukmu'}
          </p>
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <Input
              placeholder="Cari produk fashion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </form>

          <div className="flex gap-3">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="px-4 py-2.5 text-sm border border-border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
              <option value="terpopuler">Terpopuler</option>
            </select>

            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-surface rounded-xl border border-border p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filter Produk</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                >
                  <X className="w-3 h-3" /> Reset Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Min</label>
                <input
                  type="number"
                  value={minHarga}
                  onChange={(e) => { setMinHarga(e.target.value); setPage(1) }}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Max</label>
                <input
                  type="number"
                  value={maxHarga}
                  onChange={(e) => { setMaxHarga(e.target.value); setPage(1) }}
                  placeholder="Tidak terbatas"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Category Filter Chips */}
        {selectedCategory && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-50 border border-gold-200 text-gold-700 rounded-full text-sm">
              {categories.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory}
              <button onClick={() => setSelectedCategory('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h3>
            <p className="text-gray-500 mb-6">Coba ubah kata kunci atau filter pencarian Anda</p>
            <Button variant="outline" onClick={clearFilters}>Reset Filter</Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(7, meta.totalPages) }, (_, i) => {
                let pageNum: number
                if (meta.totalPages <= 7) {
                  pageNum = i + 1
                } else if (page <= 4) {
                  pageNum = i + 1
                } else if (page >= meta.totalPages - 3) {
                  pageNum = meta.totalPages - 6 + i
                } else {
                  pageNum = page - 3 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-gold text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
