import { TokenvestingdappAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'

import { useTokenvestingdappDecrementMutation } from '../data-access/use-tokenvestingdapp-decrement-mutation'

export function TokenvestingdappUiButtonDecrement({ tokenvestingdapp }: { tokenvestingdapp: TokenvestingdappAccount }) {
  const decrementMutation = useTokenvestingdappDecrementMutation({ tokenvestingdapp })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}
