import { fetchMint, fetchToken, isExtension } from '@solana-program/token-2022';
import { createNft } from './create-nft';
import { createClient } from './client';
import { isSome, unwrapOptionRecursively } from '@solana/kit';

const { rpc } = await createClient();

const name = 'Oggy';
const symbol = 'OGGY';
const uri =
  'https://raw.githubusercontent.com/utkarshuday/learning-solana/main/token-2022-metadata/assets/oggy.json';
const additionalAttributes: [string, string][] = [
  ['type', 'cat'],
  ['brother', 'Jack'],
];

const { nft, mint, transactionSignature } = await createNft({
  name,
  symbol,
  uri,
  additionalAttributes,
});

console.log('Mint Address: ', mint);
console.log('Transaction Signature: ', transactionSignature);

const nftInfo = await fetchToken(rpc, nft);

const mintInfo = await fetchMint(rpc, mint);

console.log('\nNFT Token Account =====>\n', nftInfo);
console.log('\nMint =====>\n', mintInfo);

// TODO: Find idiomatic way to fetch extensions info and token metadata (especially additionalMetadata)
const extensions = mintInfo.data.extensions;

const extensionsInfo = unwrapOptionRecursively(extensions);
console.log('\nExtensions\n', extensionsInfo);

if (isSome(extensions)) {
  if (isExtension('TokenMetadata', extensions.value[1])) {
    console.log(extensions.value[1].additionalMetadata);
  }
}
