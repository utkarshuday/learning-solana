import { TokenvestingdappAccount, getCloseInstruction } from '@project/anchor';
import { useMutation } from '@tanstack/react-query';
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send';
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer';
import { toastTx } from '@/components/toast-tx';
import { useTokenvestingdappAccountsInvalidate } from './use-tokenvestingdapp-accounts-invalidate';

export function useTokenvestingdappCloseMutation({
  tokenvestingdapp,
}: {
  tokenvestingdapp: TokenvestingdappAccount;
}) {
  const invalidateAccounts = useTokenvestingdappAccountsInvalidate();
  const signAndSend = useWalletTransactionSignAndSend();
  const signer = useWalletUiSigner();

  return useMutation({
    mutationFn: async () => {
      return await signAndSend(
        getCloseInstruction({
          payer: signer,
          tokenvestingdapp: tokenvestingdapp.address,
        }),
        signer
      );
    },
    onSuccess: async tx => {
      toastTx(tx);
      await invalidateAccounts();
    },
  });
}
