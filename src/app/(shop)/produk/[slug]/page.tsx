'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  Package,
  Shield,
  Truck,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDate, getDiscountPercentage } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { useSession } from 'next-auth/react'
import { ProductWithDetails } from '@/types'
import Skeleton from '@/components/ui/Skeleton'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error } = useToast()

  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/produk/${slug}`)
        const data = await res.json()
        if (res.ok) {
          setProduct(data.data)
        } else {
          router.push('/produk')
        }
      } catch {
        router.push('/produk')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug, router])

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/masuk')
      return
    }

    setAddingToCart(true)
    try {
      const variantId = Object.values(selectedVariants)[0]
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product!.id, variantId, quantity }),
      })

      if (res.ok) {
        success('Berhasil!', 'Produk ditambahkan ke keranjang')
      } else {
        const data = await res.json()
        error('Gagal', data.error)
      }
    } catch {
      error('Gagal', 'Terjadi kesalahan')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!session) {
      router.push('/auth/masuk')
      return
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product!.id }),
      })
      const data = await res.json()
      setIsInWishlist(data.added)
      success(data.added ? 'Ditambahkan ke Wishlist' : 'Dihapus dari Wishlist')
    } catch {
      error('Gagal', 'Terjadi kesalahan')
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const discount = getDiscountPercentage(product.originalPrice ?? 0, product.price)
  const sizes = product.variants.filter((v) => v.type === 'SIZE')
  const colors = product.variants.filter((v) => v.type === 'COLOR')

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[selectedImage]?.url ?? '/placeholder-product.jpg'}
                    alt={product.images[selectedImage]?.altText ?? product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((i) => Math.min(product.images.length - 1, i + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {discount > 0 && (
                <div className="absolute top-3 left-3">
                  <Badge variant="danger">-{discount}%</Badge>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage
                        ? 'border-gold shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText ?? ''}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-gold font-medium mb-2">
              {product.category?.name}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product._count && product._count.reviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.averageRating ?? 0)
                          ? 'fill-gold text-gold'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {(product.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product._count.reviews} ulasan)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && <Badge variant="danger">Hemat {discount}%</Badge>}
            </div>

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Ukuran
                  {selectedVariants['SIZE'] && (
                    <span className="ml-2 text-gold">{selectedVariants['SIZE']}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, SIZE: v.id }))
                      }
                      disabled={v.stock === 0}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariants['SIZE'] === v.id
                          ? 'border-gold bg-gold-50 text-gold'
                          : v.stock === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                          : 'border-border text-gray-700 hover:border-gold'
                      }`}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-2">Warna</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((v) => (
                    <button
                      key={v.id}
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, COLOR: v.id }))
                      }
                      disabled={v.stock === 0}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariants['COLOR'] === v.id
                          ? 'border-gold bg-gold-50 text-gold'
                          : v.stock === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-border text-gray-700 hover:border-gold'
                      }`}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Jumlah</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Stok: {product.stock} tersedia
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </Button>
              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition-all ${
                  isInWishlist
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-border text-gray-500 hover:border-red-200 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3.5 rounded-xl border border-border text-gray-500 hover:border-gray-300 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-border pt-5 grid grid-cols-3 gap-4">
              {[
                { icon: <Truck className="w-4 h-4" />, label: 'Pengiriman Cepat' },
                { icon: <Shield className="w-4 h-4" />, label: 'Produk Original' },
                { icon: <Package className="w-4 h-4" />, label: 'Dikemas Rapi' },
              ].map((f, i) => (
                <div key={i} className="text-center">
                  <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center text-gold mx-auto mb-1.5">
                    {f.icon}
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deskripsi Produk</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-6 bg-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Ulasan Pembeli ({product._count?.reviews ?? 0})
            </h2>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0 text-gold font-semibold text-sm">
                    {review.user.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {review.user.name ?? 'Pengguna'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating ? 'fill-gold text-gold' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
