import { useSolana } from '@/components/solana/use-solana';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer';
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send';
import { install as installEd25519 } from '@solana/webcrypto-ed25519-polyfill';
import { generateKeyPairSigner } from 'gill';
import { getInitializeInstruction } from '@project/anchor';
import { toastTx } from '@/components/toast-tx';
import { toast } from 'sonner';

// polyfill ed25519 for browsers (to allow `generateKeyPairSigner` to work)
installEd25519();

export function useTokenvestingdappInitializeMutation() {
  const { cluster } = useSolana();
  const queryClient = useQueryClient();
  const signer = useWalletUiSigner();
  const signAndSend = useWalletTransactionSignAndSend();

  return useMutation({
    mutationFn: async () => {
      const tokenvestingdapp = await generateKeyPairSigner();
      return await signAndSend(
        getInitializeInstruction({ payer: signer, tokenvestingdapp }),
        signer
      );
    },
    onSuccess: async tx => {
      toastTx(tx);
      await queryClient.invalidateQueries({
        queryKey: ['tokenvestingdapp', 'accounts', { cluster }],
      });
    },
    onError: () => toast.error('Failed to run program'),
  });
}
