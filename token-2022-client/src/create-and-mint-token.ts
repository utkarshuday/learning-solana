import {
  fetchMint,
  fetchToken,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstructionAsync,
  getInitializeMintInstruction,
  getMintSize,
  getMintToCheckedInstruction,
} from '@solana-program/token-2022';
import {
  appendTransactionMessageInstructions,
  assertIsSendableTransaction,
  createTransactionMessage,
  generateKeyPairSigner,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit';
import { createClient } from './client';
import { getCreateAccountInstruction } from '@solana-program/system';
import { TokenProgram } from './types';

export async function createAndMintToken({
  tokenProgram,
  decimals,
  mintAmount,
}: {
  tokenProgram: TokenProgram;
  decimals: number;
  mintAmount: number;
}) {
  const { rpc, rpcSubscriptions, wallet } = await createClient();
  const mint = await generateKeyPairSigner();
  const space = BigInt(getMintSize());
  const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

  const createAccountIx = getCreateAccountInstruction({
    payer: wallet,
    newAccount: mint,
    lamports: rent,
    space,
    programAddress: tokenProgram,
  });

  const initializeMintIx = getInitializeMintInstruction(
    {
      mint: mint.address,
      decimals,
      mintAuthority: wallet.address,
    },
    {
      programAddress: tokenProgram,
    }
  );

  const instructions = [createAccountIx, initializeMintIx];

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayerSigner(wallet, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    tx => appendTransactionMessageInstructions(instructions, tx)
  );

  const signedTransaction = await signTransactionMessageWithSigners(
    transactionMessage
  );
  assertIsSendableTransaction(signedTransaction);

  await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
    signedTransaction,
    { commitment: 'confirmed' }
  );

  console.log('\nFetching mint info...\n');

  const mintInfo = await fetchMint(rpc, mint.address);
  console.log(mintInfo);

  const [associatedTokenAddress] = await findAssociatedTokenPda({
    mint: mint.address,
    owner: wallet.address,
    tokenProgram,
  });

  console.log(`Associated token account: ${associatedTokenAddress}`);

  console.log('\nCreating associated token account and minting tokens...');

  const createAtaIx = await getCreateAssociatedTokenIdempotentInstructionAsync({
    owner: wallet.address,
    payer: wallet,
    mint: mint.address,
    tokenProgram,
  });

  const mintToIx = getMintToCheckedInstruction(
    {
      mint: mint.address,
      token: associatedTokenAddress,
      mintAuthority: wallet,
      amount: mintAmount,
      decimals,
    },
    {
      programAddress: tokenProgram,
    }
  );

  const { value: latestBlockhash2 } = await rpc.getLatestBlockhash().send();

  const transactionMessage2 = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayerSigner(wallet, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash2, tx),
    tx => appendTransactionMessageInstructions([createAtaIx, mintToIx], tx)
  );

  const signedTransaction2 = await signTransactionMessageWithSigners(
    transactionMessage2
  );
  assertIsSendableTransaction(signedTransaction2);

  await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
    signedTransaction2,
    { commitment: 'confirmed' }
  );

  const tokenInfo = await fetchToken(rpc, associatedTokenAddress);
  console.log(tokenInfo);

  return mint;
}
