'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight, Star, TrendingUp } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-bg via-white to-gold-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-forest/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Koleksi Terbaru 2025</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              Gaya{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-500">
                Elegan
              </span>
              <br />
              untuk Setiap{' '}
              <span className="text-forest">Momen</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Temukan koleksi fashion mix & formal terbaik. Dari kemeja elegan hingga
              dress modern — semua ada di FashionMarket.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <Link href="/produk">
                <Button size="lg" className="group">
                  Belanja Sekarang
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/produk?sort=terbaru">
                <Button variant="outline" size="lg">
                  Lihat Koleksi Baru
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center gap-8 justify-center lg:justify-start"
            >
              {[
                { value: '10K+', label: 'Produk' },
                { value: '5K+', label: 'Pembeli' },
                { value: '4.9', label: 'Rating', icon: <Star className="w-3.5 h-3.5 fill-gold text-gold" /> },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    {stat.icon}
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
              {/* Main card */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-100 to-forest-50 rounded-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-gold to-gold-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                      <span className="text-5xl">👗</span>
                    </div>
                    <p className="text-gray-700 font-medium text-lg">Fashion Terbaik</p>
                    <p className="text-gray-500 text-sm mt-1">Mix & Formal Collection</p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Premium Quality</p>
                    <p className="text-xs text-gray-500">Terverifikasi</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🚚</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Pengiriman Cepat</p>
                    <p className="text-xs text-gray-500">Ke seluruh Indonesia</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
