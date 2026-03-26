'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().int().positive(),
  originalPrice: z.coerce.number().int().positive().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  tags: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { success, error } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) })

  useEffect(() => {
    Promise.all([
      fetch('/api/kategori').then(r => r.json()),
      fetch(`/api/produk/${id}`).then(r => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData.data ?? [])
      const p = prodData.data
      if (p) reset({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice ?? '', stock: p.stock, categoryId: p.categoryId, tags: p.tags?.join(', ') ?? '' })
    }).finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const tags = data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
      const res = await fetch(`/api/produk/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, originalPrice: data.originalPrice || undefined, tags }),
      })
      const result = await res.json()
      if (res.ok) { success('Produk diperbarui'); router.push('/dashboard/penjual') }
      else error('Gagal', result.error)
    } catch { error('Gagal', 'Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gold mb-6 text-sm"><ChevronLeft className="w-4 h-4" /> Kembali</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Produk</h1>
        <div className="bg-surface rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Nama Produk" error={errors.name?.message} required {...register('name')} />
            <Textarea label="Deskripsi" rows={4} error={errors.description?.message} required {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Harga (Rp)" type="number" error={errors.price?.message} required {...register('price')} />
              <Input label="Harga Asli (opsional)" type="number" error={errors.originalPrice?.message} {...register('originalPrice')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Stok" type="number" error={errors.stock?.message} required {...register('stock')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                <select {...register('categoryId')} className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gold">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <Input label="Tags (pisah koma)" {...register('tags')} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" fullWidth loading={isSubmitting} size="lg">Simpan Perubahan</Button>
              <Button type="button" variant="outline" onClick={() => router.back()} size="lg">Batal</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
