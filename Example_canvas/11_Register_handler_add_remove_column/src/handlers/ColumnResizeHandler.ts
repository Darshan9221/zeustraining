import { Grid } from "../Grid";
import { IInteractionHandler } from "../InteractionTypes";

/**
 * @class ColumnResizeHandler
 * @description Manages the resizing of columns in the grid.
 */
export class ColumnResizeHandler implements IInteractionHandler {
  private grid: Grid;
  private resizingCol: number | null = null;
  private resizeStartX: number = 0;
  private resizeOrigWidth: number = 0;

  // To store the result of the last successful hit-test
  private hitTestCol: number | null = null;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseY >= this.grid.headerHeight) {
      this.hitTestCol = null;
      return false;
    }

    const resizeHandleWidth = 5;
    for (
      let c = this.grid.viewportStartCol;
      c <= this.grid.viewportEndCol + 1;
      c++
    ) {
      const borderX = this.grid.getColX(c) - this.grid.scrollX;
      if (Math.abs(mouseX - borderX) < resizeHandleWidth) {
        this.hitTestCol = c - 1;
        return true;
      }
    }

    this.hitTestCol = null;
    return false;
  }

  public handleMouseDown(e: MouseEvent): void {
    if (this.hitTestCol === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    this.resizingCol = this.hitTestCol;
    this.resizeStartX = mouseX;
    this.resizeOrigWidth = this.grid.colWidths[this.resizingCol];
  }

  public handleMouseDrag(e: MouseEvent): void {
    if (this.resizingCol === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const newWidth = Math.max(
      24,
      this.resizeOrigWidth + (mouseX - this.resizeStartX)
    );
    this.grid.colWidths[this.resizingCol] = newWidth;
    this.grid.requestRedraw();
  }

  public handleMouseUp(e: MouseEvent): object | void {
    if (this.resizingCol === null) return;

    this.grid.updateScrollbarContentSize();
    const action = {
      col: this.resizingCol,
      from: this.resizeOrigWidth,
      to: this.grid.colWidths[this.resizingCol],
    };
    this.resizingCol = null;
    return action;
  }
}
