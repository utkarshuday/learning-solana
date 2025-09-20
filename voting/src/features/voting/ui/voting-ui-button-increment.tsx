import { VotingAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'
import { useVotingIncrementMutation } from '../data-access/use-voting-increment-mutation'

export function VotingUiButtonIncrement({ voting }: { voting: VotingAccount }) {
  const incrementMutation = useVotingIncrementMutation({ voting })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}
