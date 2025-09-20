import { useSolana } from '@/components/solana/use-solana'
import { useMemo } from 'react'
import { getVotingProgramId } from '@project/anchor'

export function useVotingProgramId() {
  const { cluster } = useSolana()
  return useMemo(() => getVotingProgramId(cluster.id), [cluster])
}
