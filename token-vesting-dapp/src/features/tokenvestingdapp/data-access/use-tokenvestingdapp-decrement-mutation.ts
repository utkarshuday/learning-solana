import {
  TokenvestingdappAccount,
  getDecrementInstruction,
} from '@project/anchor';
import { useMutation } from '@tanstack/react-query';
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer';
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send';
import { toastTx } from '@/components/toast-tx';
import { useTokenvestingdappAccountsInvalidate } from './use-tokenvestingdapp-accounts-invalidate';

export function useTokenvestingdappDecrementMutation({
  tokenvestingdapp,
}: {
  tokenvestingdapp: TokenvestingdappAccount;
}) {
  const invalidateAccounts = useTokenvestingdappAccountsInvalidate();
  const signer = useWalletUiSigner();
  const signAndSend = useWalletTransactionSignAndSend();

  return useMutation({
    mutationFn: async () =>
      await signAndSend(
        getDecrementInstruction({ tokenvestingdapp: tokenvestingdapp.address }),
        signer
      ),
    onSuccess: async tx => {
      toastTx(tx);
      await invalidateAccounts();
    },
  });
}
