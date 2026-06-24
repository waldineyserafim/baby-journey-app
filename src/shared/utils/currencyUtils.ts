export interface PriceComparison {
  priceBRL: number
  priceUSD: number
  exchangeRate: number
  priceUSDinBRL: number
  savingsBRL: number
  savingsPercent: number
  buyInUSA: boolean
}

export function comparePrices(
  priceBRL: number,
  priceUSD: number,
  exchangeRate: number = 5.5
): PriceComparison {
  const priceUSDinBRL = priceUSD * exchangeRate
  const savingsBRL = priceBRL - priceUSDinBRL
  const savingsPercent = Math.round((savingsBRL / priceBRL) * 100)
  return {
    priceBRL,
    priceUSD,
    exchangeRate,
    priceUSDinBRL,
    savingsBRL,
    savingsPercent,
    buyInUSA: savingsBRL > 0,
  }
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export type Recommendation =
  | 'COMPRAR_AGORA_BRASIL'
  | 'AGUARDAR_EUA'
  | 'SO_PROMOCAO'
  | 'RECEBER_PRESENTE'
  | 'NAO_PRIORITARIO'

export interface RecommendationInput {
  dueDateStr: string
  moveDateStr: string | null
  usagePeriod: 'NO_NASCIMENTO' | 'ATE_3_MESES' | 'ATE_6_MESES' | 'APOS_6_MESES'
  criticality: 'CRITICO' | 'IMPORTANTE' | 'OPCIONAL'
  priceBRL: number | null
  priceUSD: number | null
  exchangeRate?: number
}

export function calculateRecommendation(input: RecommendationInput): Recommendation {
  const {
    dueDateStr,
    moveDateStr,
    usagePeriod,
    criticality,
    priceBRL,
    priceUSD,
    exchangeRate = 5.5,
  } = input

  if (!moveDateStr) return 'COMPRAR_AGORA_BRASIL'

  const dueDate = new Date(dueDateStr)
  const moveDate = new Date(moveDateStr)
  const today = new Date()

  const monthsToBirth = Math.max(0, (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const monthsToMove = Math.max(0, (moveDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30))

  const usageStartMonths: Record<string, number> = {
    NO_NASCIMENTO: 0,
    ATE_3_MESES: 0,
    ATE_6_MESES: 3,
    APOS_6_MESES: 6,
  }
  const usageMonths = usageStartMonths[usagePeriod] ?? 0
  const monthsUntilNeeded = monthsToBirth + usageMonths

  if (criticality === 'OPCIONAL') return 'NAO_PRIORITARIO'

  if (monthsUntilNeeded > monthsToMove + 1) {
    if (priceBRL && priceUSD) {
      const comparison = comparePrices(priceBRL, priceUSD, exchangeRate)
      if (comparison.savingsPercent > 20) return 'AGUARDAR_EUA'
    }
    return 'AGUARDAR_EUA'
  }

  if (criticality === 'IMPORTANTE' && priceBRL && priceUSD) {
    const comparison = comparePrices(priceBRL, priceUSD, exchangeRate)
    if (comparison.savingsPercent > 40) return 'AGUARDAR_EUA'
    if (comparison.savingsPercent > 15) return 'SO_PROMOCAO'
  }

  if (criticality === 'CRITICO') return 'COMPRAR_AGORA_BRASIL'

  return 'COMPRAR_AGORA_BRASIL'
}

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  COMPRAR_AGORA_BRASIL: '🇧🇷 Comprar agora no Brasil',
  AGUARDAR_EUA: '🇺🇸 Aguardar e comprar nos EUA',
  SO_PROMOCAO: '🏷️ Comprar apenas em promoção',
  RECEBER_PRESENTE: '🎁 Receber de presente',
  NAO_PRIORITARIO: '⏸️ Não prioritário',
}

export const RECOMMENDATION_COLORS: Record<Recommendation, string> = {
  COMPRAR_AGORA_BRASIL: 'success',
  AGUARDAR_EUA: 'primary',
  SO_PROMOCAO: 'warning',
  RECEBER_PRESENTE: 'info',
  NAO_PRIORITARIO: 'secondary',
}
