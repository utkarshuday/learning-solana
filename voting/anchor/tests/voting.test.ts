import {
  Candidate,
  fetchCandidate,
  fetchPoll,
  fetchVote,
  getCastVoteInstruction,
  getInitializeCandidateInstruction,
  getInitializePollInstructionAsync,
  getVotingProgramId,
  isVotingError,
  Poll,
  VOTING_ERROR__INVALID_CANDIDATE_NAME_LENGTH,
  VOTING_ERROR__INVALID_DESCRIPTION_LENGTH,
  VOTING_ERROR__INVALID_POLL_TIMESTAMP,
} from '@project/anchor';
import {
  Account,
  isProgramError,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill';

import { loadKeypairSignerFromFile } from 'gill/node';
import {
  createTransactionWithBlockhash,
  createVoteEnvironment,
  getCandidatePda,
  getPollPda,
  getVotePda,
  rpc,
  sendAndConfirmTransaction,
  VoteEnvironment,
} from './helper';
import { SYSTEM_ERROR__ACCOUNT_ALREADY_IN_USE } from 'gill/programs';

describe('voting', () => {
  let payer: KeyPairSigner;
  beforeAll(async () => {
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!);
  });

  describe('Initialize Poll', () => {
    it('successfully initializes poll with valid inputs', async () => {
      // ARRANGE
      expect.assertions(6);

      const pollId = 1;
      const pollDescription = 'Crunched or Smooth Peanut Butter';
      const pollStartTime = Date.now();
      const pollEndTime = pollStartTime + 2 * 24 * 60 * 60 * 1000;
      const [pollAddress, bump] = await getPollPda(pollId);

      const ix = await getInitializePollInstructionAsync({
        poll: pollAddress,
        signer: payer,
        id: pollId,
        description: pollDescription,
        startTime: pollStartTime,
        endTime: pollEndTime,
      });

      // ACT
      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);
      await sendAndConfirmTransaction(signedTransaction);

      // ASSERT
      const poll = await fetchPoll(rpc, pollAddress);
      expect(poll.data.id).toEqual(BigInt(pollId));
      expect(poll.data.description).toEqual(pollDescription);
      expect(poll.data.startTime).toEqual(BigInt(pollStartTime));
      expect(poll.data.endTime).toEqual(BigInt(pollEndTime));
      expect(poll.data.totalCandidates).toEqual(BigInt(0));
      expect(poll.data.bump).toEqual(bump);
    });

    it('fails when poll description is longer than expected length', async () => {
      // ARRANGE
      expect.assertions(1);
      const pollId = 2;
      const pollDescription =
        'Very very very very very very very very long description for poll';
      const pollStartTime = Date.now();
      const pollEndTime = pollStartTime + 2 * 24 * 60 * 60 * 1000;

      const ix = await getInitializePollInstructionAsync({
        signer: payer,
        id: pollId,
        description: pollDescription,
        startTime: pollStartTime,
        endTime: pollEndTime,
      });
      // ACT
      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);

      // ASSERT
      await expect(
        sendAndConfirmTransaction(signedTransaction)
      ).rejects.toSatisfy(err => {
        if (!isSolanaError(err)) return false;
        if (
          !isVotingError(
            err.cause,
            tx,
            VOTING_ERROR__INVALID_DESCRIPTION_LENGTH
          )
        )
          return false;
        return true;
      });
    });

    it('fails when poll start time is greater than poll end time', async () => {
      // ARRANGE
      expect.assertions(1);
      const pollId = 2;
      const pollDescription = 'Crunched or Smooth Peanut Butter';
      const pollEndTime = Date.now();
      const pollStartTime = pollEndTime + 2 * 24 * 60 * 60 * 1000;

      const ix = await getInitializePollInstructionAsync({
        signer: payer,
        id: pollId,
        description: pollDescription,
        startTime: pollStartTime,
        endTime: pollEndTime,
      });
      // ACT
      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);

      // ASSERT
      await expect(
        sendAndConfirmTransaction(signedTransaction)
      ).rejects.toSatisfy(err => {
        if (!isSolanaError(err)) return false;
        if (!isVotingError(err.cause, tx, VOTING_ERROR__INVALID_POLL_TIMESTAMP))
          return false;
        return true;
      });
    });
  });

  describe('Initialize Candidate', () => {
    let poll: Account<Poll>;

    beforeAll(async () => {
      const pollId = 2;
      const pollDescription = 'Biden or Trump';
      const pollStartTime = Date.now();
      const pollEndTime = pollStartTime + 2 * 24 * 60 * 60 * 1000;
      const [pollPda] = await getPollPda(pollId);

      const ix = await getInitializePollInstructionAsync({
        poll: pollPda,
        signer: payer,
        id: pollId,
        description: pollDescription,
        startTime: pollStartTime,
        endTime: pollEndTime,
      });

      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);
      await sendAndConfirmTransaction(signedTransaction);
      poll = await fetchPoll(rpc, pollPda);
    });

    it('successfully initialize candidate with valid inputs', async () => {
      // ARRANGE
      expect.assertions(5);
      const id = 1;
      const name = 'Biden';
      const [candidateAddress, bump] = await getCandidatePda(poll.data.id, id);
      const ix = getInitializeCandidateInstruction({
        id,
        signer: payer,
        poll: poll.address,
        candidate: candidateAddress,
        name,
      });

      // ACT
      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);
      await sendAndConfirmTransaction(signedTransaction);
      const candidate = await fetchCandidate(rpc, candidateAddress);
      poll = await fetchPoll(rpc, poll.address);

      // ASSERT
      expect(candidate.data.id).toEqual(BigInt(1));
      expect(candidate.data.name).toEqual(name);
      expect(candidate.data.votes).toEqual(BigInt(0));
      expect(candidate.data.bump).toEqual(bump);
      expect(poll.data.totalCandidates).toEqual(BigInt(1));
    });

    it('fails when candidate name is longer than expected length', async () => {
      // ARRANGE
      const name =
        'Very very very very very very very very very very very long name';
      const id = 2;
      const [candidateAddress] = await getCandidatePda(poll.data.id, id);

      const ix = getInitializeCandidateInstruction({
        id,
        signer: payer,
        poll: poll.address,
        candidate: candidateAddress,
        name,
      });

      // ACT
      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);

      // ASSERT
      await expect(
        sendAndConfirmTransaction(signedTransaction)
      ).rejects.toSatisfy(err => {
        if (!isSolanaError(err)) return false;
        if (
          !isVotingError(
            err.cause,
            tx,
            VOTING_ERROR__INVALID_CANDIDATE_NAME_LENGTH
          )
        )
          return false;
        return true;
      });
    });
  });

  describe('Cast Vote', () => {
    let voteEnv: VoteEnvironment;

    beforeAll(async () => {
      voteEnv = await createVoteEnvironment(payer);
    });

    it('succesfully casts a vote for a candidate for a poll', async () => {
      // ARRANGE
      expect.assertions(4);
      const [votePda, bump] = await getVotePda(voteEnv.poll.id, payer.address);
      const ix = getCastVoteInstruction({
        signer: payer,
        candidate: voteEnv.biden.address,
        poll: voteEnv.poll.address,
        vote: votePda,
      });

      // ACT
      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);
      await sendAndConfirmTransaction(signedTransaction);

      const vote = await fetchVote(rpc, votePda);
      const candidate = await fetchCandidate(rpc, voteEnv.biden.address);

      // ASSERT
      expect(vote.data.candidateId).toEqual(BigInt(voteEnv.biden.id));
      expect(vote.data.pollId).toEqual(BigInt(voteEnv.poll.id));
      expect(vote.data.bump).toEqual(bump);
      expect(candidate.data.votes).toEqual(1n);
    });

    it('fails to cast vote again by same voter', async () => {
      // ARRANGE
      expect.assertions(1);
      const [votePda] = await getVotePda(voteEnv.poll.id, payer.address);
      const ix = getCastVoteInstruction({
        signer: payer,
        candidate: voteEnv.trump.address,
        poll: voteEnv.poll.address,
        vote: votePda,
      });

      // ACT
      const tx = await createTransactionWithBlockhash({ ix, payer });
      const signedTransaction = await signTransactionMessageWithSigners(tx);

      // ASSERT
      await expect(
        sendAndConfirmTransaction(signedTransaction)
      ).rejects.toSatisfy(err => {
        if (!isSolanaError(err)) return false;
        if (
          !isProgramError(
            err.cause,
            tx,
            getVotingProgramId('solana:localnet'),
            SYSTEM_ERROR__ACCOUNT_ALREADY_IN_USE
          )
        )
          return false;
        return true;
      });
    });
  });
});

// Helper function to keep the tests DRY
