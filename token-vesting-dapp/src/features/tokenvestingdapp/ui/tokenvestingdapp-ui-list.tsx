import { TokenvestingdappUiCard } from './tokenvestingdapp-ui-card'
import { useTokenvestingdappAccountsQuery } from '@/features/tokenvestingdapp/data-access/use-tokenvestingdapp-accounts-query'

export function TokenvestingdappUiList() {
  const tokenvestingdappAccountsQuery = useTokenvestingdappAccountsQuery()

  if (tokenvestingdappAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!tokenvestingdappAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {tokenvestingdappAccountsQuery.data?.map((tokenvestingdapp) => (
        <TokenvestingdappUiCard key={tokenvestingdapp.address} tokenvestingdapp={tokenvestingdapp} />
      ))}
    </div>
  )
}
