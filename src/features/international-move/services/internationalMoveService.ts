import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type MovePlan = Database['public']['Tables']['move_plan']['Row']
export type MoveChecklistItem = Database['public']['Tables']['move_checklist_items']['Row']

export const MOVE_CHECKLIST_CATEGORIES = [
  { value: 'documentos', label: 'Documentos', emoji: '📋' },
  { value: 'saude',      label: 'Saúde',      emoji: '🏥' },
  { value: 'financeiro', label: 'Financeiro', emoji: '💰' },
  { value: 'bebe',       label: 'Bebê',       emoji: '👶' },
  { value: 'logistica',  label: 'Logística',  emoji: '📦' },
  { value: 'casa',       label: 'Casa',       emoji: '🏠' },
]

export const SUGGESTED_CHECKLIST_ITEMS: Record<string, string[]> = {
  documentos: [
    'Passaporte válido (mamãe)',
    'Passaporte válido (papai)',
    'Passaporte do bebê',
    'Visto americano (mamãe)',
    'Visto americano (papai)',
    'Certidão de nascimento apostilada',
    'Certidão de casamento apostilada',
    'Diploma apostilado',
    'CNH Internacional',
    'Seguro saúde com cobertura internacional',
  ],
  saude: [
    'Carteirinha de vacinação apostilada',
    'Prontuário médico completo',
    'Receitas médicas com tradução juramentada',
    'Contratar plano de saúde nos EUA',
    'Encontrar obstetra nos EUA antes de chegar',
    'Encontrar pediatra nos EUA antes de chegar',
    'Levar histórico pré-natal completo',
    'Solicitar receitas com doses para 6 meses',
  ],
  financeiro: [
    'Abrir conta bancária nos EUA',
    'Solicitar ITIN / SSN',
    'Transferir reserva financeira (Wise / Remessa Online)',
    'Encerrar contas desnecessárias no BR',
    'Contratar seguro viagem',
    'Solicitar cartão de crédito internacional',
    'Entender declaração de imposto (IRPF x IRS)',
  ],
  bebe: [
    'Certidão de nascimento do bebê',
    'Passaporte do bebê',
    'Visto americano do bebê',
    'Registrar nascimento no Consulado (se nascido no BR)',
    'Pesquisar daycare / creche próximos',
    'Encontrar pediatra antes de chegar',
    'Carteirinha de vacinação atualizada',
  ],
  logistica: [
    'Pesquisar empresa de frete internacional',
    'Listar itens a enviar vs comprar nos EUA',
    'Descartar / vender itens desnecessários',
    'Empacotar e etiquetar caixas',
    'Contratar seguro de carga',
    'Definir data de entrega dos itens',
    'Verificar restrições alfandegárias',
  ],
  casa: [
    'Cancelar contrato de aluguel no BR',
    'Pesquisar bairros e moradia nos EUA',
    'Definir moradia temporária na chegada',
    'Configurar endereço nos EUA (USPS)',
    'Contratar internet e utilities',
    'Listar eletrodomésticos necessários (110V)',
    'Pesquisar custo de vida da cidade destino',
  ],
}

export const US_CITIES = [
  { city: 'Miami',         state: 'FL' },
  { city: 'Orlando',       state: 'FL' },
  { city: 'Tampa',         state: 'FL' },
  { city: 'Dallas',        state: 'TX' },
  { city: 'Austin',        state: 'TX' },
  { city: 'Houston',       state: 'TX' },
  { city: 'Boston',        state: 'MA' },
  { city: 'New York',      state: 'NY' },
  { city: 'Los Angeles',   state: 'CA' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Chicago',       state: 'IL' },
  { city: 'Atlanta',       state: 'GA' },
  { city: 'Seattle',       state: 'WA' },
  { city: 'Denver',        state: 'CO' },
]

export async function fetchMovePlan(tenantId: string): Promise<MovePlan | null> {
  const { data } = await supabase
    .from('move_plan')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function saveMovePlan(
  tenantId: string,
  pregnancyId: string | null,
  fields: {
    planned_move_date: string
    destination_city: string
    destination_state: string
    destination_country?: string
    notes?: string | null
  },
  existingId?: string
): Promise<MovePlan> {
  if (existingId) {
    const { data, error } = await supabase
      .from('move_plan')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', existingId)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('move_plan')
    .insert({ tenant_id: tenantId, pregnancy_id: pregnancyId, ...fields })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchChecklistItems(tenantId: string): Promise<MoveChecklistItem[]> {
  const { data } = await supabase
    .from('move_checklist_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('sort_order')
    .order('created_at')
  return data ?? []
}

export async function addChecklistItem(
  tenantId: string,
  fields: { category: string; item_name: string; due_date?: string | null }
): Promise<MoveChecklistItem> {
  const { data, error } = await supabase
    .from('move_checklist_items')
    .insert({ tenant_id: tenantId, ...fields, status: 'pendente' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleChecklistItem(id: string, currentStatus: string | null): Promise<void> {
  const newStatus = currentStatus === 'concluido' ? 'pendente' : 'concluido'
  const { error } = await supabase
    .from('move_checklist_items')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await supabase.from('move_checklist_items').delete().eq('id', id)
  if (error) throw error
}

export async function bulkAddChecklistItems(
  tenantId: string,
  items: Array<{ category: string; item_name: string }>
): Promise<void> {
  const rows = items.map((item, i) => ({
    tenant_id: tenantId,
    category: item.category,
    item_name: item.item_name,
    status: 'pendente',
    sort_order: i,
  }))
  const { error } = await supabase.from('move_checklist_items').insert(rows)
  if (error) throw error
}
