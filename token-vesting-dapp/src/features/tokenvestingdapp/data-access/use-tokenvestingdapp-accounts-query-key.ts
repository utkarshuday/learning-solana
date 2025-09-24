import { useSolana } from '@/components/solana/use-solana'

export function useTokenvestingdappAccountsQueryKey() {
  const { cluster } = useSolana()

  return ['tokenvestingdapp', 'accounts', { cluster }]
}
