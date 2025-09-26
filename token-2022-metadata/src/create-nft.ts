import { getCreateAccountInstruction } from '@solana-program/system';
import {
  AuthorityType,
  extension,
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstruction,
  getInitializeMetadataPointerInstruction,
  getInitializeMint2Instruction,
  getInitializeTokenMetadataInstruction,
  getMintSize,
  getMintToCheckedInstruction,
  getSetAuthorityInstruction,
  getUpdateTokenMetadataFieldInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
  tokenMetadataField,
} from '@solana-program/token-2022';
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

export async function createNft({
  name,
  symbol,
  uri,
  additionalAttributes,
}: {
  name: string;
  symbol: string;
  uri: string;
  additionalAttributes: [string, string][];
}) {
  // NFT conditions
  const decimals = 0;
  const amount = 1n;

  const mint = await generateKeyPairSigner();

  const { rpc, wallet, rpcSubscriptions } = await createClient();
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
    additionalMetadata: new Map(additionalAttributes),
  });

  const space = BigInt(getMintSize([metadataPointer, tokenMetadata]));
  const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

  //  Allocate the mint
  const createAccountIx = getCreateAccountInstruction({
    payer: wallet,
    newAccount: mint,
    space: BigInt(getMintSize([metadataPointer])),
    lamports: rent,
    programAddress: TOKEN_2022_PROGRAM_ADDRESS,
  });

  // Initialize the metadata-pointer making sure that it points to the mint itself
  const metadataPointerInitIx = getInitializeMetadataPointerInstruction({
    mint: mint.address,
    authority: wallet.address,
    metadataAddress: mint.address,
  });

  // Initialize the mint
  const initMintIx = getInitializeMint2Instruction({
    mint: mint.address,
    decimals,
    mintAuthority: wallet.address,
  });

  // Initialize the metadata inside the mint
  const initMetadataIx = getInitializeTokenMetadataInstruction({
    mint: mint.address,
    uri,
    name,
    symbol,
    mintAuthority: wallet,
    updateAuthority: wallet.address,
    metadata: mint.address,
  });

  // Set the additional metadata in the mint
  const updateIx = additionalAttributes.map(([field, value]) =>
    getUpdateTokenMetadataFieldInstruction({
      metadata: mint.address,
      updateAuthority: wallet,
      field: tokenMetadataField('Key', [field]),
      value,
    })
  );

  // Create the associated token account
  const [ata] = await findAssociatedTokenPda({
    mint: mint.address,
    owner: wallet.address,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });
  const createAtaIx = getCreateAssociatedTokenInstruction({
    payer: wallet,
    ata,
    owner: wallet.address,
    mint: mint.address,
  });

  const mintToIx = getMintToCheckedInstruction({
    token: ata,
    mint: mint.address,
    mintAuthority: wallet,
    amount,
    decimals,
  });

  const setAuthorityIx = getSetAuthorityInstruction({
    owned: mint.address,
    owner: wallet,
    authorityType: AuthorityType.MintTokens,
    newAuthority: null,
  });

  const instructions = [
    createAccountIx,
    metadataPointerInitIx,
    initMintIx,
    initMetadataIx,
    ...updateIx,
    createAtaIx,
    mintToIx,
    setAuthorityIx,
  ];

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transaction = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayerSigner(wallet, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    tx => appendTransactionMessageInstructions(instructions, tx)
  );

  const signedTransaction =
    await signTransactionMessageWithSigners(transaction);
  assertIsSendableTransaction(signedTransaction);

  await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
    signedTransaction,
    { commitment: 'confirmed' }
  );

  const transactionSignature = getSignatureFromTransaction(signedTransaction);
  return { nft: ata, mint: mint.address, transactionSignature };
}
