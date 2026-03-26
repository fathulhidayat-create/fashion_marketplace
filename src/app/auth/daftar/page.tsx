'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function DaftarPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })

      const result = await res.json()

      if (res.ok) {
        success('Registrasi Berhasil!', 'Silakan masuk dengan akun Anda')
        router.push('/auth/masuk')
      } else {
        showError('Registrasi Gagal', result.error)
      }
    } catch {
      showError('Registrasi Gagal', 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">FM</span>
            </div>
            <span className="font-semibold text-gray-900 text-xl">
              Fashion<span className="text-gold">Market</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm">Bergabung dengan FashionMarket hari ini</p>
        </div>

        {/* Form */}
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Masukkan nama lengkap"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="email@contoh.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimal 8 karakter"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pointer-events-auto"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Input
              label="Konfirmasi Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              Daftar Sekarang
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{' '}
            <Link
              href="/auth/masuk"
              className="text-gold font-medium hover:text-gold-500 transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
