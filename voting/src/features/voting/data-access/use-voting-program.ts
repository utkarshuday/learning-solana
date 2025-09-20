import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { useClusterVersion } from '@/features/cluster/data-access/use-cluster-version'
import { useVotingProgramId } from './use-voting-program-id'

export function useVotingProgram() {
  const { client, cluster } = useSolana()
  const programId = useVotingProgramId()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(programId).send(),
  })
}
