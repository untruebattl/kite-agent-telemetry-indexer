import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TrafficAnomalyDetector } from '../src/traffic-anomaly.js';
import { AgentInvocationEvent } from '../src/types.js';

describe('TrafficAnomalyDetector', () => {
  const createEvent = (timestamp: number): AgentInvocationEvent => ({
    agentId: 'agent-1',
    caller: '0x1111111111111111111111111111111111111111',
    facilitatorTxHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    settledAmount: '1.0',
    tokenSymbol: 'pieUSD',
    blockNumber: 100n,
    timestamp,
    durationMs: 100,
    status: 'settled',
  });

  it('detects surge anomaly when traffic exceeds threshold multiplier', () => {
    const detector = new TrafficAnomalyDetector(3.0); // 3x multiplier
    const startTime = 1000_000;

    // 10 events across 10 seconds -> 1.0 TPS baseline
    const baseline = [];
    for (let i = 0; i < 10; i++) {
      baseline.push(createEvent(startTime + i * 1000));
    }
    detector.recordBaselineEvents(baseline);

    // Current window: 20 events in 2 seconds -> 10.0 TPS (10x baseline)
    const surgeWindow = [];
    for (let i = 0; i < 20; i++) {
      surgeWindow.push(createEvent(startTime + 20_000 + i * 50));
    }

    const report = detector.evaluateBurst(surgeWindow, 2);
    assert.strictEqual(report.isAnomaly, true);
    assert.strictEqual(report.currentWindowTps, 10);
    assert.ok(report.multiplier >= 3.0);
    assert.ok(report.message?.includes('Traffic surge detected'));
  });
});
