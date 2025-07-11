import { Grid } from "../Grid";
import { IInteractionHandler } from "../InteractionTypes";

/**
 * @class RangeSelectionHandler
 * @description Manages the selection of a single cell or a range of cells.
 */
export class RangeSelectionHandler implements IInteractionHandler {
  private grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    // Hit is true if not in any header area.
    return clickX >= this.grid.headerWidth && clickY >= this.grid.headerHeight;
  }

  public handleMouseDown(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const virtualX = clickX + this.grid.scrollX;
    const virtualY = clickY + this.grid.scrollY;
    const row = this.grid.rowAtY(virtualY);
    const col = this.grid.colAtX(virtualX);

    if (row === undefined || col === undefined || row === null || col === null)
      return;

    // Update grid state for the newly selected cell
    this.grid.selectedRow = row;
    this.grid.selectedCol = col;
    this.grid.selectionStartRow = row;
    this.grid.selectionStartCol = col;
    this.grid.selectionEndRow = row;
    this.grid.selectionEndCol = col;

    document.getElementById("selectedInfo")!.textContent = `R${row}, C${col}`;
    this.grid.requestRedraw();
  }

  public handleMouseDrag(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const virtualX = mouseX + this.grid.scrollX;
    const virtualY = mouseY + this.grid.scrollY;

    const row =
      this.grid.rowAtY(virtualY) ||
      (virtualY < this.grid.headerHeight ? 1 : this.grid.rows - 1);
    const col =
      this.grid.colAtX(virtualX) ||
      (virtualX < this.grid.headerWidth ? 1 : this.grid.cols - 1);

    if (row && col) {
      const endRow = Math.max(1, Math.min(row, this.grid.rows - 1));
      const endCol = Math.max(1, Math.min(col, this.grid.cols - 1));

      // Update the end of the selection range if it has changed.
      if (
        endRow !== this.grid.selectionEndRow ||
        endCol !== this.grid.selectionEndCol
      ) {
        this.grid.selectionEndRow = endRow;
        this.grid.selectionEndCol = endCol;
        this.grid.requestRedraw();
      }
    }
  }

  public handleMouseUp(e: MouseEvent): void {
    // No specific action on mouse up for range selection,
    // as the state is already updated during drag.
  }
}
