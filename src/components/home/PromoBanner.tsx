'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function PromoBanner() {
  return (
    <section className="py-12 lg:py-16 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Main Promo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gold-400 to-gold-600 p-8 text-white group cursor-pointer"
          >
            <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative z-10">
              <p className="text-sm font-medium text-gold-100 mb-2">Penawaran Spesial</p>
              <h3 className="text-3xl font-bold mb-3 leading-tight">
                Diskon hingga<br />
                <span className="text-4xl">50% OFF</span>
              </h3>
              <p className="text-gold-100 text-sm mb-6">
                Koleksi formal terpilih untuk tampilan profesional Anda
              </p>
              <Link
                href="/produk?diskon=true"
                className="inline-flex items-center gap-2 bg-white text-gold-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-50 transition-colors"
              >
                Lihat Promo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Secondary Promo */}
          <div className="grid grid-rows-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-forest-600 to-forest-800 p-6 text-white group cursor-pointer"
            >
              <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-xs font-medium text-forest-200 mb-1">Koleksi Baru</p>
                <h3 className="text-xl font-bold mb-2">Street Style 2025</h3>
                <p className="text-forest-200 text-xs mb-4">Tampil kasual namun tetap stylish</p>
                <Link
                  href="/produk?kategori=casual"
                  className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Explore <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white group cursor-pointer"
            >
              <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-xs font-medium text-gray-400 mb-1">Premium Series</p>
                <h3 className="text-xl font-bold mb-2">Koleksi Formal</h3>
                <p className="text-gray-400 text-xs mb-4">Elegan untuk momen profesional</p>
                <Link
                  href="/produk?kategori=formal"
                  className="inline-flex items-center gap-1.5 bg-gold/20 hover:bg-gold/30 text-gold text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-gold/30"
                >
                  Lihat Koleksi <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
