import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';
import { TOKEN_2022_PROGRAM_ADDRESS } from '@solana-program/token-2022';
import { Address } from '@solana/kit';

export type TokenProgram =
  | typeof TOKEN_2022_PROGRAM_ADDRESS
  | typeof TOKEN_PROGRAM_ADDRESS;

export enum TokenTypeForDisplay {
  TOKEN = 'Token Program',
  TOKEN_22 = 'Token Extensions Program',
}

export interface TokenInfoForDisplay {
  address: Address;
  mint: Address;
  amount: number;
  decimals: number;
  displayAmount: number;
  type: TokenTypeForDisplay;
}
