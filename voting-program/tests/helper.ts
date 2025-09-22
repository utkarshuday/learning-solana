import {
  Candidate,
  fetchCandidate,
  fetchPoll,
  getInitializeCandidateInstruction,
  getInitializePollInstructionAsync,
  Poll,
  VOTING_PROGRAM_ADDRESS,
} from '../client/js/generated';
import {
  Account,
  Address,
  Blockhash,
  createSolanaClient,
  createTransaction,
  getAddressDecoder,
  getAddressEncoder,
  getProgramDerivedAddress,
  getU64Encoder,
  Instruction,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill';

export const { rpc, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: process.env.ANCHOR_PROVIDER_URL!,
});

let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined;
export async function getLatestBlockhash(): Promise<
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

export async function createTransactionWithBlockhash({
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

  return tx;
}

export async function getPollPda(pollId: bigint | number) {
  const pda = await getProgramDerivedAddress({
    programAddress: VOTING_PROGRAM_ADDRESS,
    seeds: ['poll', getU64Encoder().encode(pollId)],
  });
  return pda;
}

export async function getCandidatePda(
  pollId: bigint | number,
  id: bigint | number
) {
  const pda = await getProgramDerivedAddress({
    programAddress: VOTING_PROGRAM_ADDRESS,
    seeds: [
      'candidate',
      getU64Encoder().encode(pollId),
      getU64Encoder().encode(id),
    ],
  });
  return pda;
}

export async function getVotePda(pollId: bigint | number, voter: Address) {
  const pda = await getProgramDerivedAddress({
    programAddress: VOTING_PROGRAM_ADDRESS,
    seeds: [
      'vote',
      getU64Encoder().encode(pollId),
      getAddressEncoder().encode(voter),
    ],
  });
  return pda;
}

class IdAddressPair {
  id: bigint | number;
  address: Address;

  constructor(id: bigint | number, address: Address) {
    this.id = id;
    this.address = address;
  }
}

export type VoteEnvironment = {
  biden: IdAddressPair;
  trump: IdAddressPair;
  poll: IdAddressPair;
};

export async function createVoteEnvironment(
  payer: KeyPairSigner
): Promise<VoteEnvironment> {
  const pollId = 3;
  const pollDescription = "Biden or Trump: President's Election";
  const pollStartTime = Date.now();
  const pollEndTime = pollStartTime + 2 * 24 * 60 * 60 * 1000;
  const [pollPda] = await getPollPda(pollId);

  const ix1 = await getInitializePollInstructionAsync({
    poll: pollPda,
    signer: payer,
    id: pollId,
    description: pollDescription,
    startTime: pollStartTime,
    endTime: pollEndTime,
  });

  const bidenId = 1;
  let name = 'Biden';
  const [bidenPda] = await getCandidatePda(pollId, bidenId);

  const ix2 = getInitializeCandidateInstruction({
    id: bidenId,
    signer: payer,
    poll: pollPda,
    candidate: bidenPda,
    name,
  });

  const trumpId = 2;
  name = 'Trump';
  const [trumpPda] = await getCandidatePda(pollId, trumpId);

  const ix3 = getInitializeCandidateInstruction({
    id: trumpId,
    signer: payer,
    poll: pollPda,
    candidate: trumpPda,
    name,
  });

  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix1, ix2, ix3],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  });

  const signedTransaction = await signTransactionMessageWithSigners(tx);
  await sendAndConfirmTransaction(signedTransaction);

  return {
    poll: new IdAddressPair(pollId, pollPda),
    biden: new IdAddressPair(bidenId, bidenPda),
    trump: new IdAddressPair(trumpId, trumpPda),
  };
}
