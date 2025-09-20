import { Button } from '@/components/ui/button'

import { useVotingInitializeMutation } from '@/features/voting/data-access/use-voting-initialize-mutation'

export function VotingUiButtonInitialize() {
  const mutationInitialize = useVotingInitializeMutation()

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Voting {mutationInitialize.isPending && '...'}
    </Button>
  )
}
