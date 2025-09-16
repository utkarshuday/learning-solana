import { isAddress } from '@solana/kit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replacer(_: unknown, value: any) {
  if (isAddress(value)) return `${value.substring(0, 4)}...${value.slice(-4)}`;
  return value;
}

export function printData(data: unknown) {
  JSON.stringify(data, replacer, 2);
}
