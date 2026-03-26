import Link from 'next/link'
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const categories = [
    { href: '/produk?kategori=kemeja', label: 'Kemeja' },
    { href: '/produk?kategori=blazer', label: 'Blazer' },
    { href: '/produk?kategori=dress', label: 'Dress' },
    { href: '/produk?kategori=outer', label: 'Outer' },
    { href: '/produk?kategori=sepatu', label: 'Sepatu' },
    { href: '/produk?kategori=tas', label: 'Tas' },
  ]

  const links = [
    { href: '/tentang', label: 'Tentang Kami' },
    { href: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
    { href: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
    { href: '/bantuan', label: 'Pusat Bantuan' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FM</span>
              </div>
              <span className="font-semibold text-white text-lg">
                Fashion<span className="text-gold">Market</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Platform marketplace fashion terpercaya untuk kebutuhan gaya Anda. Temukan
              koleksi mix & formal terbaik dari penjual pilihan.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Kategori</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Informasi</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <span>halo@fashionmarket.id</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span>0812-3456-7890</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>Jakarta Selatan, DKI Jakarta 12190</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} FashionMarket. Semua hak dilindungi.
          </p>
          <div className="flex items-center gap-2">
            <img
              src="/payment/visa.svg"
              alt="Visa"
              className="h-6 opacity-60"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              Midtrans
            </span>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              BCA
            </span>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              GoPay
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
