import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill';
import {
  fetchTokenvestingdapp,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '@project/anchor';
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node';

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: process.env.ANCHOR_PROVIDER_URL!,
});

describe('tokenvestingdapp', () => {
  let payer: KeyPairSigner;
  let tokenvestingdapp: KeyPairSigner;

  beforeAll(async () => {
    tokenvestingdapp = await generateKeyPairSigner();
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!);
  });

  it('Initialize Tokenvestingdapp', async () => {
    // ARRANGE
    expect.assertions(1);
    const ix = getInitializeInstruction({
      payer: payer,
      tokenvestingdapp: tokenvestingdapp,
    });

    // ACT
    await sendAndConfirm({ ix, payer });

    // ASSER
    const currentTokenvestingdapp = await fetchTokenvestingdapp(
      rpc,
      tokenvestingdapp.address
    );
    expect(currentTokenvestingdapp.data.count).toEqual(0);
  });

  it('Increment Tokenvestingdapp', async () => {
    // ARRANGE
    expect.assertions(1);
    const ix = getIncrementInstruction({
      tokenvestingdapp: tokenvestingdapp.address,
    });

    // ACT
    await sendAndConfirm({ ix, payer });

    // ASSERT
    const currentCount = await fetchTokenvestingdapp(
      rpc,
      tokenvestingdapp.address
    );
    expect(currentCount.data.count).toEqual(1);
  });

  it('Increment Tokenvestingdapp Again', async () => {
    // ARRANGE
    expect.assertions(1);
    const ix = getIncrementInstruction({
      tokenvestingdapp: tokenvestingdapp.address,
    });

    // ACT
    await sendAndConfirm({ ix, payer });

    // ASSERT
    const currentCount = await fetchTokenvestingdapp(
      rpc,
      tokenvestingdapp.address
    );
    expect(currentCount.data.count).toEqual(2);
  });

  it('Decrement Tokenvestingdapp', async () => {
    // ARRANGE
    expect.assertions(1);
    const ix = getDecrementInstruction({
      tokenvestingdapp: tokenvestingdapp.address,
    });

    // ACT
    await sendAndConfirm({ ix, payer });

    // ASSERT
    const currentCount = await fetchTokenvestingdapp(
      rpc,
      tokenvestingdapp.address
    );
    expect(currentCount.data.count).toEqual(1);
  });

  it('Set tokenvestingdapp value', async () => {
    // ARRANGE
    expect.assertions(1);
    const ix = getSetInstruction({
      tokenvestingdapp: tokenvestingdapp.address,
      value: 42,
    });

    // ACT
    await sendAndConfirm({ ix, payer });

    // ASSERT
    const currentCount = await fetchTokenvestingdapp(
      rpc,
      tokenvestingdapp.address
    );
    expect(currentCount.data.count).toEqual(42);
  });

  it('Set close the tokenvestingdapp account', async () => {
    // ARRANGE
    expect.assertions(1);
    const ix = getCloseInstruction({
      payer: payer,
      tokenvestingdapp: tokenvestingdapp.address,
    });

    // ACT
    await sendAndConfirm({ ix, payer });

    // ASSERT
    try {
      await fetchTokenvestingdapp(rpc, tokenvestingdapp.address);
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`);
      }
      expect(e.message).toEqual(
        `Account not found at address: ${tokenvestingdapp.address}`
      );
    }
  });
});

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined;
async function getLatestBlockhash(): Promise<
  Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>
> {
  if (latestBlockhash) {
    return latestBlockhash;
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value);
}
async function sendAndConfirm({
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
