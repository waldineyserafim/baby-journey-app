import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

// ─── Base DB types ───────────────────────────────────────────────────────────
type CatalogRow = Database['public']['Tables']['layette_catalog']['Row']
type UserItemRow = Database['public']['Tables']['layette_user_items']['Row']

// ─── Extended catalog type (new v2 columns not yet in generated types) ───────
export interface LayetteCatalogItem extends CatalogRow {
  // V2 columns added by migration 20260625000003
  subcategory?: string | null
  tags?: string[] | null
  need_level?: string | null
  buy_week_from?: number | null
  buy_week_to?: number | null
  use_from_week?: number | null
  use_to_week?: number | null
  max_quantity?: number | null
  can_borrow?: boolean | null
  can_rent?: boolean | null
  can_wait?: boolean | null
  good_as_gift?: boolean | null
  is_large_item?: boolean | null
  weight_kg?: number | null
  country_rec?: string | null
  avg_price_brl?: number | null
  avg_price_usd?: number | null
}

// ─── Extended user item type (v2 columns) ────────────────────────────────────
export interface LayetteUserItem extends UserItemRow {
  action?: string | null        // 'pendente'|'comprado'|'ganho'|'comprar_eua'|'lembrar_depois'|'dispensado'|'alugado'
  quantity_owned?: number | null
  gift_from?: string | null
}

// ─── Merged item (catalog + user data) ───────────────────────────────────────
export interface LayetteItem {
  catalog: LayetteCatalogItem
  userItem: LayetteUserItem | null
  // Derived convenience fields
  action: LayetteAction
  quantityOwned: number
  quantityIdeal: number
  isDone: boolean        // comprado/ganho/alugado
  isPending: boolean
  isDispensed: boolean
  isBuyInUSA: boolean
}

// ─── Engine output ────────────────────────────────────────────────────────────
export interface LayetteRecommendation {
  text: string
  urgency: 'alta' | 'media' | 'baixa' | 'none'
  savingsBRL: number | null
  actionSuggestion: 'brasil' | 'eua' | 'presentear' | 'alugar' | 'esperar' | 'dispensar' | null
  buyDeadlineWeek: number | null
}

// ─── Constants ───────────────────────────────────────────────────────────────
export type LayetteAction =
  | 'pendente'
  | 'comprado'
  | 'ganho'
  | 'comprar_eua'
  | 'lembrar_depois'
  | 'dispensado'
  | 'alugado'

export const ACTION_CONFIG: Record<LayetteAction, { label: string; color: string; bg: string }> = {
  pendente:       { label: 'Pendente',       color: '#64748b', bg: '#f1f5f9' },
  comprado:       { label: 'Comprado',       color: '#0ea5e9', bg: '#e0f2fe' },
  ganho:          { label: 'Ganho',          color: '#22c55e', bg: '#dcfce7' },
  comprar_eua:    { label: 'Comprar nos EUA',color: '#f59e0b', bg: '#fef3c7' },
  lembrar_depois: { label: 'Depois',         color: '#a855f7', bg: '#f3e8ff' },
  dispensado:     { label: 'Dispensado',     color: '#94a3b8', bg: '#f8fafc' },
  alugado:        { label: 'Alugado',        color: '#06b6d4', bg: '#ecfeff' },
}

export const NEED_LEVEL_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  essencial:    { label: 'Essencial',    color: '#ef4444', icon: '🔴' },
  recomendado:  { label: 'Recomendado', color: '#f59e0b', icon: '🟡' },
  conveniente:  { label: 'Conveniente', color: '#22c55e', icon: '🟢' },
  conforto:     { label: 'Conforto',    color: '#0ea5e9', icon: '🔵' },
  luxo:         { label: 'Luxo',        color: '#a855f7', icon: '🟣' },
}

