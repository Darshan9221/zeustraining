import { Grid } from "../Grid";
import { MouseHandler } from "../types";

export class RowResize implements MouseHandler {
  private grid: Grid;
  private resizingRow: number | null = null;
  private resizeStartY: number = 0;
  private resizeOriginalHeight: number = 0;

  private hitTestRow: number | null = null;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const mouse_x = e.clientX - rect.left;
    const mouse_y = e.clientY - rect.top;

    if (mouse_x >= this.grid.headerWidth) {
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
      if (Math.abs(mouse_y - borderY) < resizeHandleWidth) {
        this.hitTestRow = r - 1;
        return true;
      }
    }

    this.hitTestRow = null;
    return false;
  }

  public setCursor(e: MouseEvent): string {
    return "row-resize";
  }

  public handleMouseDown(e: MouseEvent): void {
    if (this.hitTestRow === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    this.resizingRow = this.hitTestRow;
    this.resizeStartY = mouseY;
    this.resizeOriginalHeight = this.grid.rowHeights[this.resizingRow];
  }

  public handleMouseDrag(e: MouseEvent): void {
    if (this.resizingRow === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const dragDistance = mouseY - this.resizeStartY;

    const new_height = Math.max(12, this.resizeOriginalHeight + dragDistance);
    this.grid.rowHeights[this.resizingRow] = new_height;
    this.grid.requestRedraw();
  }

  public handleMouseUp(e: MouseEvent): object | void {
    if (this.resizingRow === null) return;

    this.grid.updateScrollbarContentSize();
    const action = {
      row: this.resizingRow,
      from: this.resizeOriginalHeight,
      to: this.grid.rowHeights[this.resizingRow],
    };

    this.resizingRow = null;
    return action;
  }
}
