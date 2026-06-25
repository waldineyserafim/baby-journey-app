import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  fetchNotifications,
  fetchUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService'

export function useUnreadCount() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['notifications-unread', profile?.id],
    enabled: !!profile?.id,
    queryFn: () => fetchUnreadCount(profile!.id),
    refetchInterval: 60_000,
  })
}

export function useNotifications() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  const userId = profile?.id
  const tenantId = profile?.tenant_id

  const query = useQuery({
    queryKey: ['notifications', userId],
    enabled: !!userId,
    queryFn: () => fetchNotifications(userId!),
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['notifications', userId] })
    qc.invalidateQueries({ queryKey: ['notifications-unread', userId] })
  }

  const create = useMutation({
    mutationFn: (fields: Parameters<typeof createNotification>[2]) =>
      createNotification(tenantId!, userId!, fields),
    onSuccess: invalidate,
  })

  const read = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: invalidate,
  })

  const readAll = useMutation({
    mutationFn: () => markAllAsRead(userId!),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: invalidate,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    create,
    read,
    readAll,
    remove,
  }
}
