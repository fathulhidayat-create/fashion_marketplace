'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().int().positive(),
  originalPrice: z.coerce.number().int().positive().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, 'Pilih kategori'),
  tags: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

type ProductFormData = z.infer<typeof productSchema>

export default function NewProductPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) })

  useEffect(() => {
    fetch('/api/kategori').then(r => r.json()).then(d => setCategories(d.data ?? []))
  }, [])

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const images = data.imageUrl ? [{ url: data.imageUrl, order: 0 }] : []
      const tags = data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
      const res = await fetch('/api/produk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, description: data.description, price: data.price, originalPrice: data.originalPrice || undefined, stock: data.stock, categoryId: data.categoryId, tags, images }),
      })
      const result = await res.json()
      if (res.ok) { success('Produk ditambahkan!', 'Menunggu persetujuan admin'); router.push('/dashboard/penjual') }
      else error('Gagal', result.error)
    } catch { error('Gagal', 'Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gold mb-6 text-sm"><ChevronLeft className="w-4 h-4" /> Kembali</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Tambah Produk Baru</h1>
        <div className="bg-surface rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Nama Produk" placeholder="Contoh: Kemeja Formal Slim Fit" error={errors.name?.message} required {...register('name')} />
            <Textarea label="Deskripsi" placeholder="Deskripsi lengkap produk..." rows={4} error={errors.description?.message} required {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Harga (Rp)" type="number" placeholder="150000" error={errors.price?.message} required {...register('price')} />
              <Input label="Harga Asli (opsional)" type="number" placeholder="200000" error={errors.originalPrice?.message} {...register('originalPrice')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Stok" type="number" placeholder="10" error={errors.stock?.message} required {...register('stock')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                <select {...register('categoryId')} className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gold">
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>}
              </div>
            </div>
            <Input label="URL Gambar (opsional)" type="url" placeholder="https://..." error={errors.imageUrl?.message} {...register('imageUrl')} />
            <Input label="Tags (pisah koma)" placeholder="formal, kemeja" {...register('tags')} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" fullWidth loading={isSubmitting} size="lg">Tambah Produk</Button>
              <Button type="button" variant="outline" onClick={() => router.back()} size="lg">Batal</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
