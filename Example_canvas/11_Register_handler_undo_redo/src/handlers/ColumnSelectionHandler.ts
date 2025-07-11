import { Grid } from "../Grid";
import { IInteractionHandler } from "../InteractionTypes";

/**
 * @class ColumnSelectionHandler
 * @description Manages the selection of full columns in the grid.
 */
export class ColumnSelectionHandler implements IInteractionHandler {
  private grid: Grid;
  private startCol: number | null = null;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    return clickY < this.grid.headerHeight && clickX >= this.grid.headerWidth;
  }

  public handleMouseDown(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const virtualX = clickX + this.grid.scrollX;
    const col = this.grid.colAtX(virtualX);

    if (col === undefined || col === null) return;

    this.startCol = col;
    this.grid.selectedCol = col;
    this.grid.selectedRow = 1;
    this.grid.selectionStartCol = this.startCol;
    this.grid.selectionEndCol = col;
    this.grid.selectionStartRow = 1;
    this.grid.selectionEndRow = this.grid.rows - 1;
    this.grid.requestRedraw();
  }

  public handleMouseDrag(e: MouseEvent): void {
    if (this.startCol === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const virtualX = mouseX + this.grid.scrollX;
    const col = this.grid.colAtX(virtualX);

    if (col && col !== this.grid.selectionEndCol) {
      this.grid.selectionEndCol = col;
      this.grid.requestRedraw();
    }
  }

  public handleMouseUp(e: MouseEvent): void {
    this.startCol = null;
  }
}
