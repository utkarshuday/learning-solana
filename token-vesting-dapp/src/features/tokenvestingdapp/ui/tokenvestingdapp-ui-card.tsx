import { TokenvestingdappAccount } from '@project/anchor'
import { ellipsify } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { TokenvestingdappUiButtonClose } from './tokenvestingdapp-ui-button-close'
import { TokenvestingdappUiButtonDecrement } from './tokenvestingdapp-ui-button-decrement'
import { TokenvestingdappUiButtonIncrement } from './tokenvestingdapp-ui-button-increment'
import { TokenvestingdappUiButtonSet } from './tokenvestingdapp-ui-button-set'

export function TokenvestingdappUiCard({ tokenvestingdapp }: { tokenvestingdapp: TokenvestingdappAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokenvestingdapp: {tokenvestingdapp.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={tokenvestingdapp.address} label={ellipsify(tokenvestingdapp.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <TokenvestingdappUiButtonIncrement tokenvestingdapp={tokenvestingdapp} />
          <TokenvestingdappUiButtonSet tokenvestingdapp={tokenvestingdapp} />
          <TokenvestingdappUiButtonDecrement tokenvestingdapp={tokenvestingdapp} />
          <TokenvestingdappUiButtonClose tokenvestingdapp={tokenvestingdapp} />
        </div>
      </CardContent>
    </Card>
  )
}
