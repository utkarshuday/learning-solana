import { getCreateAccountInstruction } from '@solana-program/system';
import {
  appendTransactionMessageInstructions,
  assertIsSendableTransaction,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit';
import { createClient } from './client';
import {
  extension,
  getInitializeMetadataPointerInstruction,
  getInitializeMint2Instruction,
  getInitializeTokenMetadataInstruction,
  getMintSize,
  TOKEN_2022_PROGRAM_ADDRESS,
} from '@solana-program/token-2022';

const { wallet, rpc, rpcSubscriptions } = await createClient();
const mint = await generateKeyPairSigner();

const name = 'Oggy';
const symbol = 'OGGY';
const uri =
  'https://raw.githubusercontent.com/utkarshuday/learning-solana/main/token-vesting-dapp/anchor/tests/assets/oggy.json';
const decimals = 9;

const metadataPointer = extension('MetadataPointer', {
  metadataAddress: mint.address,
  authority: wallet.address,
});

const tokenMetadata = extension('TokenMetadata', {
  updateAuthority: wallet.address,
  mint: mint.address,
  name,
  symbol,
  uri,
  additionalMetadata: new Map(),
});

const space = BigInt(getMintSize([metadataPointer, tokenMetadata]));
const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

const createAccountIx = getCreateAccountInstruction({
  payer: wallet,
  newAccount: mint,
  space: BigInt(getMintSize([metadataPointer])),
  lamports: rent,
  programAddress: TOKEN_2022_PROGRAM_ADDRESS,
});

const metadataPointerInitIx = getInitializeMetadataPointerInstruction({
  mint: mint.address,
  authority: wallet.address,
  metadataAddress: mint.address,
});

const initMintIx = getInitializeMint2Instruction({
  mint: mint.address,
  decimals,
  mintAuthority: wallet.address,
});

const initMetadataIx = getInitializeTokenMetadataInstruction({
  mint: mint.address,
  uri,
  name,
  symbol,
  mintAuthority: wallet,
  updateAuthority: wallet.address,
  metadata: mint.address,
});

const instructions = [
  createAccountIx,
  metadataPointerInitIx,
  initMintIx,
  initMetadataIx,
];

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const transaction = pipe(
  createTransactionMessage({ version: 0 }),
  tx => setTransactionMessageFeePayerSigner(wallet, tx),
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

console.log('Mint Address: ', mint.address);
console.log('Transaction Signature: ', transactionSignature);
