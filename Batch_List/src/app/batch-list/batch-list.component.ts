import { Component } from '@angular/core';
import { BatchDialogComponent } from '../batch-dialog/batch-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Part } from '../model/batch-part.model';

@Component({
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent {
  removedPartNames: Set<string> = new Set();
  displayedColumns: string[] = ['partName', 'price', 'time'];
  batches: any[] = [];
  addedParts: Set<string> = new Set();
  removedParts: Part[] = [];
  constructor(private dialog: MatDialog) { }
  openBatchDialog(): void {
    const dialogRef = this.dialog.open(BatchDialogComponent, {
      width: '50vw',
      height: '50vh',
      disableClose: true,
      data: {
        addedParts: Array.from(this.addedParts),
        removedPartNames: Array.from(this.removedPartNames)
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const timestamp = new Date().toLocaleString();
        result.forEach((part: Part) => {
          if (part.removed) {
            const originalBatchIndex = this.batches.findIndex(batch =>
              batch.parts.some((p: any) => p.partName === part.partName && !p.removed)
            );
            if (originalBatchIndex !== -1) {
              const originalBatchId = originalBatchIndex + 1;
              part.removedFromBatch = originalBatchId;
              // Mark as removed in the original batch
              this.batches[originalBatchIndex].parts.forEach((p: any) => {
                if (p.partName === part.partName) {
                  p.removed = true;
                  p.removedFromBatch = originalBatchIndex + 1;
                }
              });
              this.removedPartNames.add(part.partName);
            }
          }
        });
        const parts = result.map((p: Part) => ({
          ...p,
          time: p.removed ? '' : timestamp,
        }));
        this.batches.push({ parts });
        result.forEach((p: any) => {
          if (!p.removed) {
            this.addedParts.add(p.partName);
          }
        });
      }
    });
  }
}
