import { useQueryClient } from '@tanstack/react-query'
import { useTokenvestingdappAccountsQueryKey } from './use-tokenvestingdapp-accounts-query-key'

export function useTokenvestingdappAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useTokenvestingdappAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}
