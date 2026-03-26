'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, ShoppingBag } from 'lucide-react'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { ProductWithDetails } from '@/types'

interface ProductCardProps {
  product: ProductWithDetails
  onAddToCart?: (productId: string) => void
  onToggleWishlist?: (productId: string) => void
  isInWishlist?: boolean
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const discount = getDiscountPercentage(product.originalPrice ?? 0, product.price)
  const mainImage = product.images?.[0]?.url || '/placeholder-product.jpg'
  const avgRating = product.averageRating ?? 0
  const reviewCount = product._count?.reviews ?? 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-surface rounded-xl border border-border overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <Link href={`/produk/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge variant="danger" size="sm">
                -{discount}%
              </Badge>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="warning" size="sm">
                Sisa {product.stock}
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="default" size="sm">
                Habis
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleWishlist?.(product.id)
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 ${
              isInWishlist
                ? 'bg-red-500 text-white opacity-100'
                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/produk/${product.slug}`}>
          <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="text-xs text-gray-600 font-medium">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </Link>

        {/* Add to Cart */}
        {product.stock > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onAddToCart?.(product.id)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gold-50 text-gold-600 text-sm font-medium hover:bg-gold hover:text-white transition-all duration-200 border border-gold-200 hover:border-gold"
          >
            <ShoppingBag className="w-4 h-4" />
            Tambah ke Keranjang
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
