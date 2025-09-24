// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill';
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded';
import {
  Tokenvestingdapp,
  TOKENVESTINGDAPP_DISCRIMINATOR,
  VESTING_PROGRAM_ADDRESS,
  getTokenvestingdappDecoder,
} from './client/js';
import TokenvestingdappIDL from '../target/idl/vesting.json';

export type TokenvestingdappAccount = Account<Tokenvestingdapp, string>;

// Re-export the generated IDL and type
export { TokenvestingdappIDL };

export * from './client/js';

export function getTokenvestingdappProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getTokenvestingdappDecoder(),
    filter: getBase58Decoder().decode(TOKENVESTINGDAPP_DISCRIMINATOR),
    programAddress: VESTING_PROGRAM_ADDRESS,
  });
}
