// src/handlers/ColumnSelectionHandler.ts
import { Grid } from "../Grid";
import { DragState } from "../main";

/**
 * @class ColumnSelectionHandler
 * @description Manages the selection of full columns in the grid.
 */
export class ColumnSelectionHandler {
  private grid: Grid;
  private dragState: DragState;
  private startCol: number = 0;

  constructor(grid: Grid, dragState: DragState) {
    this.grid = grid;
    this.dragState = dragState;
  }

  /**
   * @public
   * @method handleMouseDown
   * @description Handles mouse down events on the column header to initiate full column selection.
   * @param {MouseEvent} e - The mouse event object.
   */
  public handleMouseDown(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const virtualX = clickX + this.grid.scrollX;

    if (this.dragState.isResizing) {
      return;
    }

    if (clickY < this.grid.headerHeight && clickX >= this.grid.headerWidth) {
      this.dragState.isDraggingColHeader = true;
      const col = this.grid.colAtX(virtualX);
      if (col) {
        this.startCol = col;
        this.grid.selectedCol = col;
        this.grid.selectedRow = 1;
        this.grid.selectionStartCol = this.startCol;
        this.grid.selectionEndCol = col;
        this.grid.selectionStartRow = 1;
        this.grid.selectionEndRow = this.grid.rows - 1;
        this.grid.requestRedraw();
      }
    }
  }

  /**
   * @public
   * @method handleMouseDrag
   * @description Handles mouse drag events to extend the full column selection.
   * @param {MouseEvent} e - The mouse event object.
   */
  public handleMouseDrag(e: MouseEvent): void {
    if (!this.dragState.isDraggingColHeader) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const virtualX = mouseX + this.grid.scrollX;

    const col = this.grid.colAtX(virtualX);
    if (col) {
      this.grid.selectionStartCol = this.startCol;
      this.grid.selectionEndCol = col;
      this.grid.selectionStartRow = 1;
      this.grid.selectionEndRow = this.grid.rows - 1;
      this.grid.requestRedraw();
    }
  }
}
