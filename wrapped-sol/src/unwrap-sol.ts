import { getCloseAccountInstruction } from '@solana-program/token';
import { Address, KeyPairSigner } from '@solana/kit';
import { createTransactionAndSend } from './helper';

export async function unwrapSol({
  account,
  owner,
  destination,
  feePayer,
}: {
  account: Address;
  destination: Address;
  owner: KeyPairSigner;
  feePayer: KeyPairSigner;
}) {
  const closeAccountIx = getCloseAccountInstruction({
    account,
    destination,
    owner,
  });

  await createTransactionAndSend(feePayer, closeAccountIx);
}
