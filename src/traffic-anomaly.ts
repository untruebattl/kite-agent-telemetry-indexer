import { AgentInvocationEvent } from './types.js';

export interface AnomalySpikeReport {
  isAnomaly: boolean;
  baselineAvgTps: number;
  currentWindowTps: number;
  multiplier: number;
  message?: string;
}

/**
 * TrafficAnomalyDetector
 * Analyzes traffic acceleration to detect potential distributed DDoS or draining bursts
 */
export class TrafficAnomalyDetector {
  private baselineEvents: AgentInvocationEvent[] = [];
  private surgeThresholdMultiplier: number;

  constructor(surgeThresholdMultiplier: number = 3.0) {
    this.surgeThresholdMultiplier = surgeThresholdMultiplier;
  }

  public recordBaselineEvents(events: AgentInvocationEvent[]): void {
    this.baselineEvents.push(...events);
  }

  public evaluateBurst(currentWindowEvents: AgentInvocationEvent[], windowSeconds: number): AnomalySpikeReport {
    if (windowSeconds <= 0) {
      throw new Error('windowSeconds must be greater than 0');
    }

    const currentTps = currentWindowEvents.length / windowSeconds;

    // If baseline has insufficient data, assume current is normal
    if (this.baselineEvents.length < 5) {
      return {
        isAnomaly: false,
        baselineAvgTps: currentTps,
        currentWindowTps: currentTps,
        multiplier: 1.0,
      };
    }

    // Baseline calculation over history
    const totalBaselineTime = Math.max(1, (this.baselineEvents[this.baselineEvents.length - 1].timestamp - this.baselineEvents[0].timestamp) / 1000);
    const baselineAvgTps = Math.max(0.1, this.baselineEvents.length / totalBaselineTime);
    const multiplier = currentTps / baselineAvgTps;

    const isAnomaly = multiplier >= this.surgeThresholdMultiplier;

    return {
      isAnomaly,
      baselineAvgTps: Number(baselineAvgTps.toFixed(2)),
      currentWindowTps: Number(currentTps.toFixed(2)),
      multiplier: Number(multiplier.toFixed(2)),
      message: isAnomaly ? `Traffic surge detected: current TPS ${currentTps.toFixed(2)} is ${multiplier.toFixed(1)}x baseline` : undefined,
    };
  }
}
