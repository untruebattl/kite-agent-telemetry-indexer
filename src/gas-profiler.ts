import { AgentInvocationEvent } from './types.js';

export interface GasUsageRecord {
  blockNumber: bigint;
  agentId: string;
  gasUsed: bigint;
  effectiveGasPriceGwei: number;
  totalFeePieUSD: number;
}

export interface GasProfilingSummary {
  totalGasUsed: bigint;
  averageGasPerInvocation: bigint;
  totalFeesPieUSD: number;
  highestConsumptionAgent: { agentId: string; gasUsed: bigint } | null;
}

/**
 * GasConsumptionProfiler
 * Measures EVM execution gas costs and computes aggregate efficiency across agent invocations
 */
export class GasConsumptionProfiler {
  private records: GasUsageRecord[] = [];

  public recordGasUsage(record: GasUsageRecord): void {
    if (record.gasUsed <= 0n) {
      throw new Error('gasUsed must be strictly positive');
    }
    this.records.push(record);
  }

  public getSummary(): GasProfilingSummary {
    if (this.records.length === 0) {
      return {
        totalGasUsed: 0n,
        averageGasPerInvocation: 0n,
        totalFeesPieUSD: 0,
        highestConsumptionAgent: null,
      };
    }

    let totalGas = 0n;
    let totalFees = 0;
    const agentGasMap = new Map<string, bigint>();

    for (const r of this.records) {
      totalGas += r.gasUsed;
      totalFees += r.totalFeePieUSD;
      const current = agentGasMap.get(r.agentId) ?? 0n;
      agentGasMap.set(r.agentId, current + r.gasUsed);
    }

    let maxAgentId = '';
    let maxGas = 0n;
    for (const [agentId, gas] of agentGasMap.entries()) {
      if (gas > maxGas) {
        maxGas = gas;
        maxAgentId = agentId;
      }
    }

    return {
      totalGasUsed: totalGas,
      averageGasPerInvocation: totalGas / BigInt(this.records.length),
      totalFeesPieUSD: parseFloat(totalFees.toFixed(4)),
      highestConsumptionAgent: maxAgentId ? { agentId: maxAgentId, gasUsed: maxGas } : null,
    };
  }

  public getRecordCount(): number {
    return this.records.length;
  }
}
