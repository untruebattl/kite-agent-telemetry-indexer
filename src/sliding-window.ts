import { AgentInvocationEvent } from './types.js';

export interface LatencyPercentiles {
  p50: number;
  p90: number;
  p99: number;
  max: number;
  min: number;
}

export interface RollingWindowStats {
  windowDurationSeconds: number;
  eventCount: number;
  throughputTps: number;
  volumePieUSD: number;
  successRate: number;
  latencyPercentiles: LatencyPercentiles;
}

/**
 * SlidingWindowAggregator
 * Aggregates high-frequency telemetry events across sliding real-time time windows
 */
export class SlidingWindowAggregator {
  private windowDurationMs: number;

  constructor(windowDurationSeconds: number = 60) {
    this.windowDurationMs = windowDurationSeconds * 1000;
  }

  public aggregate(events: AgentInvocationEvent[], now: number = Date.now()): RollingWindowStats {
    const cutoff = now - this.windowDurationMs;
    const windowEvents = events.filter((e) => e.timestamp >= cutoff);

    if (windowEvents.length === 0) {
      return {
        windowDurationSeconds: this.windowDurationMs / 1000,
        eventCount: 0,
        throughputTps: 0,
        volumePieUSD: 0,
        successRate: 1.0,
        latencyPercentiles: { p50: 0, p90: 0, p99: 0, max: 0, min: 0 },
      };
    }

    const latencies = windowEvents.map((e) => e.durationMs).sort((a, b) => a - b);
    const volume = windowEvents.reduce((acc, e) => acc + parseFloat(e.settledAmount), 0);
    const settledCount = windowEvents.filter((e) => e.status === 'settled').length;

    const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
    const p90 = latencies[Math.floor(latencies.length * 0.9)] ?? 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;

    return {
      windowDurationSeconds: this.windowDurationMs / 1000,
      eventCount: windowEvents.length,
      throughputTps: Number((windowEvents.length / (this.windowDurationMs / 1000)).toFixed(2)),
      volumePieUSD: parseFloat(volume.toFixed(4)),
      successRate: Number((settledCount / windowEvents.length).toFixed(4)),
      latencyPercentiles: {
        p50,
        p90,
        p99,
        max: latencies[latencies.length - 1],
        min: latencies[0],
      },
    };
  }
}
