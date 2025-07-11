import { GridModel } from "./GridModel";

/**
 * Performs all coordinate and viewport calculations for the grid.
 * This class is stateless and provides utility functions based on the grid model.
 */
export class GridCalculator {
  private model: GridModel;
  private canvas: HTMLCanvasElement;

  constructor(model: GridModel, canvas: HTMLCanvasElement) {
    this.model = model;
    this.canvas = canvas;
  }

  /**
   * @private
   * @method getDPR
   * @description Gets the device pixel ratio for high-resolution rendering.
   * @returns {number} The device pixel ratio.
   */
  public getDPR(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * @public
   * @method calculateViewport
   * @description Calculates the visible range of rows and columns based on the current scroll position and canvas size.
   */
  public calculateViewport(): void {
    let accY = 0;
    this.model.viewportStartRow = 1;
    for (let r = 1; r < this.model.rows; r++) {
      if (accY >= this.model.scrollY) {
        this.model.viewportStartRow = r;
        break;
      }
      accY += this.model.rowHeights[r];
    }
    const visibleH =
      this.canvas.height / this.getDPR() - this.model.headerHeight;
    let sumY = 0;
    this.model.viewportEndRow = this.model.viewportStartRow;
    for (let r = this.model.viewportStartRow; r < this.model.rows; r++) {
      if (r >= this.model.rowHeights.length) break;
      // --- MODIFIED --- Only include rows that will fit fully on screen.
      // This ensures the bottom border of the last visible row is always rendered.
      if (sumY + this.model.rowHeights[r] > visibleH) break;
      sumY += this.model.rowHeights[r];
      this.model.viewportEndRow = r;
    }

    let accX = 0;
    this.model.viewportStartCol = 1;
    for (let c = 1; c < this.model.cols; c++) {
      if (accX >= this.model.scrollX) {
        this.model.viewportStartCol = c;
        break;
      }
      accX += this.model.colWidths[c];
    }
    const visibleW = this.canvas.width / this.getDPR() - this.model.headerWidth;
    let sumX = 0;
    this.model.viewportEndCol = this.model.viewportStartCol;
    for (let c = this.model.viewportStartCol; c < this.model.cols; c++) {
      if (c >= this.model.colWidths.length) break;
      // --- MODIFIED --- Only include columns that will fit fully on screen.
      // This ensures the right border of the last visible column is always rendered.
      if (sumX + this.model.colWidths[c] > visibleW) break;
      sumX += this.model.colWidths[c];
      this.model.viewportEndCol = c;
    }

    document.getElementById(
      "visibleInfo"
    )!.textContent = `${this.model.viewportStartRow}-${this.model.viewportEndRow}, ${this.model.viewportStartCol}-${this.model.viewportEndCol}`;
  }

  /**
   * @public
   * @method getColX
   * @description Calculates the X-coordinate of the left edge of a given column.
   * @param {number} col - The column index.
   * @returns {number} The X-coordinate.
   */
  public getColX(col: number): number {
    let x = this.model.headerWidth;
    for (let c = 1; c < col; c++) x += this.model.colWidths[c];
    return x;
  }

  /**
   * @public
   * @method getRowY
   * @description Calculates the Y-coordinate of the top edge of a given row.
   * @param {number} row - The row index.
   * @returns {number} The Y-coordinate.
   */
  public getRowY(row: number): number {
    let y = this.model.headerHeight;
    for (let r = 1; r < row; r++) y += this.model.rowHeights[r];
    return y;
  }

  /**
   * @public
   * @method colAtX
   * @description Determines the column index at a given X-coordinate.
   * @param {number} x - The X-coordinate.
   * @returns {number | null} The column index, or null if no column is found at that coordinate.
   */
  public colAtX(x: number): number | null {
    let px = this.model.headerWidth;
    for (let c = 1; c < this.model.cols; c++) {
      if (x < px + this.model.colWidths[c]) return c;
      px += this.model.colWidths[c];
    }
    return null;
  }

  /**
   * @public
   * @method rowAtY
   * @description Determines the row index at a given Y-coordinate.
   * @param {number} y - The Y-coordinate.
   * @returns {number | null} The row index, or null if no row is found at that coordinate.
   */
  public rowAtY(y: number): number | null {
    let py = this.model.headerHeight;
    for (let r = 1; r < this.model.rows; r++) {
      if (y < py + this.model.rowHeights[r]) return r;
      py += this.model.rowHeights[r];
    }
    return null;
  }
}
