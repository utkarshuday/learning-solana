import { VotingAccount } from '@project/anchor'
import { ellipsify } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { VotingUiButtonClose } from './voting-ui-button-close'
import { VotingUiButtonDecrement } from './voting-ui-button-decrement'
import { VotingUiButtonIncrement } from './voting-ui-button-increment'
import { VotingUiButtonSet } from './voting-ui-button-set'

export function VotingUiCard({ voting }: { voting: VotingAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voting: {voting.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={voting.address} label={ellipsify(voting.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <VotingUiButtonIncrement voting={voting} />
          <VotingUiButtonSet voting={voting} />
          <VotingUiButtonDecrement voting={voting} />
          <VotingUiButtonClose voting={voting} />
        </div>
      </CardContent>
    </Card>
  )
}
