import { Grid } from "../Grid";
import { IInteractionHandler } from "../Interactiontypes";

export class RowSelectionHandler implements IInteractionHandler {
  private grid: Grid;
  private startRow: number | null = null;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // check if click is in the row header area (left bar)
    return x < this.grid.headerWidth && y >= this.grid.headerHeight;
  }

  public handleMouseDown(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const click_y = e.clientY - rect.top;
    const virtual_y = click_y + this.grid.scrollY;
    const row_index = this.grid.rowAtY(virtual_y);

    if (row_index === null) return;

    this.startRow = row_index;
    this.grid.selectedRow = row_index;
    this.grid.selectedCol = 1; // active cell is first in the row
    this.grid.selectionStartRow = this.startRow;
    this.grid.selectionEndRow = row_index;
    this.grid.selectionStartCol = 1; // from the very first column
    this.grid.selectionEndCol = this.grid.cols - 1; // to the very last
    this.grid.requestRedraw();
  }

  public handleMouseDrag(e: MouseEvent): void {
    if (this.startRow === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const virtualY = mouseY + this.grid.scrollY;
    const row = this.grid.rowAtY(virtualY);

    if (row && row !== this.grid.selectionEndRow) {
      this.grid.selectionEndRow = row;
      this.grid.requestRedraw();
    }
  }

  public handleMouseUp(e: MouseEvent): void {
    this.startRow = null;
  }
}
