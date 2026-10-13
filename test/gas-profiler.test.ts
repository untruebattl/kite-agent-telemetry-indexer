import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GasConsumptionProfiler } from '../src/gas-profiler.js';

describe('GasConsumptionProfiler', () => {
  it('returns empty profile summary when no events recorded', () => {
    const profiler = new GasConsumptionProfiler();
    const summary = profiler.getSummary();

    assert.strictEqual(summary.totalGasUsed, 0n);
    assert.strictEqual(summary.averageGasPerInvocation, 0n);
    assert.strictEqual(summary.highestConsumptionAgent, null);
  });

  it('aggregates gas usage and identifies highest consuming agent', () => {
    const profiler = new GasConsumptionProfiler();

    profiler.recordGasUsage({
      blockNumber: 100n,
      agentId: 'agent-researcher',
      gasUsed: 50_000n,
      effectiveGasPriceGwei: 2,
      totalFeePieUSD: 0.001,
    });

    profiler.recordGasUsage({
      blockNumber: 101n,
      agentId: 'agent-auditor',
      gasUsed: 150_000n,
      effectiveGasPriceGwei: 2,
      totalFeePieUSD: 0.003,
    });

    profiler.recordGasUsage({
      blockNumber: 102n,
      agentId: 'agent-researcher',
      gasUsed: 60_000n,
      effectiveGasPriceGwei: 2,
      totalFeePieUSD: 0.0012,
    });

    const summary = profiler.getSummary();
    assert.strictEqual(summary.totalGasUsed, 260_000n);
    assert.strictEqual(summary.averageGasPerInvocation, 86_666n);
    assert.strictEqual(summary.highestConsumptionAgent?.agentId, 'agent-auditor');
    assert.strictEqual(summary.highestConsumptionAgent?.gasUsed, 150_000n);
  });

  it('rejects non-positive gas measurements', () => {
    const profiler = new GasConsumptionProfiler();
    assert.throws(
      () =>
        profiler.recordGasUsage({
          blockNumber: 100n,
          agentId: 'agent-1',
          gasUsed: 0n,
          effectiveGasPriceGwei: 1,
          totalFeePieUSD: 0,
        }),
      /gasUsed must be strictly positive/
    );
  });
});
