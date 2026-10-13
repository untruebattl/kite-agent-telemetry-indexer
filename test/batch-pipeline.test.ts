import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BatchIngestionPipeline } from '../src/batch-pipeline.js';
import { AgentInvocationEvent } from '../src/types.js';

describe('BatchIngestionPipeline', () => {
  const mockEvent = (hash: `0x${string}`, amount: string, block: bigint): AgentInvocationEvent => ({
    agentId: 'agent-1',
    caller: '0x1111111111111111111111111111111111111111',
    facilitatorTxHash: hash,
    settledAmount: amount,
    tokenSymbol: 'pieUSD',
    blockNumber: block,
    timestamp: Date.now(),
    durationMs: 150,
    status: 'settled',
  });

  it('ingests batch and skips duplicate transaction hashes', () => {
    const pipeline = new BatchIngestionPipeline();
    const batch = [
      mockEvent('0x1111111111111111111111111111111111111111111111111111111111111111', '10.5', 100n),
      mockEvent('0x2222222222222222222222222222222222222222222222222222222222222222', '20.0', 105n),
      mockEvent('0x1111111111111111111111111111111111111111111111111111111111111111', '10.5', 100n), // Duplicate
    ];

    const report = pipeline.ingest(batch);
    assert.strictEqual(report.ingestedCount, 2);
    assert.strictEqual(report.duplicateCount, 1);
    assert.strictEqual(report.totalVolumeAdded, 30.5);
    assert.strictEqual(report.highestBlockNumber, 105n);
    assert.strictEqual(pipeline.getProcessedCount(), 2);
  });
});
