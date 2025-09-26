import { getCreateVestingInstructionAsync } from '@project/anchor';
import {
  Address,
  generateKeyPairSigner,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill';

import { loadKeypairSignerFromFile } from 'gill/node';
import {
  buildCreateTokenTransaction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from 'gill/programs';
import { getLatestBlockhash, sendAndConfirmTransaction } from './helper';

describe('Token Vesting Program', () => {
  let employer: KeyPairSigner;
  let mint: Address;

  beforeAll(async () => {
    employer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!);
    const mintKeyPair = await generateKeyPairSigner();

    const latestBlockhash = await getLatestBlockhash();
    const mintTokenIx = await buildCreateTokenTransaction({
      feePayer: employer,
      mint: mintKeyPair,
      metadata: {
        isMutable: true,
        name: 'OGGY',
        symbol: 'OGGY',
        uri: 'https://raw.githubusercontent.com/utkarshuday/learning-solana/main/token-vesting-dapp/anchor/tests/assets/oggy.json',
      },
      decimals: 9,
      latestBlockhash,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    });
    const signedTransaction =
      await signTransactionMessageWithSigners(mintTokenIx);
    await sendAndConfirmTransaction(signedTransaction);
    mint = mintKeyPair.address;
  });

  describe('Create vesting account by employer', () => {
    it('successfully creates a vesting account with valid inputs', async () => {
      // ARRANGE
      const ix = getCreateVestingInstructionAsync({
        signer: employer,
        companyId: 1,
        companyName: 'Turbin3',
        mint,
      });
    });
  });

  // it('Initialize Tokenvestingdapp', async () => {
  //   // ARRANGE
  //   expect.assertions(1);
  //   const ix = getInitializeInstruction({
  //     payer: payer,
  //     tokenvestingdapp: tokenvestingdapp,
  //   });

  //   // ACT
  //   await sendAndConfirm({ ix, payer });

  //   // ASSER
  //   const currentTokenvestingdapp = await fetchTokenvestingdapp(
  //     rpc,
  //     tokenvestingdapp.address
  //   );
  //   expect(currentTokenvestingdapp.data.count).toEqual(0);
  // });

  //   it('Increment Tokenvestingdapp', async () => {
  //     // ARRANGE
  //     expect.assertions(1);
  //     const ix = getIncrementInstruction({
  //       tokenvestingdapp: tokenvestingdapp.address,
  //     });

  //     // ACT
  //     await sendAndConfirm({ ix, payer });

  //     // ASSERT
  //     const currentCount = await fetchTokenvestingdapp(
  //       rpc,
  //       tokenvestingdapp.address
  //     );
  //     expect(currentCount.data.count).toEqual(1);
  //   });

  //   it('Increment Tokenvestingdapp Again', async () => {
  //     // ARRANGE
  //     expect.assertions(1);
  //     const ix = getIncrementInstruction({
  //       tokenvestingdapp: tokenvestingdapp.address,
  //     });

  //     // ACT
  //     await sendAndConfirm({ ix, payer });

  //     // ASSERT
  //     const currentCount = await fetchTokenvestingdapp(
  //       rpc,
  //       tokenvestingdapp.address
  //     );
  //     expect(currentCount.data.count).toEqual(2);
  //   });

  //   it('Decrement Tokenvestingdapp', async () => {
  //     // ARRANGE
  //     expect.assertions(1);
  //     const ix = getDecrementInstruction({
  //       tokenvestingdapp: tokenvestingdapp.address,
  //     });

  //     // ACT
  //     await sendAndConfirm({ ix, payer });

  //     // ASSERT
  //     const currentCount = await fetchTokenvestingdapp(
  //       rpc,
  //       tokenvestingdapp.address
  //     );
  //     expect(currentCount.data.count).toEqual(1);
  //   });

  //   it('Set tokenvestingdapp value', async () => {
  //     // ARRANGE
  //     expect.assertions(1);
  //     const ix = getSetInstruction({
  //       tokenvestingdapp: tokenvestingdapp.address,
  //       value: 42,
  //     });

  //     // ACT
  //     await sendAndConfirm({ ix, payer });

  //     // ASSERT
  //     const currentCount = await fetchTokenvestingdapp(
  //       rpc,
  //       tokenvestingdapp.address
  //     );
  //     expect(currentCount.data.count).toEqual(42);
  //   });

  //   it('Set close the tokenvestingdapp account', async () => {
  //     // ARRANGE
  //     expect.assertions(1);
  //     const ix = getCloseInstruction({
  //       payer: payer,
  //       tokenvestingdapp: tokenvestingdapp.address,
  //     });

  //     // ACT
  //     await sendAndConfirm({ ix, payer });

  //     // ASSERT
  //     try {
  //       await fetchTokenvestingdapp(rpc, tokenvestingdapp.address);
  //     } catch (e) {
  //       if (!isSolanaError(e)) {
  //         throw new Error(`Unexpected error: ${e}`);
  //       }
  //       expect(e.message).toEqual(
  //         `Account not found at address: ${tokenvestingdapp.address}`
  //       );
  //     }
  //   });
});
