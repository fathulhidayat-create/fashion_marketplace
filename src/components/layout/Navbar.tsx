'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, User, Menu, X, Search, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/produk', label: 'Semua Produk' },
    { href: '/produk?kategori=kemeja', label: 'Kemeja' },
    { href: '/produk?kategori=blazer', label: 'Blazer' },
    { href: '/produk?kategori=dress', label: 'Dress' },
    { href: '/produk?kategori=outer', label: 'Outer' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg hidden sm:block">
              Fashion<span className="text-gold">Market</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gold transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/produk"
              className="p-2 text-gray-600 hover:text-gold transition-colors rounded-lg hover:bg-gray-50"
            >
              <Search className="w-5 h-5" />
            </Link>

            {session ? (
              <>
                <Link
                  href="/wishlist"
                  className="p-2 text-gray-600 hover:text-gold transition-colors rounded-lg hover:bg-gray-50"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  href="/cart"
                  className="p-2 text-gray-600 hover:text-gold transition-colors rounded-lg hover:bg-gray-50"
                >
                  <ShoppingBag className="w-5 h-5" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-gold transition-colors rounded-lg hover:bg-gray-50"
                  >
                    <User className="w-5 h-5" />
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-border shadow-lg z-20 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/pesanan"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Pesanan Saya
                            </Link>
                            <Link
                              href="/wishlist"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Wishlist
                            </Link>
                            {(session.user.role === 'SELLER' ||
                              session.user.role === 'ADMIN') && (
                              <Link
                                href="/dashboard/penjual"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                Dashboard Penjual
                              </Link>
                            )}
                            {session.user.role === 'ADMIN' && (
                              <Link
                                href="/dashboard/admin"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                Dashboard Admin
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false)
                                signOut({ callbackUrl: '/' })
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Keluar
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/masuk">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/auth/daftar">
                  <Button variant="primary" size="sm">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2.5 text-sm text-gray-700 hover:text-gold transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
