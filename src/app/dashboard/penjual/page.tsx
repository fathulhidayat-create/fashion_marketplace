'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Package, TrendingUp, Edit, Trash2, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'
import { ProductStatusBadge, OrderStatusBadge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import Skeleton from '@/components/ui/Skeleton'

export default function SellerDashboardPage() {
  const { success, error } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'produk' | 'pesanan'>('produk')

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/produk?limit=50'),
        fetch('/api/pesanan?limit=20'),
      ])
      const [prodData, orderData] = await Promise.all([prodRes.json(), orderRes.json()])
      setProducts(prodData.data ?? [])
      setOrders(orderData.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const deleteProduct = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    try {
      const res = await fetch(`/api/produk/${id}`, { method: 'DELETE' })
      if (res.ok) { success('Produk dihapus'); fetchData() }
      else error('Gagal', 'Tidak bisa hapus produk')
    } catch { error('Gagal', 'Terjadi kesalahan') }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/pesanan/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) { success('Status diperbarui'); fetchData() }
      else error('Gagal', 'Tidak bisa update status')
    } catch { error('Gagal', 'Terjadi kesalahan') }
  }

  const stats = [
    { label: 'Total Produk', value: products.length, icon: Package },
    { label: 'Produk Aktif', value: products.filter(p => p.status === 'ACTIVE').length, icon: TrendingUp },
    { label: 'Total Pesanan', value: orders.length, icon: Package },
    { label: 'Pesanan Baru', value: orders.filter((o: any) => o.status === 'DIBAYAR').length, icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Penjual</h1>
            <p className="text-gray-500 mt-1">Kelola produk dan pesanan Anda</p>
          </div>
          <Link href="/dashboard/penjual/produk/baru">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Produk
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-surface rounded-xl border border-border p-5"
            >
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {(['produk', 'pesanan'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'produk' ? 'Produk Saya' : 'Pesanan Masuk'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : activeTab === 'produk' ? (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Produk</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Harga</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">Stok</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada produk</td></tr>
                ) : products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category?.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{product.stock}</td>
                    <td className="px-4 py-3"><ProductStatusBadge status={product.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/produk/${product.slug}`}><button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Eye className="w-4 h-4" /></button></Link>
                        <Link href={`/dashboard/penjual/produk/${product.id}`}><button className="p-1.5 text-gray-400 hover:text-gold transition-colors"><Edit className="w-4 h-4" /></button></Link>
                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">No. Pesanan</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Total</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada pesanan</td></tr>
                ) : orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 hidden md:table-cell">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:ring-1 focus:ring-gold focus:outline-none"
                      >
                        {['DIBUAT','DIBAYAR','DIPROSES','DIKIRIM','SELESAI','BATAL'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
