export type BillingCycle = 'avulso' | 'monthly' | 'semiannual' | 'annual'

export interface PlanServicePricing {
  avulso_value: number | null
  avulso_discount: number | null
  avulso_promo_discount: number | null
  avulso_promo_expires_at: string | null
  monthly_value: number | null
  monthly_discount: number | null
  monthly_promo_discount: number | null
  monthly_promo_expires_at: string | null
  semiannual_value: number | null
  semiannual_discount: number | null
  semiannual_promo_discount: number | null
  semiannual_promo_expires_at: string | null
  annual_value: number | null
  annual_discount: number | null
  annual_promo_discount: number | null
  annual_promo_expires_at: string | null
}

export interface PriceBreakdown {
  baseValue: number
  standardDiscountedPrice: number
  promotionalPrice: number | null
  hasActivePromo: boolean
  isPermanentDiscount: boolean
  promoExpiresAt: string | null
}

const cycleKeys: Record<
  BillingCycle,
  { value: string; discount: string; promo: string; expires: string }
> = {
  avulso: {
    value: 'avulso_value',
    discount: 'avulso_discount',
    promo: 'avulso_promo_discount',
    expires: 'avulso_promo_expires_at',
  },
  monthly: {
    value: 'monthly_value',
    discount: 'monthly_discount',
    promo: 'monthly_promo_discount',
    expires: 'monthly_promo_expires_at',
  },
  semiannual: {
    value: 'semiannual_value',
    discount: 'semiannual_discount',
    promo: 'semiannual_promo_discount',
    expires: 'semiannual_promo_expires_at',
  },
  annual: {
    value: 'annual_value',
    discount: 'annual_discount',
    promo: 'annual_promo_discount',
    expires: 'annual_promo_expires_at',
  },
}

export function isPromotionActive(promoDiscount: number | null, expiresAt: string | null): boolean {
  if (!promoDiscount || promoDiscount <= 0) return false
  if (!expiresAt) return false
  const now = new Date()
  const expiry = new Date(expiresAt)
  return now <= expiry
}

export function calculatePrice(service: PlanServicePricing, cycle: BillingCycle): PriceBreakdown {
  const keys = cycleKeys[cycle]
  const baseValue = Number((service as any)[keys.value]) || 0
  const permanentDiscount = Number((service as any)[keys.discount]) || 0
  const promoDiscount = Number((service as any)[keys.promo]) || 0
  const promoExpiresAt = (service as any)[keys.expires] as string | null

  const standardDiscountedPrice = Math.max(0, baseValue - (baseValue * permanentDiscount) / 100)

  const hasActivePromo = isPromotionActive(promoDiscount, promoExpiresAt)

  let promotionalPrice: number | null = null
  if (hasActivePromo) {
    promotionalPrice = Math.max(
      0,
      standardDiscountedPrice - (standardDiscountedPrice * promoDiscount) / 100,
    )
  }

  return {
    baseValue,
    standardDiscountedPrice,
    promotionalPrice,
    hasActivePromo,
    isPermanentDiscount: permanentDiscount > 0,
    promoExpiresAt: hasActivePromo ? promoExpiresAt : null,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
