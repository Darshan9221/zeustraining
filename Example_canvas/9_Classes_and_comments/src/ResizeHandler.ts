// src/ResizeHandler.ts
import { Grid } from "./Grid";

/**
 * Manages all user interactions related to resizing rows and columns.
 */
export class ResizeHandler {
  /** @type {Grid} A reference to the main Grid instance. */
  private grid: Grid;
  /** @type {HTMLCanvasElement} The main canvas element. */
  private canvas: HTMLCanvasElement;

  // --- Resizing State ---
  /** @type {number | null} The index of the column currently being resized. */
  private resizingCol: number | null = null;
  /** @type {number | null} The index of the row currently being resized. */
  private resizingRow: number | null = null;
  /** @type {number} The initial mouse X position when a resize drag starts. */
  private resizeStartX: number = 0;
  /** @type {number} The initial mouse Y position when a resize drag starts. */
  private resizeStartY: number = 0;
  /** @type {number} The original width of the column before resizing. */
  private resizeOrigWidth: number = 0;
  /** @type {number} The original height of the row before resizing. */
  private resizeOrigHeight: number = 0;

  /**
   * Initializes the ResizeHandler and sets up mouse event listeners.
   * @param {Grid} grid The main Grid instance.
   * @param {HTMLCanvasElement} canvas The canvas element.
   */
  constructor(grid: Grid, canvas: HTMLCanvasElement) {
    this.grid = grid;
    this.canvas = canvas;

    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("mousemove", this.handleMouseDrag.bind(this));
  }

  /**
   * Handles the mouse move event to detect hovering over a resize handle and change the cursor.
   * @param {MouseEvent} e The mouse event.
   */
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
        colEdge = c - 1; // We are resizing the column to the left of the border
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
        rowEdge = r - 1; // We are resizing the row above the border
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

  /**
   * Handles the mouse down event to initiate a resize operation.
   * @param {MouseEvent} e The mouse event.
   */
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

  /**
   * Handles the mouse drag event to apply the new width or height during a resize.
   * @param {MouseEvent} e The mouse event.
   */
  private handleMouseDrag(e: MouseEvent): void {
    if (this.resizingCol !== null) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const newWidth = Math.max(
        24,
        this.resizeOrigWidth + (mouseX - this.resizeStartX)
      );
      this.grid.colWidths[this.resizingCol] = newWidth;
      this.grid.drawGrid();
    } else if (this.resizingRow !== null) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const newHeight = Math.max(
        12,
        this.resizeOrigHeight + (mouseY - this.resizeStartY)
      );
      this.grid.rowHeights[this.resizingRow] = newHeight;
      this.grid.drawGrid();
    }
  }

  /**
   * Handles the mouse up event to end the resize operation.
   */
  private handleMouseUp(): void {
    if (this.resizingCol !== null || this.resizingRow !== null) {
      this.grid.updateScrollbarContentSize();
    }
    this.resizingCol = null;
    this.resizingRow = null;
  }
}
