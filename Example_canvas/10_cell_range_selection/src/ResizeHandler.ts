// src/ResizeHandler.ts
import { Grid } from "./Grid";

/**
 * @class ResizeHandler
 * @description Manages the resizing of columns and rows in the grid.
 * It detects mouse interactions on column/row headers and adjusts dimensions accordingly.
 */
export class ResizeHandler {
  private grid: Grid;
  private canvas: HTMLCanvasElement;
  private resizingCol: number | null = null;
  private resizingRow: number | null = null;
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private resizeOrigWidth: number = 0;
  private resizeOrigHeight: number = 0;

  /**
   * @constructor
   * @param {Grid} grid - The Grid instance that this ResizeHandler will interact with.
   * @param {HTMLCanvasElement} canvas - The HTML canvas element associated with the grid.
   */
  constructor(grid: Grid, canvas: HTMLCanvasElement) {
    this.grid = grid;
    this.canvas = canvas;
    // Add event listeners for mouse interactions
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("mousemove", this.handleMouseDrag.bind(this));
  }

  /**
   * @private
   * @method handleMouseMove
   * @description Handles mouse movement over the canvas to change the cursor
   * when it hovers over a resizable column or row border in the header areas.
   * @param {MouseEvent} e - The mouse event object.
   */
  private handleMouseMove(e: MouseEvent): void {
    // If already resizing, do nothing
    if (this.resizingCol !== null || this.resizingRow !== null) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // Calculate virtual mouse coordinates considering scroll
    const virtualMouseX = mouseX + this.grid.scrollX;
    const virtualMouseY = mouseY + this.grid.scrollY;

    let colEdge: number | null = null;
    // Check for column edges in the visible viewport
    for (
      let c = this.grid.viewportStartCol;
      c <= this.grid.viewportEndCol + 1;
      c++
    ) {
      const borderX = this.grid.getColX(c);
      // If mouse is within 5 pixels of a column border
      if (Math.abs(virtualMouseX - borderX) < 5) {
        colEdge = c - 1; // Store the column index to resize (the one to the left of the border)
        break;
      }
    }

    let rowEdge: number | null = null;
    // Check for row edges in the visible viewport
    for (
      let r = this.grid.viewportStartRow;
      r <= this.grid.viewportEndRow + 1;
      r++
    ) {
      const borderY = this.grid.getRowY(r);
      // If mouse is within 5 pixels of a row border
      if (Math.abs(virtualMouseY - borderY) < 5) {
        rowEdge = r - 1; // Store the row index to resize (the one above the border)
        break;
      }
    }

    // Set cursor style based on detected resize handles
    if (colEdge !== null && mouseY < this.grid.headerHeight) {
      // Mouse is over a column header border
      this.canvas.style.cursor = "col-resize";
    } else if (rowEdge !== null && mouseX < this.grid.headerWidth) {
      // Mouse is over a row header border
      this.canvas.style.cursor = "row-resize";
    } else {
      this.canvas.style.cursor = ""; // Default cursor
    }
  }

  /**
   * @private
   * @method handleMouseDown
   * @description Handles mouse down events to initiate a column or row resize operation.
   * It determines which column/row border is being clicked and stores initial state.
   * @param {MouseEvent} e - The mouse event object.
   */
  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const virtualMouseX = mouseX + this.grid.scrollX;
    const virtualMouseY = mouseY + this.grid.scrollY;

    // Check if a column resize is initiated
    for (
      let c = this.grid.viewportStartCol;
      c <= this.grid.viewportEndCol + 1;
      c++
    ) {
      const borderX = this.grid.getColX(c);
      if (
        Math.abs(virtualMouseX - borderX) < 5 && // Close to a column border
        mouseY < this.grid.headerHeight // Within the column header area
      ) {
        this.resizingCol = c - 1; // Set the column to be resized
        this.resizeStartX = mouseX; // Store starting mouse X position
        this.resizeOrigWidth = this.grid.colWidths[this.resizingCol]; // Store original column width
        return; // Exit after finding a column to resize
      }
    }

    // Check if a row resize is initiated
    for (
      let r = this.grid.viewportStartRow;
      r <= this.grid.viewportEndRow + 1;
      r++
    ) {
      const borderY = this.grid.getRowY(r);
      if (
        Math.abs(virtualMouseY - borderY) < 5 && // Close to a row border
        mouseX < this.grid.headerWidth // Within the row header area
      ) {
        this.resizingRow = r - 1; // Set the row to be resized
        this.resizeStartY = mouseY; // Store starting mouse Y position
        this.resizeOrigHeight = this.grid.rowHeights[this.resizingRow]; // Store original row height
        return; // Exit after finding a row to resize
      }
    }
  }

  /**
   * @private
   * @method handleMouseDrag
   * @description Handles mouse drag events when a resize operation is active.
   * It updates the width of the resizing column or the height of the resizing row.
   * @param {MouseEvent} e - The mouse event object.
   */
  private handleMouseDrag(e: MouseEvent): void {
    if (this.resizingCol !== null) {
      // If a column is being resized
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      // Calculate new width, ensuring a minimum width of 24 pixels
      const newWidth = Math.max(
        24,
        this.resizeOrigWidth + (mouseX - this.resizeStartX)
      );
      this.grid.colWidths[this.resizingCol] = newWidth; // Update the column's width
      this.grid.requestRedraw(); // Request grid redraw to show the new dimensions
    } else if (this.resizingRow !== null) {
      // If a row is being resized
      const rect = this.canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      // Calculate new height, ensuring a minimum height of 12 pixels
      const newHeight = Math.max(
        12,
        this.resizeOrigHeight + (mouseY - this.resizeStartY)
      );
      this.grid.rowHeights[this.resizingRow] = newHeight; // Update the row's height
      this.grid.requestRedraw(); // Request grid redraw to show the new dimensions
    }
  }

  /**
   * @private
   * @method handleMouseUp
   * @description Handles mouse up events, ending the resize operation.
   * It updates the scrollbar content size after a resize.
   */
  private handleMouseUp(): void {
    // If a column or row was being resized
    if (this.resizingCol !== null || this.resizingRow !== null) {
      this.grid.updateScrollbarContentSize(); // Update scrollbar to reflect new grid dimensions
    }
    // Reset resizing state
    this.resizingCol = null;
    this.resizingRow = null;
  }
}
