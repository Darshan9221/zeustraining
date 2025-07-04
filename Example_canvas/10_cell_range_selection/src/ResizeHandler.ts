// src/ResizeHandler.ts
import { Grid } from "./Grid";

export class ResizeHandler {
  private grid: Grid;
  private canvas: HTMLCanvasElement;
  private resizingCol: number | null = null;
  private resizingRow: number | null = null;
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private resizeOrigWidth: number = 0;
  private resizeOrigHeight: number = 0;

  constructor(grid: Grid, canvas: HTMLCanvasElement) {
    this.grid = grid;
    this.canvas = canvas;
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("mousemove", this.handleMouseDrag.bind(this));
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.resizingCol !== null || this.resizingRow !== null) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const virtualMouseX = mouseX + this.grid.scrollX;
    const virtualMouseY = mouseY + this.grid.scrollY;
    let colEdge: number | null = null;
    for (
      let c = this.grid.viewportStartCol;
      c <= this.grid.viewportEndCol + 1;
      c++
    ) {
      const borderX = this.grid.getColX(c);
      if (Math.abs(virtualMouseX - borderX) < 5) {
        colEdge = c - 1;
        break;
      }
    }
    let rowEdge: number | null = null;
    for (
      let r = this.grid.viewportStartRow;
      r <= this.grid.viewportEndRow + 1;
      r++
    ) {
      const borderY = this.grid.getRowY(r);
      if (Math.abs(virtualMouseY - borderY) < 5) {
        rowEdge = r - 1;
        break;
      }
    }
    if (colEdge !== null && mouseY < this.grid.headerHeight) {
      this.canvas.style.cursor = "col-resize";
    } else if (rowEdge !== null && mouseX < this.grid.headerWidth) {
      this.canvas.style.cursor = "row-resize";
    } else {
      this.canvas.style.cursor = "";
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const virtualMouseX = mouseX + this.grid.scrollX;
    const virtualMouseY = mouseY + this.grid.scrollY;
    for (
      let c = this.grid.viewportStartCol;
      c <= this.grid.viewportEndCol + 1;
      c++
    ) {
      const borderX = this.grid.getColX(c);
      if (
        Math.abs(virtualMouseX - borderX) < 5 &&
        mouseY < this.grid.headerHeight
      ) {
        this.resizingCol = c - 1;
        this.resizeStartX = mouseX;
        this.resizeOrigWidth = this.grid.colWidths[this.resizingCol];
        return;
      }
    }
    for (
      let r = this.grid.viewportStartRow;
      r <= this.grid.viewportEndRow + 1;
      r++
    ) {
      const borderY = this.grid.getRowY(r);
      if (
        Math.abs(virtualMouseY - borderY) < 5 &&
        mouseX < this.grid.headerWidth
      ) {
        this.resizingRow = r - 1;
        this.resizeStartY = mouseY;
        this.resizeOrigHeight = this.grid.rowHeights[this.resizingRow];
        return;
      }
    }
  }

  private handleMouseDrag(e: MouseEvent): void {
    if (this.resizingCol !== null) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const newWidth = Math.max(
        24,
        this.resizeOrigWidth + (mouseX - this.resizeStartX)
      );
      this.grid.colWidths[this.resizingCol] = newWidth;
      this.grid.requestRedraw(); // CHANGED
    } else if (this.resizingRow !== null) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const newHeight = Math.max(
        12,
        this.resizeOrigHeight + (mouseY - this.resizeStartY)
      );
      this.grid.rowHeights[this.resizingRow] = newHeight;
      this.grid.requestRedraw(); // CHANGED
    }
  }

  private handleMouseUp(): void {
    if (this.resizingCol !== null || this.resizingRow !== null) {
      this.grid.updateScrollbarContentSize();
    }
    this.resizingCol = null;
    this.resizingRow = null;
  }
}
