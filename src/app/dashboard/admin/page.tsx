'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users, Package, ShoppingBag, Tag } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { OrderStatusBadge, ProductStatusBadge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

export default function AdminDashboardPage() {
  const { success, error } = useToast()
  const [tab, setTab] = useState<'produk'|'pesanan'|'pengguna'|'kategori'>('produk')
  const [data, setData] = useState<any>({ products: [], orders: [], users: [], categories: [] })
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [p, o, k] = await Promise.all([
        fetch('/api/produk?limit=50').then(r=>r.json()),
        fetch('/api/pesanan?limit=50').then(r=>r.json()),
        fetch('/api/kategori').then(r=>r.json()),
      ])
      setData({ products: p.data??[], orders: o.data??[], categories: k.data??[] })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const approveProduct = async (id: string) => {
    const res = await fetch(`/api/produk/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'ACTIVE' }) })
    if (res.ok) { success('Produk disetujui'); fetchAll() } else error('Gagal','')
  }

  const stats = [
    { label:'Total Produk', value: data.products.length, icon: Package },
    { label:'Pesanan', value: data.orders.length, icon: ShoppingBag },
    { label:'Kategori', value: data.categories.length, icon: Tag },
    { label:'Menunggu Review', value: data.products.filter((p:any)=>p.status==='PENDING').length, icon: Package },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-500 mb-8">Kelola seluruh platform FashionMarket</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s,i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-5">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{loading?'—':s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {(['produk','pesanan','kategori'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab===t?'border-gold text-gold':'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t==='produk'?'Produk':t==='pesanan'?'Pesanan':'Kategori'}
            </button>
          ))}
        </div>

        {tab === 'produk' && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Produk</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Penjual</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.products.map((p:any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="font-medium text-gray-900 line-clamp-1">{p.name}</p><p className="text-xs text-gray-400">{formatPrice(p.price)}</p></td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.seller?.name}</td>
                    <td className="px-4 py-3"><ProductStatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'PENDING' && (
                        <button onClick={() => approveProduct(p.id)} className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors">Setujui</button>
                      )}
                      <button onClick={() => { fetch(`/api/produk/${p.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'INACTIVE'})}).then(()=>fetchAll()) }} className="ml-2 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors">Nonaktifkan</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'pesanan' && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border"><tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">No. Pesanan</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">Tanggal</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Total</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {data.orders.map((o:any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 hidden md:table-cell">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'kategori' && (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border"><tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Kategori</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Jumlah Produk</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {data.categories.map((c:any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{c._count?.products ?? 0}</td>
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
