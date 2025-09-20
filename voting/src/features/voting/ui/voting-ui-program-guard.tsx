import { ReactNode } from 'react'

import { useVotingProgram } from '@/features/voting/data-access/use-voting-program'

export function VotingUiProgramGuard({ children }: { children: ReactNode }) {
  const programAccountQuery = useVotingProgram()

  if (programAccountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!programAccountQuery.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return children
}
