import { EIP712Domain } from 'viem';

export const KITE_EIP712_TRANSFER_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

export function getKiteDomainSeparator(chainId: number, tokenAddress: `0x${string}`): EIP712Domain {
  return {
    name: 'pieUSD',
    version: '1',
    chainId: BigInt(chainId),
    verifyingContract: tokenAddress,
  };
}
