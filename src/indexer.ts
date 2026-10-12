import { AgentInvocationEvent, IndexerMetrics } from './types.js';

export class AgentTelemetryIndexer {
  private events: AgentInvocationEvent[] = [];
  private currentBlock: bigint = 1842910n;

  public recordEvent(event: AgentInvocationEvent): void {
    this.events.unshift(event);
    if (event.blockNumber > this.currentBlock) {
      this.currentBlock = event.blockNumber;
    }
  }

  public getMetrics(): IndexerMetrics {
    const totalVolume = this.events.reduce(
      (acc, curr) => acc + parseFloat(curr.settledAmount),
      0
    );
    const avgLatency = this.events.length
      ? this.events.reduce((acc, curr) => acc + curr.durationMs, 0) / this.events.length
      : 0;

    const uniqueAgents = new Set(this.events.map((e) => e.agentId));

    return {
      totalInvocations: this.events.length,
      totalVolumePieUSD: parseFloat(totalVolume.toFixed(4)),
      averageLatencyMs: Math.round(avgLatency),
      activeAgentsCount: uniqueAgents.size,
      lastIndexedBlock: this.currentBlock,
    };
  }

  public getEventsByAgent(agentId: string): AgentInvocationEvent[] {
    return this.events.filter((e) => e.agentId === agentId);
  }
}
