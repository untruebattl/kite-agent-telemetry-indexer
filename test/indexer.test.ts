import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AgentTelemetryIndexer } from '../src/indexer.js';

describe('AgentTelemetryIndexer Unit Tests', () => {
  it('should correctly ingest events and compute metrics', () => {
    const indexer = new AgentTelemetryIndexer();
    indexer.recordEvent({
      agentId: 'agent-auditor',
      caller: '0x0000000000000000000000000000000000000001',
      facilitatorTxHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
      settledAmount: '0.05',
      tokenSymbol: 'pieUSD',
      blockNumber: 100n,
      timestamp: 1700000000,
      durationMs: 200,
      status: 'settled',
    });

    const metrics = indexer.getMetrics();
    assert.strictEqual(metrics.totalInvocations, 1);
    assert.strictEqual(metrics.totalVolumePieUSD, 0.05);
    assert.strictEqual(metrics.activeAgentsCount, 1);
  });
});
