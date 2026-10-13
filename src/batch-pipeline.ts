import { AgentInvocationEvent } from './types.js';

export interface BatchIngestOptions {
  deduplicateTxHash?: boolean;
  maxBatchSize?: number;
}

export interface IngestReport {
  ingestedCount: number;
  duplicateCount: number;
  totalVolumeAdded: number;
  highestBlockNumber: bigint;
}

/**
 * BatchIngestionPipeline
 * Buffers and processes high-throughput bulk telemetry events with transaction deduplication
 */
export class BatchIngestionPipeline {
  private observedHashes: Set<string> = new Set();
  private processedEvents: AgentInvocationEvent[] = [];

  public ingest(events: AgentInvocationEvent[], options: BatchIngestOptions = {}): IngestReport {
    const dedupe = options.deduplicateTxHash ?? true;
    let duplicateCount = 0;
    let volumeAdded = 0;
    let highestBlock = 0n;

    for (const e of events) {
      const hashKey = e.facilitatorTxHash.toLowerCase();
      if (dedupe && this.observedHashes.has(hashKey)) {
        duplicateCount++;
        continue;
      }

      this.observedHashes.add(hashKey);
      this.processedEvents.push(e);
      volumeAdded += parseFloat(e.settledAmount);

      if (e.blockNumber > highestBlock) {
        highestBlock = e.blockNumber;
      }
    }

    return {
      ingestedCount: events.length - duplicateCount,
      duplicateCount,
      totalVolumeAdded: parseFloat(volumeAdded.toFixed(4)),
      highestBlockNumber: highestBlock,
    };
  }

  public getProcessedCount(): number {
    return this.processedEvents.length;
  }

  public clear(): void {
    this.observedHashes.clear();
    this.processedEvents = [];
  }
}
