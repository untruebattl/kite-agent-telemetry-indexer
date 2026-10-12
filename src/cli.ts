#!/usr/bin/env node
import { KiteFacilitatorClient } from './facilitator.js';
import { AgentTelemetryIndexer } from './indexer.js';

async function main() {
  console.log('🛸 Kite Agent Telemetry CLI Tool');
  const client = new KiteFacilitatorClient();
  const health = await client.probeHealth();
  console.log(`Facilitator Health: ${health.status} (${health.latencyMs}ms)`);
  
  const indexer = new AgentTelemetryIndexer();
  console.log('Metrics Engine Initialized: Ready for live ingestion.');
}

main().catch(console.error);
