import { prisma } from '@/lib/prisma'
import Hero from '@/components/home/Hero'
import CategorySection from '@/components/home/CategorySection'
import PromoBanner from '@/components/home/PromoBanner'
import TrendingProducts from '@/components/home/TrendingProducts'
import { CategoryType, ProductWithDetails } from '@/types'

async function getHomeData() {
  try {
    const [categories, trendingProducts] = await Promise.all([
      prisma.category.findMany({
        take: 8,
        include: {
          _count: { select: { products: { where: { status: 'ACTIVE' } } } },
        },
        orderBy: { products: { _count: 'desc' } },
      }),
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, name: true, image: true } },
          variants: true,
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true, wishlist: true } },
        },
      }),
    ])

    const productsWithRating = trendingProducts.map((p) => ({
      ...p,
      averageRating:
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0,
    }))

    return {
      categories: categories as CategoryType[],
      trendingProducts: productsWithRating as unknown as ProductWithDetails[],
    }
  } catch {
    return { categories: [], trendingProducts: [] }
  }
}

export default async function HomePage() {
  const { categories, trendingProducts } = await getHomeData()

  return (
    <>
      <Hero />
      <CategorySection categories={categories} />
      <PromoBanner />
      <TrendingProducts products={trendingProducts} />
    </>
  )
}
