import { TokenvestingdappAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'
import { useTokenvestingdappIncrementMutation } from '../data-access/use-tokenvestingdapp-increment-mutation'

export function TokenvestingdappUiButtonIncrement({ tokenvestingdapp }: { tokenvestingdapp: TokenvestingdappAccount }) {
  const incrementMutation = useTokenvestingdappIncrementMutation({ tokenvestingdapp })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}
