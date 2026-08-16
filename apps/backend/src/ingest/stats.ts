import type { IngestAction } from './types';

export class IngestStats {
  inserted = 0;
  updated = 0;
  skipped = 0;
  failed = 0;

  record(action: IngestAction): void {
    this[action] += 1;
  }

  print(label: string): void {
    console.log(
      `[ingest] ${label}: inserted=${this.inserted} updated=${this.updated} skipped=${this.skipped} failed=${this.failed}`
    );
  }
}
