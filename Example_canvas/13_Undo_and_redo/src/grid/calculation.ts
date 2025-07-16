import { Model } from "./model";

export class Calculator {
  private model: Model;
  private canvas: HTMLCanvasElement;
  private updateStatsTimeoutId: number | null = null;

  constructor(model: Model, canvas: HTMLCanvasElement) {
    this.model = model;
    this.canvas = canvas;
  }

  /**
   * Gets the device pixel ratio for high-resolution drawing.
   * @returns {number} The device pixel ratio.
   */
  public getDPR(): number {
    return window.devicePixelRatio || 1;
  }

  // Calculates the visible range of rows and columns based on the current scroll position and canvas size.
  public calculateViewport(): void {
    let currentY = 0;
    this.model.viewportStartRow = 1;
    for (let r = 1; r < this.model.rows; r++) {
      if (currentY >= this.model.scrollY) {
        this.model.viewportStartRow = r;
        break;
      }
      currentY += this.model.rowHeights[r];
    }

    const visibleHeight =
      this.canvas.height / this.getDPR() - this.model.headerHeight;
    let accumulatedHeight = 0;
    this.model.viewportEndRow = this.model.viewportStartRow;
    for (
      let r = this.model.viewportStartRow;
      r < this.model.rows && r < this.model.rowHeights.length;
      r++
    ) {
      if (accumulatedHeight > visibleHeight) {
        break;
      }
      accumulatedHeight += this.model.rowHeights[r];
      this.model.viewportEndRow = r;
    }

    // Calculate visible columns
    let currentX = 0;
    this.model.viewportStartCol = 1;
    for (let c = 1; c < this.model.cols; c++) {
      if (currentX >= this.model.scrollX) {
        this.model.viewportStartCol = c;
        break;
      }
      currentX += this.model.colWidths[c];
    }

    const visibleWidth =
      this.canvas.width / this.getDPR() - this.model.headerWidth;
    let accumulatedWidth = 0;
    this.model.viewportEndCol = this.model.viewportStartCol;
    for (
      let c = this.model.viewportStartCol;
      c < this.model.cols && c < this.model.colWidths.length;
      c++
    ) {
      if (accumulatedWidth > visibleWidth) {
        break;
      }
      accumulatedWidth += this.model.colWidths[c];
      this.model.viewportEndCol = c;
    }

    // // For debugging
    // document.getElementById(
    //   "visibleInfo"
    // )!.textContent = `Visible Rows: ${this.model.viewportStartRow}-${this.model.viewportEndRow}, Cols: ${this.model.viewportStartCol}-${this.model.viewportEndCol}`;
  }

  /**
   * Calculates the X-coordinate of the left edge of a given column.
   * @param {number} col - The column index.
   */
  public getColX(col: number): number {
    let x_pos = this.model.headerWidth;
    for (let i = 1; i < col; i++) {
      x_pos += this.model.colWidths[i];
    }
    return x_pos;
  }

  /**
   * Calculates the Y-coordinate of the top edge of a given row.
   * @param {number} row - The row index.
   */
  public getRowY(row: number): number {
    let y_pos = this.model.headerHeight;
    for (let i = 1; i < row; i++) {
      y_pos += this.model.rowHeights[i];
    }
    return y_pos;
  }

  /**
   * Determines the column index at a given X-coordinate.
   * @param {number} x - The X-coordinate.
   */
  public colAtX(x: number): number | null {
    let currentXPosition = this.model.headerWidth;
    for (let c = 1; c < this.model.cols; c++) {
      if (x < currentXPosition + this.model.colWidths[c]) {
        return c;
      }
      currentXPosition += this.model.colWidths[c];
    }
    return null;
  }

  /**
   * Determines the row index at a given Y-coordinate.
   * @param {number} y - The Y-coordinate.
   */
  public rowAtY(y: number): number | null {
    let currentYPosition = this.model.headerHeight;
    for (let r = 1; r < this.model.rows; r++) {
      if (y < currentYPosition + this.model.rowHeights[r]) {
        return r;
      }
      currentYPosition += this.model.rowHeights[r];
    }
    return null;
  }

  public updateStats(): void {
    if (this.updateStatsTimeoutId !== null) {
      clearTimeout(this.updateStatsTimeoutId);
    }

    this.updateStatsTimeoutId = window.setTimeout(() => {
      this.performStatsUpdate();
      this.updateStatsTimeoutId = null;
    }, 150);
  }

  private performStatsUpdate(): void {
    const statusBar = document.getElementById("statusBar");
    if (!statusBar) return;

    const startRow = this.model.selectionStartRow;
    const endRow = this.model.selectionEndRow;
    const startCol = this.model.selectionStartCol;
    const endCol = this.model.selectionEndCol;

    const hasSelection =
      startRow !== null &&
      endRow !== null &&
      startCol !== null &&
      endCol !== null;

    if (!hasSelection) {
      statusBar.style.display = "none";
      return;
    } else {
      statusBar.style.display = "block";
    }

    let totalCnt = 0;
    let cnt = 0;
    let sum = 0;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let hasNums = false;

    const minRow = Math.min(startRow!, endRow!);
    const maxRow = Math.max(startRow!, endRow!);
    const minCol = Math.min(startCol!, endCol!);
    const maxCol = Math.max(startCol!, endCol!);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const val = this.model.getCellValue(row, col);

        if (val !== "" && val !== null && val !== undefined) {
          totalCnt++;

          const numValue = parseFloat(val);
          const isValidNumber =
            !isNaN(numValue) &&
            isFinite(numValue) &&
            String(numValue) === String(val).trim();

          if (isValidNumber) {
            cnt++;
            sum += numValue;
            min = Math.min(min, numValue);
            max = Math.max(max, numValue);
            hasNums = true;
          }
        }
      }
    }

    const cnt1 = document.getElementById("statCount");
    const sum1 = document.getElementById("statSum");
    const avg1 = document.getElementById("statAverage");
    const min1 = document.getElementById("statMin");
    const max1 = document.getElementById("statMax");

    if (hasNums && cnt > 0) {
      const avg = sum / cnt;
      if (cnt1) cnt1.textContent = totalCnt.toLocaleString();
      if (sum1) sum1.textContent = sum.toLocaleString();
      if (avg1) avg1.textContent = avg.toLocaleString();
      if (min1) min1.textContent = min.toLocaleString();
      if (max1) max1.textContent = max.toLocaleString();
    } else {
      if (cnt1) cnt1.textContent = totalCnt.toLocaleString();
      if (sum1) sum1.textContent = "0";
      if (avg1) avg1.textContent = "0";
      if (min1) min1.textContent = "0";
      if (max1) max1.textContent = "0";
    }
  }
}
