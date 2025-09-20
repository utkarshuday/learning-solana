import { VotingUiCard } from './voting-ui-card'
import { useVotingAccountsQuery } from '@/features/voting/data-access/use-voting-accounts-query'

export function VotingUiList() {
  const votingAccountsQuery = useVotingAccountsQuery()

  if (votingAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!votingAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {votingAccountsQuery.data?.map((voting) => (
        <VotingUiCard key={voting.address} voting={voting} />
      ))}
    </div>
  )
}
