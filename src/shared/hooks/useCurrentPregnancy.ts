import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'
import { useAuth } from './useAuth'

export type Pregnancy = Database['public']['Tables']['pregnancies']['Row']

export function useCurrentPregnancy() {
  const { profile } = useAuth()

  const query = useQuery<Pregnancy | null>({
    queryKey: ['current-pregnancy', profile?.tenant_id],
    enabled: !!profile?.tenant_id,
    queryFn: async () => {
      const { data } = await supabase
        .from('pregnancies')
        .select('*')
        .eq('tenant_id', profile!.tenant_id!)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data as Pregnancy | null
    },
  })

  return query
}
