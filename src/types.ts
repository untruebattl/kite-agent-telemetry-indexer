export interface AgentInvocationEvent {
  agentId: string;
  caller: `0x${string}`;
  facilitatorTxHash: `0x${string}`;
  settledAmount: string;
  tokenSymbol: 'pieUSD' | 'USDC.e';
  blockNumber: bigint;
  timestamp: number;
  durationMs: number;
  status: 'settled' | 'reverted' | 'zero_deduction_aborted';
}

export interface IndexerMetrics {
  totalInvocations: number;
  totalVolumePieUSD: number;
  averageLatencyMs: number;
  activeAgentsCount: number;
  lastIndexedBlock: bigint;
}
