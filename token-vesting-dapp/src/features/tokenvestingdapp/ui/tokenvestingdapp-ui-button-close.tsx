import { TokenvestingdappAccount } from '@project/anchor'
import { Button } from '@/components/ui/button'

import { useTokenvestingdappCloseMutation } from '@/features/tokenvestingdapp/data-access/use-tokenvestingdapp-close-mutation'

export function TokenvestingdappUiButtonClose({ tokenvestingdapp }: { tokenvestingdapp: TokenvestingdappAccount }) {
  const closeMutation = useTokenvestingdappCloseMutation({ tokenvestingdapp })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
