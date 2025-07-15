import { Grid } from "../Grid";
import { MouseHandler } from "../types";
import { HistoryManager } from "../history/historyManager";
import { ResizeColCommand } from "../history/commands";

export class ColResize implements MouseHandler {
  private grid: Grid;
  private resizingCol: number | null = null;
  private resizeStartX: number = 0;
  private resizeOriginalWidth: number = 0;

  private hitTestCol: number | null = null;
  private historyManager: HistoryManager;

  constructor(grid: Grid, historyManager: HistoryManager) {
    this.grid = grid;
    this.historyManager = historyManager;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const mouse_x = e.clientX - rect.left;
    const mouse_y = e.clientY - rect.top;

    if (mouse_y >= this.grid.headerHeight) {
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
      if (Math.abs(mouse_x - borderX) < resizeHandleWidth) {
        this.hitTestCol = c - 1;
        return true;
      }
    }

    this.hitTestCol = null;
    return false;
  }

  public setCursor(e: MouseEvent): string {
    return "col-resize";
  }

  public handleMouseDown(event: MouseEvent): void {
    if (this.hitTestCol === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouse_x = event.clientX - rect.left;

    this.resizingCol = this.hitTestCol;
    this.resizeStartX = mouse_x;
    this.resizeOriginalWidth = this.grid.colWidths[this.resizingCol];
  }

  public handleMouseDrag(e: MouseEvent): void {
    if (this.resizingCol === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const dragDistance = mouseX - this.resizeStartX;

    const new_width = Math.max(24, this.resizeOriginalWidth + dragDistance);
    this.grid.colWidths[this.resizingCol] = new_width;
    this.grid.requestRedraw();
  }

  public handleMouseUp(e: MouseEvent): void {
    if (this.resizingCol === null) return;

    this.grid.updateScrollbarContentSize();
    const newWidth = this.grid.colWidths[this.resizingCol];

    if (newWidth !== this.resizeOriginalWidth) {
      const command = new ResizeColCommand(
        this.resizingCol,
        this.resizeOriginalWidth,
        newWidth
      );
      this.historyManager.record(command);
    }
    this.resizingCol = null;
  }
}
