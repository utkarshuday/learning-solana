import { TokenvestingdappAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'

import { useTokenvestingdappSetMutation } from '@/features/tokenvestingdapp/data-access/use-tokenvestingdapp-set-mutation'

export function TokenvestingdappUiButtonSet({ tokenvestingdapp }: { tokenvestingdapp: TokenvestingdappAccount }) {
  const setMutation = useTokenvestingdappSetMutation({ tokenvestingdapp })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', tokenvestingdapp.data.count.toString() ?? '0')
        if (!value || parseInt(value) === tokenvestingdapp.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}