export const CATEGORY_LABELS: Record<string, { name: string; icon: string; color: string }> = {
  quarto:        { name: 'Quarto',               icon: '🛏️',  color: '#7c3aed' },
  sono:          { name: 'Sono',                 icon: '🌙',  color: '#6366f1' },
  passeio:       { name: 'Passeio',              icon: '🚶',  color: '#0ea5e9' },
  seguranca:     { name: 'Segurança',            icon: '🛡️',  color: '#f59e0b' },
  alimentacao:   { name: 'Alimentação',          icon: '🍼',  color: '#22c55e' },
  amamentacao:   { name: 'Amamentação',          icon: '🤱',  color: '#ec4899' },
  higiene:       { name: 'Higiene',              icon: '🧴',  color: '#06b6d4' },
  banho:         { name: 'Banho',                icon: '🛁',  color: '#3b82f6' },
  saude:         { name: 'Saúde',                icon: '❤️',  color: '#ef4444' },
  roupas:        { name: 'Roupas',               icon: '👕',  color: '#f97316' },
  brinquedos:    { name: 'Brinquedos & Des.',    icon: '🧸',  color: '#8b5cf6' },
  maternidade:   { name: 'Maternidade',          icon: '🏥',  color: '#14b8a6' },
  pos_parto:     { name: 'Pós-parto',           icon: '🌸',  color: '#d946ef' },
  documentos:    { name: 'Documentos',           icon: '📄',  color: '#64748b' },
  mudanca:       { name: 'Mudança Intl.',        icon: '✈️',  color: '#0f172a' },
}

// ─── Merge catalog + userItem into LayetteItem ───────────────────────────────
export function mergeItem(catalog: LayetteCatalogItem, userItem: LayetteUserItem | null): LayetteItem {
  const action = (userItem?.action ?? 'pendente') as LayetteAction
  const quantityOwned = userItem?.quantity_owned ?? 0
  const quantityIdeal = userItem?.quantity_ideal ?? catalog.ideal_quantity ?? 1

  return {
    catalog,
    userItem,
    action,
    quantityOwned,
    quantityIdeal,
    isDone: ['comprado', 'ganho', 'alugado'].includes(action),
    isPending: action === 'pendente' || action === 'lembrar_depois',
    isDispensed: action === 'dispensado',
    isBuyInUSA: action === 'comprar_eua',
  }
}

// ─── Intelligence engine ──────────────────────────────────────────────────────
export function computeRecommendation(
  item: LayetteItem,
  gestWeek: number,
  movePlan: { moveDateStr: string; exchangeRate: number } | null,
): LayetteRecommendation {
  const { catalog, quantityOwned, quantityIdeal, isDone, isDispensed } = item

  // Already decided — no recommendation
  if (isDone || isDispensed || item.isBuyInUSA) {
    return { text: '', urgency: 'none', savingsBRL: null, actionSuggestion: null, buyDeadlineWeek: null }
  }

  // Quantity satisfied
  if (quantityOwned >= quantityIdeal) {
    return { text: 'Você já tem quantidade suficiente.', urgency: 'none', savingsBRL: null, actionSuggestion: null, buyDeadlineWeek: null }
  }

  const needLevel = catalog.need_level ?? 'recomendado'
  const buyTo = catalog.buy_week_to
  const buyFrom = catalog.buy_week_from
  const canRent = catalog.can_rent ?? false
  const canBorrow = catalog.can_borrow ?? false
  const goodAsGift = catalog.good_as_gift ?? false
  const countryRec = catalog.country_rec ?? 'brasil'
  const avgBrl = catalog.avg_price_brl ?? catalog.price_brl_min ?? null
  const avgUsd = catalog.avg_price_usd ?? catalog.price_usd_min ?? null

  // Urgency: deadline approaching
  if (buyTo !== null && buyTo !== undefined) {
    const weeksLeft = buyTo - gestWeek
    if (weeksLeft <= 0) {
      return {
        text: `⚠️ Você passou da semana ideal para comprar este item (semana ${buyTo}).`,
        urgency: 'alta',
        savingsBRL: null,
        actionSuggestion: 'brasil',
        buyDeadlineWeek: buyTo,
      }
    }
    if (weeksLeft <= 4) {
      return {
        text: `⏰ Compre antes da semana ${buyTo} — ${weeksLeft} semana(s) restantes.`,
        urgency: 'alta',
        savingsBRL: null,
        actionSuggestion: countryRec === 'usa' ? 'eua' : 'brasil',
        buyDeadlineWeek: buyTo,
      }
    }
  }

  // Too early to buy
  if (buyFrom !== null && buyFrom !== undefined && gestWeek < buyFrom) {
    if (needLevel === 'conforto' || needLevel === 'luxo') {
      return {
        text: `Ainda não precisa — compre a partir da semana ${buyFrom}.`,
        urgency: 'none',
        savingsBRL: null,
        actionSuggestion: 'esperar',
        buyDeadlineWeek: buyTo ?? null,
      }
    }
  }

  // Can rent
  if (canRent) {
    return {
      text: 'Este item pode ser alugado — vale verificar antes de comprar.',
      urgency: 'baixa',
      savingsBRL: null,
      actionSuggestion: 'alugar',
      buyDeadlineWeek: buyTo ?? null,
    }
  }

  // Good as gift
  if (goodAsGift) {
    return {
      text: 'Excelente opção para o chá de bebê ou lista de presentes.',
      urgency: 'baixa',
      savingsBRL: null,
      actionSuggestion: 'presentear',
      buyDeadlineWeek: buyTo ?? null,
    }
  }

  // Buy in USA with savings calculation
  if (countryRec === 'usa' && movePlan && avgBrl && avgUsd) {
    const usdInBrl = avgUsd * movePlan.exchangeRate
    const savings = avgBrl - usdInBrl
    if (savings > 30) {
      return {
        text: `Vale comprar nos EUA — economia estimada de R$ ${savings.toFixed(0)}.`,
        urgency: 'baixa',
        savingsBRL: savings,
        actionSuggestion: 'eua',
        buyDeadlineWeek: buyTo ?? null,
      }
    }
  }

  // Can borrow
  if (canBorrow) {
    return {
      text: 'Você pode pedir emprestado — pergunte na sua rede.',
      urgency: 'baixa',
      savingsBRL: null,
      actionSuggestion: null,
      buyDeadlineWeek: buyTo ?? null,
    }
  }

  // Default for essential items
  if (needLevel === 'essencial') {
    return {
      text: 'Item essencial — adquira o quanto antes.',
      urgency: 'media',
      savingsBRL: null,
      actionSuggestion: 'brasil',
      buyDeadlineWeek: buyTo ?? null,
    }
  }

  return { text: '', urgency: 'none', savingsBRL: null, actionSuggestion: null, buyDeadlineWeek: null }
}

