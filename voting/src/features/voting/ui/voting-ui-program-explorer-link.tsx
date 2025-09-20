import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

import { useVotingProgramId } from '@/features/voting/data-access/use-voting-program-id'

export function VotingUiProgramExplorerLink() {
  const programId = useVotingProgramId()

  return <AppExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
}
