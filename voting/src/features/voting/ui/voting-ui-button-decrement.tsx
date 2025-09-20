import { VotingAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'

import { useVotingDecrementMutation } from '../data-access/use-voting-decrement-mutation'

export function VotingUiButtonDecrement({ voting }: { voting: VotingAccount }) {
  const decrementMutation = useVotingDecrementMutation({ voting })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}
