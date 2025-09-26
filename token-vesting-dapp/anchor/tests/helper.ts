import {
  createSolanaClient,
  Blockhash,
  Instruction,
  KeyPairSigner,
  createTransaction,
  signTransactionMessageWithSigners,
} from 'gill';

// Helper function to keep the tests DRY
export const { rpc, rpcSubscriptions, sendAndConfirmTransaction } =
  createSolanaClient({
    urlOrMoniker: process.env.ANCHOR_PROVIDER_URL!,
  });

export async function getLatestBlockhash(): Promise<
  Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>
> {
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value);
}

export async function sendAndConfirm({
  ix,
  payer,
}: {
  ix: Instruction;
  payer: KeyPairSigner;
}) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  });
  const signedTransaction = await signTransactionMessageWithSigners(tx);
  return await sendAndConfirmTransaction(signedTransaction);
}
