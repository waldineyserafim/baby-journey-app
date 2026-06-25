import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type LayetteCatalog = Database['public']['Tables']['layette_catalog']['Row']
export type LayetteCatalogInsert = Database['public']['Tables']['layette_catalog']['Insert']

export interface AdminStats {
  tenantsCount: number
  usersCount: number
  pregnanciesCount: number
  recentTenants: { id: string; name: string; plan_type: string; created_at: string | null }[]
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const [tenantsRes, usersRes, pregnanciesRes, recentRes] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('pregnancies').select('*', { count: 'exact', head: true }),
    supabase.from('tenants').select('id,name,plan_type,created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return {
    tenantsCount: tenantsRes.count ?? 0,
    usersCount: usersRes.count ?? 0,
    pregnanciesCount: pregnanciesRes.count ?? 0,
    recentTenants: (recentRes.data ?? []) as AdminStats['recentTenants'],
  }
}

export async function fetchAllCatalogItems(): Promise<LayetteCatalog[]> {
  const { data, error } = await supabase
    .from('layette_catalog')
    .select('*')
    .order('sort_order')
    .order('category')
  if (error) throw error
  return data ?? []
}

export async function upsertCatalogItem(
  item: Omit<LayetteCatalogInsert, 'created_at' | 'updated_at'> & { id?: string }
): Promise<LayetteCatalog> {
  const { id, ...fields } = item
  if (id) {
    const { data, error } = await supabase
      .from('layette_catalog')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('layette_catalog')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleCatalogItem(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('layette_catalog')
    .update({ is_active: !isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
