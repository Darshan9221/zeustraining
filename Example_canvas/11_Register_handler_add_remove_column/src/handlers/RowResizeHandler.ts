import { Grid } from "../Grid";
import { IInteractionHandler } from "../InteractionTypes";

/**
 * @class RowResizeHandler
 * @description Manages the resizing of rows in the grid.
 */
export class RowResizeHandler implements IInteractionHandler {
  private grid: Grid;
  private resizingRow: number | null = null;
  private resizeStartY: number = 0;
  private resizeOrigHeight: number = 0;

  private hitTestRow: number | null = null;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX >= this.grid.headerWidth) {
      this.hitTestRow = null;
      return false;
    }

    const resizeHandleWidth = 5;
    for (
      let r = this.grid.viewportStartRow;
      r <= this.grid.viewportEndRow + 1;
      r++
    ) {
      const borderY = this.grid.getRowY(r) - this.grid.scrollY;
      if (Math.abs(mouseY - borderY) < resizeHandleWidth) {
        this.hitTestRow = r - 1;
        return true;
      }
    }

    this.hitTestRow = null;
    return false;
  }

  public handleMouseDown(e: MouseEvent): void {
    if (this.hitTestRow === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    this.resizingRow = this.hitTestRow;
    this.resizeStartY = mouseY;
    this.resizeOrigHeight = this.grid.rowHeights[this.resizingRow];
  }

  public handleMouseDrag(e: MouseEvent): void {
    if (this.resizingRow === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const newHeight = Math.max(
      12,
      this.resizeOrigHeight + (mouseY - this.resizeStartY)
    );
    this.grid.rowHeights[this.resizingRow] = newHeight;
    this.grid.requestRedraw();
  }

  public handleMouseUp(e: MouseEvent): object | void {
    if (this.resizingRow === null) return;

    this.grid.updateScrollbarContentSize();
    const action = {
      row: this.resizingRow,
      from: this.resizeOrigHeight,
      to: this.grid.rowHeights[this.resizingRow],
    };
    this.resizingRow = null;
    return action;
  }
}