// ─── API calls ────────────────────────────────────────────────────────────────
export async function fetchCatalog(): Promise<LayetteCatalogItem[]> {
  const { data, error } = await supabase
    .from('layette_catalog')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as LayetteCatalogItem[]
}

export async function fetchUserItems(pregnancyId: string): Promise<LayetteUserItem[]> {
  const { data, error } = await supabase
    .from('layette_user_items')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
  if (error) throw error
  return (data ?? []) as LayetteUserItem[]
}

// NOTE: action/quantity_owned/gift_from are v2 columns not yet in generated types.
// Using 'as any' until types are regenerated after migration.
export async function upsertUserItem(payload: {
  catalog_id: string
  pregnancy_id: string
  tenant_id: string
  action: LayetteAction
  quantity_ideal?: number | null
  quantity_owned?: number | null
  planned_value?: number | null
  paid_value?: number | null
  store_name?: string | null
  purchase_date?: string | null
  gift_from?: string | null
  notes?: string | null
}): Promise<LayetteUserItem> {
  const { data, error } = await supabase
    .from('layette_user_items')
    .upsert(
      { ...payload, status: payload.action, updated_at: new Date().toISOString() } as any,
      { onConflict: 'catalog_id,pregnancy_id' }
    )
    .select('*')
    .single()
  if (error) throw error
  return data as LayetteUserItem
}

export async function updateAction(id: string, action: LayetteAction): Promise<void> {
  const { error } = await supabase
    .from('layette_user_items')
    .update({ action, status: action, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
  if (error) throw error
}

export async function updateUserItemDetails(id: string, fields: {
  quantity_ideal?: number | null
  quantity_owned?: number | null
  paid_value?: number | null
  planned_value?: number | null
  store_name?: string | null
  purchase_date?: string | null
  gift_from?: string | null
  notes?: string | null
}): Promise<void> {
  const { error } = await supabase
    .from('layette_user_items')
    .update({ ...fields, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
  if (error) throw error
}

export async function removeUserItem(id: string): Promise<void> {
  const { error } = await supabase.from('layette_user_items').delete().eq('id', id)
  if (error) throw error
}

// Legacy exports for backward compat (LayetteIntelligencePage still uses old types)
export type LayetteCatalog = LayetteCatalogItem
export type { UserItemRow as LayetteUserItemRow }
export const STATUS_CONFIG = ACTION_CONFIG
