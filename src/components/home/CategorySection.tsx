'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CategoryType } from '@/types'

const categoryIcons: Record<string, string> = {
  kemeja: '👔',
  blazer: '🧥',
  dress: '👗',
  outer: '🧣',
  sepatu: '👠',
  tas: '👜',
  aksesori: '💍',
  celana: '👖',
}

const categoryColors: Record<string, string> = {
  kemeja: 'from-blue-50 to-blue-100 border-blue-200',
  blazer: 'from-gray-50 to-gray-100 border-gray-200',
  dress: 'from-pink-50 to-pink-100 border-pink-200',
  outer: 'from-amber-50 to-amber-100 border-amber-200',
  sepatu: 'from-purple-50 to-purple-100 border-purple-200',
  tas: 'from-rose-50 to-rose-100 border-rose-200',
  aksesori: 'from-yellow-50 to-yellow-100 border-yellow-200',
  celana: 'from-indigo-50 to-indigo-100 border-indigo-200',
}

interface CategorySectionProps {
  categories: CategoryType[]
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <section className="py-16 lg:py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Kategori Populer</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Temukan pakaian yang sempurna untuk setiap kesempatan
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.slice(0, 8).map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link href={`/produk?kategori=${category.slug}`}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-2xl border bg-gradient-to-br ${
                    categoryColors[category.slug] ||
                    'from-gray-50 to-gray-100 border-gray-200'
                  } p-6 text-center cursor-pointer transition-shadow hover:shadow-md group`}
                >
                  <div className="text-4xl mb-3">
                    {categoryIcons[category.slug] || '🛍️'}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gold transition-colors">
                    {category.name}
                  </h3>
                  {category._count && (
                    <p className="text-xs text-gray-500 mt-1">
                      {category._count.products} produk
                    </p>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
