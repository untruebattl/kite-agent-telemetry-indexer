import { AgentInvocationEvent } from './types.js';

export interface TelemetryAlertThresholds {
  maxLatencyMs: number;
  minSuccessRate: number;
  maxErrorRate: number;
}

export interface TelemetryAlert {
  agentId: string;
  type: 'HIGH_LATENCY' | 'LOW_SUCCESS_RATE' | 'ABNORMAL_VOLUME';
  message: string;
  triggeredAt: number;
  metricValue: number;
}

/**
 * HealthAlertManager
 * Continuously evaluates agent telemetry streams against performance SLAs and raises alerts
 */
export class HealthAlertManager {
  private thresholds: TelemetryAlertThresholds;
  private alerts: TelemetryAlert[] = [];

  constructor(thresholds: Partial<TelemetryAlertThresholds> = {}) {
    this.thresholds = {
      maxLatencyMs: thresholds.maxLatencyMs ?? 2000,
      minSuccessRate: thresholds.minSuccessRate ?? 0.95,
      maxErrorRate: thresholds.maxErrorRate ?? 0.05,
    };
  }

  public evaluateEvent(event: AgentInvocationEvent): TelemetryAlert | null {
    if (event.durationMs > this.thresholds.maxLatencyMs) {
      const alert: TelemetryAlert = {
        agentId: event.agentId,
        type: 'HIGH_LATENCY',
        message: `Agent ${event.agentId} invocation latency ${event.durationMs}ms exceeded threshold ${this.thresholds.maxLatencyMs}ms`,
        triggeredAt: Date.now(),
        metricValue: event.durationMs,
      };
      this.alerts.push(alert);
      return alert;
    }
    return null;
  }

  public evaluateAgentBatch(agentId: string, events: AgentInvocationEvent[]): TelemetryAlert | null {
    const agentEvents = events.filter((e) => e.agentId === agentId);
    if (agentEvents.length === 0) return null;

    const settled = agentEvents.filter((e) => e.status === 'settled').length;
    const rate = settled / agentEvents.length;

    if (rate < this.thresholds.minSuccessRate) {
      const alert: TelemetryAlert = {
        agentId,
        type: 'LOW_SUCCESS_RATE',
        message: `Agent ${agentId} success rate ${(rate * 100).toFixed(1)}% dropped below SLA threshold ${(this.thresholds.minSuccessRate * 100).toFixed(1)}%`,
        triggeredAt: Date.now(),
        metricValue: Number(rate.toFixed(4)),
      };
      this.alerts.push(alert);
      return alert;
    }

    return null;
  }

  public getAlerts(): readonly TelemetryAlert[] {
    return [...this.alerts];
  }

  public clearAlerts(): void {
    this.alerts = [];
  }
}
