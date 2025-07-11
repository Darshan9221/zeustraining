import { Grid } from "../Grid";
import { IInteractionHandler } from "../Interactiontypes";

export class RangeSelectionHandler implements IInteractionHandler {
  private grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // this is the "default" handler, so it hits if not in any header area.
    return x >= this.grid.headerWidth && y >= this.grid.headerHeight;
  }

  public handleMouseDown(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const v_x = clickX + this.grid.scrollX;
    const v_y = clickY + this.grid.scrollY;
    const row_idx = this.grid.rowAtY(v_y);
    const col_idx = this.grid.colAtX(v_x);

    if (row_idx === null || col_idx === null) return;

    // A new click starts a new selection.
    this.grid.selectedRow = row_idx;
    this.grid.selectedCol = col_idx;
    this.grid.selectionStartRow = row_idx;
    this.grid.selectionStartCol = col_idx;
    this.grid.selectionEndRow = row_idx;
    this.grid.selectionEndCol = col_idx;

    document.getElementById(
      "selectedInfo"
    )!.textContent = `R${row_idx}, C${col_idx}`;
    this.grid.requestRedraw();
  }

  public handleMouseDrag(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const virtualX = mouseX + this.grid.scrollX;
    const virtualY = mouseY + this.grid.scrollY;

    // Figure out what cell the mouse is over
    let row = this.grid.rowAtY(virtualY);
    if (row === null) {
      // if we drag off the top or bottom, select to the edge
      row = virtualY < this.grid.headerHeight ? 1 : this.grid.rows - 1;
    }

    let col = this.grid.colAtX(virtualX);
    if (col === null) {
      col = virtualX < this.grid.headerWidth ? 1 : this.grid.cols - 1;
    }

    const endRow = Math.max(1, Math.min(row, this.grid.rows - 1));
    const endCol = Math.max(1, Math.min(col, this.grid.cols - 1));

    // Only redraw if the selection actually changed
    if (
      endRow !== this.grid.selectionEndRow ||
      endCol !== this.grid.selectionEndCol
    ) {
      this.grid.selectionEndRow = endRow;
      this.grid.selectionEndCol = endCol;
      this.grid.requestRedraw();
    }
  }

  public handleMouseUp(e: MouseEvent): void {
    // Nothing to do here, drag already updated everything.
    // The main handler will clear the active handler state.
  }
}
