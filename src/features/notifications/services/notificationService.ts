import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type Notification = Database['public']['Tables']['notifications']['Row']

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  custom:      'Lembrete',
  appointment: 'Consulta',
  exam:        'Exame',
  vaccine:     'Vacina',
  medication:  'Medicamento',
  contraction: 'Contrações',
  kick:        'Chutes',
}

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  custom:      '#7c3aed',
  appointment: '#0ea5e9',
  exam:        '#f59e0b',
  vaccine:     '#22c55e',
  medication:  '#ec4899',
  contraction: '#ef4444',
  kick:        '#8b5cf6',
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  return count ?? 0
}

export async function createNotification(
  tenantId: string,
  userId: string,
  fields: {
    title: string
    message: string
    scheduled_for: string
    type?: string
  }
): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      type: fields.type ?? 'custom',
      title: fields.title,
      message: fields.message,
      scheduled_for: fields.scheduled_for,
      is_read: false,
      is_sent: false,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw error
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) throw error
}
