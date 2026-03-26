import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'forest'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gold: 'bg-gold-50 text-gold-600 border border-gold-200',
    forest: 'bg-forest-50 text-forest border border-forest-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    DIBUAT: { label: 'Dibuat', variant: 'info' },
    DIBAYAR: { label: 'Dibayar', variant: 'warning' },
    DIPROSES: { label: 'Diproses', variant: 'warning' },
    DIKIRIM: { label: 'Dikirim', variant: 'forest' },
    SELESAI: { label: 'Selesai', variant: 'success' },
    BATAL: { label: 'Batal', variant: 'danger' },
  }

  const config = statusMap[status] ?? { label: status, variant: 'default' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function ProductStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    ACTIVE: { label: 'Aktif', variant: 'success' },
    INACTIVE: { label: 'Nonaktif', variant: 'danger' },
    PENDING: { label: 'Menunggu', variant: 'warning' },
  }

  const config = statusMap[status] ?? { label: status, variant: 'default' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
