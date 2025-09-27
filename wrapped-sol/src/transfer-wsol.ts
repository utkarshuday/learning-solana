import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
  getCreateAssociatedTokenInstruction,
  getTransferCheckedInstruction,
} from '@solana-program/token';
import { Address, KeyPairSigner } from '@solana/kit';
import { createTransactionAndSend, NATIVE_MINT } from './helper';

export async function transferWSol({
  sourceAta,
  destination,
  amount,
  feePayer,
}: {
  sourceAta: Address;
  destination: Address;
  amount: bigint;
  feePayer: KeyPairSigner;
}) {
  const [ata] = await findAssociatedTokenPda({
    owner: destination,
    mint: NATIVE_MINT,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const createAtaIx = getCreateAssociatedTokenInstruction({
    ata,
    mint: NATIVE_MINT,
    owner: destination,
    payer: feePayer,
  });

  const transferIx = getTransferCheckedInstruction({
    source: sourceAta,
    decimals: 9,
    mint: NATIVE_MINT,
    amount,
    authority: feePayer,
    destination: ata,
  });

  await createTransactionAndSend(feePayer, createAtaIx, transferIx);

  return ata;
}
