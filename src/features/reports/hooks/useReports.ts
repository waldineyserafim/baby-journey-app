import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { fetchReportData } from '../services/reportsService'

export function useReports() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const tenantId = profile?.tenant_id
  const pregnancyId = pregnancy?.id

  const query = useQuery({
    queryKey: ['reports', tenantId, pregnancyId],
    enabled: !!tenantId && !!pregnancyId,
    queryFn: () => fetchReportData(tenantId!, pregnancyId!),
    staleTime: 5 * 60 * 1000,
  })

  return {
    data: query.data ?? null,
    pregnancy: pregnancy ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
