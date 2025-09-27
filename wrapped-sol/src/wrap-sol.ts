import { getTransferSolInstruction } from '@solana-program/system';
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS,
  getCreateAssociatedTokenInstruction,
  getSyncNativeInstruction,
} from '@solana-program/token';
import { createTransactionAndSend, NATIVE_MINT } from './helper';
import { Address, KeyPairSigner } from '@solana/kit';

export async function wrapSol({
  user,
  amount,
  feePayer,
}: {
  user: Address;
  amount: bigint;
  feePayer: KeyPairSigner;
}) {
  const [ata] = await findAssociatedTokenPda({
    owner: user,
    mint: NATIVE_MINT,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const createAtaIx = getCreateAssociatedTokenInstruction({
    ata,
    mint: NATIVE_MINT,
    owner: user,
    payer: feePayer,
  });

  const transferSolIx = getTransferSolInstruction({
    source: feePayer,
    destination: ata,
    amount,
  });

  const syncIx = getSyncNativeInstruction({
    account: ata,
  });

  const instructions = [createAtaIx, transferSolIx, syncIx];

  await createTransactionAndSend(feePayer, ...instructions);
  return ata;
}
