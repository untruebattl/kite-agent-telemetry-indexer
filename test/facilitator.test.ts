import { describe, it } from 'node:test';
import assert from 'node:assert';
import { KiteFacilitatorClient } from '../src/facilitator.js';
import { getKiteDomainSeparator } from '../src/eip3009.js';

describe('Kite Facilitator & EIP-3009 Verification', () => {
  it('should generate accurate EIP-712 domain for Kite Testnet pieUSD', () => {
    const domain = getKiteDomainSeparator(2368, '0x38129cf4CE5E183eFF248F42A7D345Bb1B47621A');
    assert.strictEqual(domain.name, 'pieUSD');
    assert.strictEqual(domain.chainId, 2368n);
    assert.strictEqual(domain.verifyingContract, '0x38129cf4CE5E183eFF248F42A7D345Bb1B47621A');
  });

  it('should enforce zero-deduction invariant on aborted settlement', () => {
    const client = new KiteFacilitatorClient();
    const passed = client.verifyZeroDeductionInvariant({
      agentId: 'agent-sentinel',
      caller: '0x0000000000000000000000000000000000000001',
      facilitatorTxHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      settledAmount: '0',
      tokenSymbol: 'pieUSD',
      blockNumber: 1842920n,
      timestamp: Date.now(),
      durationMs: 45,
      status: 'zero_deduction_aborted',
    });
    assert.strictEqual(passed, true);
  });
});
