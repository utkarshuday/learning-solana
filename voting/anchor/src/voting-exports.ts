// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, address, getBase58Decoder, SolanaClient } from 'gill';
import { SolanaClusterId } from '@wallet-ui/react';
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded';
import {
  Poll,
  POLL_DISCRIMINATOR,
  VOTING_PROGRAM_ADDRESS,
  getPollDecoder,
} from './client/js';
import VotingIDL from '../target/idl/voting.json';

export type PollAccount = Account<Poll, string>;

// Re-export the generated IDL and type
export { VotingIDL };

// This is a helper function to get the program ID for the Voting program depending on the cluster.
export function getVotingProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      // This is the program ID for the Voting program on devnet and testnet.
      return address('Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe');
    case 'solana:mainnet':
    default:
      return VOTING_PROGRAM_ADDRESS;
  }
}

export * from './client/js';

export function getPollProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getPollDecoder(),
    filter: getBase58Decoder().decode(POLL_DISCRIMINATOR),
    programAddress: VOTING_PROGRAM_ADDRESS,
  });
}
