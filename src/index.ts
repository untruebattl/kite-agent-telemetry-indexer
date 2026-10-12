import { AgentTelemetryIndexer } from './indexer.js';
import { AgentInvocationEvent } from './types.js';

console.log('🛸 [Kite Agent Indexer] Initializing autonomous event stream...');

const indexer = new AgentTelemetryIndexer();

// Ingest mock on-chain telemetry
const sampleEvents: AgentInvocationEvent[] = [
  {
    agentId: 'agent-atlas-coordinator',
    caller: '0x1A2b3c4D5E6F708192A3b4c5D6E7F8091A2b3c4D',
    facilitatorTxHash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
    settledAmount: '0.02',
    tokenSymbol: 'pieUSD',
    blockNumber: 1842911n,
    timestamp: Date.now(),
    durationMs: 142,
    status: 'settled',
  },
  {
    agentId: 'agent-cyberoracle-research',
    caller: '0x992Bcd1A9B61E2e6fFE7c770E8C12e2E45674a21',
    facilitatorTxHash: '0xdef9876543210fedcba09876543210fedcba09876543210fedcba09876543210',
    settledAmount: '0.04',
    tokenSymbol: 'pieUSD',
    blockNumber: 1842915n,
    timestamp: Date.now(),
    durationMs: 310,
    status: 'settled',
  },
];

sampleEvents.forEach((e) => indexer.recordEvent(e));

const metrics = indexer.getMetrics();
console.log('📊 Current Kite Agent Metrics:', JSON.stringify(metrics, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
