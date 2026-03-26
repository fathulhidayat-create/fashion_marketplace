import { Role, OrderStatus, ProductStatus } from '@prisma/client'

export type { Role, OrderStatus, ProductStatus }

export interface UserSession {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: Role
}

export interface ProductWithDetails {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number | null
  stock: number
  status: ProductStatus
  tags: string[]
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
  }
  seller: {
    id: string
    name?: string | null
    image?: string | null
  }
  images: ProductImageType[]
  variants: ProductVariantType[]
  reviews: ReviewType[]
  _count?: {
    reviews: number
    wishlist: number
  }
  averageRating?: number
}

export interface ProductImageType {
  id: string
  url: string
  altText?: string | null
  order: number
}

export interface ProductVariantType {
  id: string
  type: 'SIZE' | 'COLOR'
  value: string
  stock: number
  priceAdjustment: number
}

export interface CartItemType {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    slug: string
    images: ProductImageType[]
    stock: number
  }
  variant?: ProductVariantType | null
}

export interface OrderType {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  shippingCost: number
  total: number
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  items: OrderItemType[]
  shippingAddress?: ShippingAddressType | null
  payment?: PaymentTransactionType | null
}

export interface OrderItemType {
  id: string
  quantity: number
  price: number
  productName: string
  productImage?: string | null
  product: {
    id: string
    slug: string
  }
  variant?: ProductVariantType | null
}

export interface ShippingAddressType {
  id: string
  recipientName: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
}

export interface PaymentTransactionType {
  id: string
  transactionId?: string | null
  snapToken?: string | null
  status: string
  amount: number
  paymentType?: string | null
}

export interface ReviewType {
  id: string
  rating: number
  comment?: string | null
  createdAt: Date
  user: {
    id: string
    name?: string | null
    image?: string | null
  }
}

export interface CategoryType {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  _count?: {
    products: number
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  meta?: PaginationMeta
}

export interface CheckoutFormData {
  recipientName: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string
}
