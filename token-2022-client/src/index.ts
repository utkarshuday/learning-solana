import { createAndMintToken } from './create-and-mint-token';
import { fetchTokenInfoByOwner } from './fetch-token-info';
import {
  fetchMint,
  TOKEN_2022_PROGRAM_ADDRESS,
} from '@solana-program/token-2022';
import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';
import { TokenInfoForDisplay } from './types';
import { createClient } from './client';

const { rpc, wallet } = await createClient();

const tokenMint = await createAndMintToken({
  tokenProgram: TOKEN_PROGRAM_ADDRESS,
  decimals: 9,
  mintAmount: 100_000,
});

const token2022Mint = await createAndMintToken({
  tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  decimals: 2,
  mintAmount: 1_000,
});

const myTokens: TokenInfoForDisplay[] = [];

// Get all the info of tokens of an owner
console.log('\n\nMy tokens...\n\n');
myTokens.push(
  ...(await fetchTokenInfoByOwner({
    owner: wallet.address,
    programAddress: TOKEN_PROGRAM_ADDRESS,
  })),
  ...(await fetchTokenInfoByOwner({
    owner: wallet.address,
    programAddress: TOKEN_2022_PROGRAM_ADDRESS,
  }))
);
console.log(myTokens);

// Get info without program id
console.log(await fetchMint(rpc, tokenMint.address));
console.log(await fetchMint(rpc, token2022Mint.address));
