import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SlidingWindowAggregator } from '../src/sliding-window.js';
import { AgentInvocationEvent } from '../src/types.js';

describe('SlidingWindowAggregator', () => {
  const now = Date.now();

  const createEvent = (ageMs: number, latencyMs: number, amount: string, status: 'settled' | 'reverted' = 'settled'): AgentInvocationEvent => ({
    agentId: 'agent-eval-1',
    caller: '0x1111111111111111111111111111111111111111',
    facilitatorTxHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    settledAmount: amount,
    tokenSymbol: 'pieUSD',
    blockNumber: 100n,
    timestamp: now - ageMs,
    durationMs: latencyMs,
    status,
  });

  it('aggregates zero stats for empty event list', () => {
    const aggregator = new SlidingWindowAggregator(60);
    const stats = aggregator.aggregate([], now);

    assert.strictEqual(stats.eventCount, 0);
    assert.strictEqual(stats.volumePieUSD, 0);
    assert.strictEqual(stats.throughputTps, 0);
  });

  it('calculates latency percentiles and volume within sliding window', () => {
    const aggregator = new SlidingWindowAggregator(60); // 60s
    const events: AgentInvocationEvent[] = [
      createEvent(5000, 100, '10.5'),
      createEvent(10000, 200, '20.0'),
      createEvent(15000, 300, '30.0'),
      createEvent(20000, 400, '40.0'),
      createEvent(90000, 999, '500.0'), // Expired (>60s)
    ];

    const stats = aggregator.aggregate(events, now);
    assert.strictEqual(stats.eventCount, 4);
    assert.strictEqual(stats.volumePieUSD, 100.5);
    assert.strictEqual(stats.latencyPercentiles.min, 100);
    assert.strictEqual(stats.latencyPercentiles.max, 400);
    assert.strictEqual(stats.latencyPercentiles.p50, 300);
    assert.strictEqual(stats.successRate, 1.0);
  });
});
