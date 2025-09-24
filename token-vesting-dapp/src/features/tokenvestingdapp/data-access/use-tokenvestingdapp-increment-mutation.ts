import {
  TokenvestingdappAccount,
  getIncrementInstruction,
} from '@project/anchor';
import { useMutation } from '@tanstack/react-query';
import { toastTx } from '@/components/toast-tx';
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer';
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send';
import { useTokenvestingdappAccountsInvalidate } from './use-tokenvestingdapp-accounts-invalidate';

export function useTokenvestingdappIncrementMutation({
  tokenvestingdapp,
}: {
  tokenvestingdapp: TokenvestingdappAccount;
}) {
  const invalidateAccounts = useTokenvestingdappAccountsInvalidate();
  const signAndSend = useWalletTransactionSignAndSend();
  const signer = useWalletUiSigner();

  return useMutation({
    mutationFn: async () =>
      await signAndSend(
        getIncrementInstruction({ tokenvestingdapp: tokenvestingdapp.address }),
        signer
      ),
    onSuccess: async tx => {
      toastTx(tx);
      await invalidateAccounts();
    },
  });
}
