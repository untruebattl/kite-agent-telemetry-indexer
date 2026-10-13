import { describe, it } from 'node:test';
import assert from 'node:assert';
import { HealthAlertManager } from '../src/alert-manager.js';
import { AgentInvocationEvent } from '../src/types.js';

describe('HealthAlertManager', () => {
  const createMockEvent = (durationMs: number, status: 'settled' | 'reverted' = 'settled'): AgentInvocationEvent => ({
    agentId: 'agent-auditor-1',
    caller: '0x1111111111111111111111111111111111111111',
    facilitatorTxHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    settledAmount: '5.0',
    tokenSymbol: 'pieUSD',
    blockNumber: 100n,
    timestamp: Date.now(),
    durationMs,
    status,
  });

  it('triggers alert when latency breaches SLA threshold', () => {
    const manager = new HealthAlertManager({ maxLatencyMs: 1500 });
    const normalEvent = createMockEvent(800);
    const breachEvent = createMockEvent(2200);

    assert.strictEqual(manager.evaluateEvent(normalEvent), null);
    const alert = manager.evaluateEvent(breachEvent);

    assert.ok(alert !== null);
    assert.strictEqual(alert.type, 'HIGH_LATENCY');
    assert.strictEqual(alert.metricValue, 2200);
    assert.strictEqual(manager.getAlerts().length, 1);
  });

  it('triggers alert when agent batch success rate drops below SLA', () => {
    const manager = new HealthAlertManager({ minSuccessRate: 0.8 });
    const batch: AgentInvocationEvent[] = [
      createMockEvent(500, 'settled'),
      createMockEvent(500, 'reverted'),
      createMockEvent(500, 'reverted'),
    ];

    const alert = manager.evaluateAgentBatch('agent-auditor-1', batch);
    assert.ok(alert !== null);
    assert.strictEqual(alert.type, 'LOW_SUCCESS_RATE');
  });
});
