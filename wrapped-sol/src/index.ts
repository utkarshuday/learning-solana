import { fetchToken } from '@solana-program/token';
import { airdropFactory, generateKeyPairSigner, lamports } from '@solana/kit';
import { createClient } from './helper';
import { transferWSol } from './transfer-wsol';
import { unwrapSol } from './unwrap-sol';
import { wrapSol } from './wrap-sol';

const userA = await generateKeyPairSigner();
const userB = await generateKeyPairSigner();

const client = createClient();
await airdropFactory(client)({
  recipientAddress: userA.address,
  lamports: lamports(1_500_000_000n),
  commitment: 'confirmed',
});

// Wrap SOL to wSOL
const ataUserA = await wrapSol({
  user: userA.address,
  amount: 1_000_000_000n,
  feePayer: userA,
});

// Transfer wSOL from one wallet to another
// lamports as well as amount gets reduced
// no need to sync here since token to token transfer
const ataUserB = await transferWSol({
  sourceAta: ataUserA,
  amount: 1_000_000n,
  destination: userB.address,
  feePayer: userA,
});

console.log(await fetchToken(client.rpc, ataUserA));
console.log(await fetchToken(client.rpc, ataUserB));

// Unwrap wSOL and receive at destination as SOL
await unwrapSol({
  account: ataUserB,
  owner: userB,
  destination: userB.address,
  feePayer: userA,
});

console.log(await client.rpc.getAccountInfo(userB.address).send());
