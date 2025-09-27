import { getTransferSolInstruction } from '@solana-program/system';
import {
  fetchToken,
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstruction,
  getSyncNativeInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from '@solana-program/token';
import {
  address,
  airdropFactory,
  appendTransactionMessageInstructions,
  assertIsSendableTransaction,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit';

const rpc = createSolanaRpc('http://localhost:8899');
const rpcSubscriptions = createSolanaRpcSubscriptions('ws://localhost:8900');

const userA = await generateKeyPairSigner();
const userB = await generateKeyPairSigner();

await airdropFactory({ rpc, rpcSubscriptions })({
  recipientAddress: userA.address,
  lamports: lamports(1_000_000_000n),
  commitment: 'confirmed',
});

const NATIVE_MINT = address('So11111111111111111111111111111111111111112');

const [ata] = await findAssociatedTokenPda({
  owner: userB.address,
  mint: NATIVE_MINT,
  tokenProgram: TOKEN_PROGRAM_ADDRESS,
});

const createAtaIx = getCreateAssociatedTokenInstruction({
  ata,
  mint: NATIVE_MINT,
  owner: userB.address,
  payer: userA,
});

const transferSolIx = getTransferSolInstruction({
  source: userA,
  destination: ata,
  amount: 1_000_000n,
});

const syncIx = getSyncNativeInstruction({
  account: ata,
});

const instructions = [createAtaIx, transferSolIx, syncIx];

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const transaction = pipe(
  createTransactionMessage({ version: 0 }),
  tx => setTransactionMessageFeePayerSigner(userA, tx),
  tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  tx => appendTransactionMessageInstructions(instructions, tx)
);

const signedTransaction = await signTransactionMessageWithSigners(transaction);
assertIsSendableTransaction(signedTransaction);

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
  signedTransaction,
  { commitment: 'confirmed' }
);

const transactionSignature = getSignatureFromTransaction(signedTransaction);

console.log('Fee Payer Address:', userA.address.toString());
console.log('WSOL Token Account Address:', ata.toString());
console.log('Successfully wrapped SOL into WSOL');
console.log('Transaction Signature:', transactionSignature);
console.log(await fetchToken(rpc, ata));
