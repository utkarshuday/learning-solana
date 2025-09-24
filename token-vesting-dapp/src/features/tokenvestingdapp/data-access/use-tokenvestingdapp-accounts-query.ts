import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { getTokenvestingdappProgramAccounts } from '@project/anchor'
import { useTokenvestingdappAccountsQueryKey } from './use-tokenvestingdapp-accounts-query-key'

export function useTokenvestingdappAccountsQuery() {
  const { client } = useSolana()

  return useQuery({
    queryKey: useTokenvestingdappAccountsQueryKey(),
    queryFn: async () => await getTokenvestingdappProgramAccounts(client.rpc),
  })
}
