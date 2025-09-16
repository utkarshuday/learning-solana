import { Address, getBase64Encoder } from '@solana/kit';
import { createClient } from './client';
import {
  TokenInfoForDisplay,
  TokenProgram,
  TokenTypeForDisplay,
} from './types';
import { fetchMint, getTokenDecoder } from '@solana-program/token-2022';
import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';

export async function fetchTokenInfoByOwner({
  owner,
  programAddress,
}: {
  owner: Address;
  programAddress: TokenProgram;
}): Promise<TokenInfoForDisplay[]> {
  const { rpc } = await createClient();

  const ownedTokens: TokenInfoForDisplay[] = [];
  const { value: tokenAccounts } = await rpc
    .getTokenAccountsByOwner(
      owner,
      { programId: programAddress },
      { encoding: 'base64' }
    )
    .send();

  const tokenDecoder = getTokenDecoder();
  const base64Encoder = getBase64Encoder();

  const decode = (base64Data: string) =>
    tokenDecoder.decode(base64Encoder.encode(base64Data));

  for (const tokenAccount of tokenAccounts) {
    const address = tokenAccount.pubkey;
    const type: TokenTypeForDisplay =
      programAddress === TOKEN_PROGRAM_ADDRESS
        ? TokenTypeForDisplay.TOKEN
        : TokenTypeForDisplay.TOKEN_22;
    const token = decode(tokenAccount.account.data[0]);
    const mint = token.mint;
    const mintInfo = await fetchMint(rpc, mint);
    const amount = Number(token.amount);
    const decimals = mintInfo.data.decimals;
    const displayAmount = amount / 10 ** decimals;
    ownedTokens.push({
      address,
      type,
      amount,
      displayAmount,
      decimals,
      mint,
    });
  }

  return ownedTokens;
}
