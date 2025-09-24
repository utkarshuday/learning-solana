import { Button } from '@/components/ui/button'

import { useTokenvestingdappInitializeMutation } from '@/features/tokenvestingdapp/data-access/use-tokenvestingdapp-initialize-mutation'

export function TokenvestingdappUiButtonInitialize() {
  const mutationInitialize = useTokenvestingdappInitializeMutation()

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Tokenvestingdapp {mutationInitialize.isPending && '...'}
    </Button>
  )
}
