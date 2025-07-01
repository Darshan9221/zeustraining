// src/Grid.ts

/**
 * Manages the core state and rendering of the spreadsheet grid.
 * Handles drawing, viewport calculation, scrolling, data, and selection.
 */
export class Grid {
  /** @type {HTMLCanvasElement} The main canvas element for the grid. */
  public readonly canvas: HTMLCanvasElement;
  /** @type {CanvasRenderingContext2D} The 2D rendering context of the canvas. */
  private ctx: CanvasRenderingContext2D;

  // --- Grid Dimensions & Properties ---
  /** @type {number} Total number of rows in the virtual grid. */
  public readonly rows: number;
  /** @type {number} Total number of columns in the virtual grid. */
  public readonly cols: number;
  /** @type {number} The width of the row header column. */
  public readonly headerWidth: number = 64;
  /** @type {number} The height of the column header row. */
  public readonly headerHeight: number = 20;

  // --- Data Storage ---
  /** @type {Array<number>} An array holding the width of each column. */
  public colWidths: number[];
  /** @type {Array<number>} An array holding the height of each row. */
  public rowHeights: number[];
  /** @type {Map<string, any>} A sparse map for storing cell data. The key is "row,col". */
  private cellData = new Map<string, any>();

  // --- State Variables ---
  /** @type {number} The current horizontal scroll position in pixels. */
  public scrollX: number = 0;
  /** @type {number} The current vertical scroll position in pixels. */
  public scrollY: number = 0;
  /** @type {number} The first visible row index in the current viewport. */
  public viewportStartRow: number = 0;
  /** @type {number} The last visible row index in the current viewport. */
  public viewportEndRow: number = 0;
  /** @type {number} The first visible column index in the current viewport. */
  public viewportStartCol: number = 0;
  /** @type {number} The last visible column index in the current viewport. */
  public viewportEndCol: number = 0;

  // --- Selection State ---
  /** @type {number | null} The currently selected row's index. */
  public selectedRow: number | null = null;
  /** @type {number | null} The currently selected column's index. */
  public selectedCol: number | null = null;
  /** @type {number | null} The currently highlighted row header's index. */
  public highlightedRowHeader: number | null = null;
  /** @type {number | null} The currently highlighted column header's index. */
  public highlightedColHeader: number | null = null;

  /**
   * Initializes the Grid object.
   * @param {HTMLCanvasElement} canvas The canvas element to draw on.
   * @param {number} rows The total number of rows.
   * @param {number} cols The total number of columns.
   * @param {number} defaultCellWidth The initial width for all cells.
   * @param {number} defaultCellHeight The initial height for all cells.
   */
  constructor(
    canvas: HTMLCanvasElement,
    rows: number,
    cols: number,
    defaultCellWidth: number,
    defaultCellHeight: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.rows = rows;
    this.cols = cols;
    this.headerWidth = defaultCellWidth;
    this.headerHeight = defaultCellHeight;

    this.colWidths = Array(cols).fill(defaultCellWidth);
    this.rowHeights = Array(rows).fill(defaultCellHeight);

    this.resizeCanvas();
  }

  /**
   * Gets the device pixel ratio for high-DPI rendering.
   * @returns {number} The device pixel ratio.
   */
  private getDPR(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * Recalculates the total virtual size of the grid and updates the scrollbar elements.
   */
  public updateScrollbarContentSize(): void {
    let totalGridWidth = 0;
    for (let i = 1; i < this.cols; i++) {
      totalGridWidth += this.colWidths[i];
    }
    document.getElementById("hScrollContent")!.style.width =
      totalGridWidth + "px";

    let totalGridHeight = 0;
    for (let i = 1; i < this.rows; i++) {
      totalGridHeight += this.rowHeights[i];
    }
    document.getElementById("vScrollContent")!.style.height =
      totalGridHeight + "px";
  }

  /**
   * Resizes the canvas to fit its container and adjusts for device pixel ratio.
   */
  public resizeCanvas(): void {
    const container = this.canvas.parentElement!;
    const dpr = this.getDPR();
    this.canvas.width = (container.clientWidth - 20) * dpr;
    this.canvas.height = (container.clientHeight - 20) * dpr;
    this.canvas.style.width = container.clientWidth - 20 + "px";
    this.canvas.style.height = container.clientHeight - 20 + "px";
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.updateScrollbarContentSize();
    this.drawGrid();
  }

  /**
   * Sets the value for a specific cell in the sparse data map.
   * @param {number} row The row index.
   * @param {number} col The column index.
   * @param {any} value The value to set.
   */
  public setCellValue(row: number, col: number, value: any): void {
    const key = `${row},${col}`;
    if (value === "" || value === null || value === undefined) {
      this.cellData.delete(key);
    } else {
      this.cellData.set(key, value);
    }
  }

  /**
   * Gets the value of a specific cell.
   * @param {number} row The row index.
   * @param {number} col The column index.
   * @returns {any} The cell's value or an empty string.
   */
  public getCellValue(row: number, col: number): any {
    return this.cellData.get(`${row},${col}`) || "";
  }

  /**
   * Clears all data from the grid.
   */
  public clearAllCells(): void {
    this.cellData.clear();
  }

  /**
   * Calculates the visible range of rows and columns based on scroll position.
   */
  private calculateViewport(): void {
    let accY = 0;
    this.viewportStartRow = 1;
    for (let r = 1; r < this.rows; r++) {
      if (accY >= this.scrollY) {
        this.viewportStartRow = r;
        break;
      }
      accY += this.rowHeights[r];
    }

    const visibleH = this.canvas.height / this.getDPR() - this.headerHeight;
    let sumY = 0;
    this.viewportEndRow = this.viewportStartRow;
    for (let r = this.viewportStartRow; r < this.rows; r++) {
      if (r >= this.rowHeights.length) break;
      sumY += this.rowHeights[r];
      if (sumY > visibleH) break;
      this.viewportEndRow = r;
    }

    let accX = 0;
    this.viewportStartCol = 1;
    for (let c = 1; c < this.cols; c++) {
      if (accX >= this.scrollX) {
        this.viewportStartCol = c;
        break;
      }
      accX += this.colWidths[c];
    }

    const visibleW = this.canvas.width / this.getDPR() - this.headerWidth;
    let sumX = 0;
    this.viewportEndCol = this.viewportStartCol;
    for (let c = this.viewportStartCol; c < this.cols; c++) {
      if (c >= this.colWidths.length) break;
      sumX += this.colWidths[c];
      if (sumX > visibleW) break;
      this.viewportEndCol = c;
    }

    document.getElementById(
      "visibleInfo"
    )!.textContent = `${this.viewportStartRow}-${this.viewportEndRow}, ${this.viewportStartCol}-${this.viewportEndCol}`;
  }

  /**
   * Converts a 0-based column index to an Excel-style letter label (A, B, C...).
   * @param {number} col The 0-based column index.
   * @returns {string} The Excel-style label.
   */
  private colToExcelLabel(col: number): string {
    let label = "";
    col++;
    while (col > 0) {
      let rem = (col - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      col = Math.floor((col - 1) / 26);
    }
    return label;
  }

  /**
   * Gets the absolute X coordinate (left edge) of a given column in the virtual grid.
   * @param {number} col The column index.
   * @returns {number} The X coordinate.
   */
  public getColX(col: number): number {
    let x = this.headerWidth;
    for (let c = 1; c < col; c++) x += this.colWidths[c];
    return x;
  }

  /**
   * Gets the absolute Y coordinate (top edge) of a given row in the virtual grid.
   * @param {number} row The row index.
   * @returns {number} The Y coordinate.
   */
  public getRowY(row: number): number {
    let y = this.headerHeight;
    for (let r = 1; r < row; r++) y += this.rowHeights[r];
    return y;
  }

  /**
   * Finds the column index at a given virtual X coordinate.
   * @param {number} x The virtual X coordinate.
   * @returns {number | null} The column index or null.
   */
  public colAtX(x: number): number | null {
    let px = this.headerWidth;
    for (let c = 1; c < this.cols; c++) {
      if (x < px + this.colWidths[c]) return c;
      px += this.colWidths[c];
    }
    return null;
  }

  /**
   * Finds the row index at a given virtual Y coordinate.
   * @param {number} y The virtual Y coordinate.
   * @returns {number | null} The row index or null.
   */
  public rowAtY(y: number): number | null {
    let py = this.headerHeight;
    for (let r = 1; r < this.rows; r++) {
      if (y < py + this.rowHeights[r]) return r;
      py += this.rowHeights[r];
    }
    return null;
  }

  /**
   * The main drawing function. Renders the entire visible grid, including headers, lines, and data.
   */
  public drawGrid(): void {
    this.calculateViewport();
    const ctx = this.ctx;

    // Clear and draw header backgrounds
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, this.canvas.width, this.headerHeight);
    ctx.fillRect(0, 0, this.headerWidth, this.canvas.height);

    // Draw full row/col highlights
    if (this.highlightedRowHeader !== null) {
      ctx.fillStyle = "#e8f2ec";
      const y = this.getRowY(this.highlightedRowHeader) - this.scrollY;
      ctx.fillRect(
        this.headerWidth,
        y,
        this.canvas.width - this.headerWidth,
        this.rowHeights[this.highlightedRowHeader]
      );
      ctx.fillStyle = "#0f703b";
      ctx.fillRect(
        0,
        y,
        this.headerWidth,
        this.rowHeights[this.highlightedRowHeader]
      );
    }
    if (this.highlightedColHeader !== null) {
      ctx.fillStyle = "#e8f2ec";
      const x = this.getColX(this.highlightedColHeader) - this.scrollX;
      ctx.fillRect(
        x,
        this.headerHeight,
        this.colWidths[this.highlightedColHeader],
        this.canvas.height - this.headerHeight
      );
      ctx.fillStyle = "#0f703b";
      ctx.fillRect(
        x,
        0,
        this.colWidths[this.highlightedColHeader],
        this.headerHeight
      );
    }

    // Draw active cell highlights on headers
    if (this.selectedRow !== null && this.selectedCol !== null) {
      if (this.selectedCol > 0) {
        ctx.fillStyle = "#a0d8b9";
        ctx.fillRect(
          this.getColX(this.selectedCol) - this.scrollX,
          0,
          this.colWidths[this.selectedCol],
          this.headerHeight
        );
        ctx.beginPath();
        ctx.strokeStyle = "#107c41";
        ctx.moveTo(
          this.getColX(this.selectedCol) - this.scrollX + 0.5,
          this.headerHeight - 0.5
        );
        ctx.lineTo(
          this.getColX(this.selectedCol + 1) - this.scrollX + 0.5,
          this.headerHeight - 0.5
        );
        ctx.stroke();
      }
      if (this.selectedRow > 0) {
        ctx.fillStyle = "#a0d8b9";
        ctx.fillRect(
          0,
          this.getRowY(this.selectedRow) - this.scrollY,
          this.headerWidth,
          this.rowHeights[this.selectedRow]
        );
        ctx.beginPath();
        ctx.strokeStyle = "#107c41";
        ctx.moveTo(
          this.headerWidth - 0.5,
          this.getRowY(this.selectedRow) - this.scrollY + 0.5
        );
        ctx.lineTo(
          this.headerWidth - 0.5,
          this.getRowY(this.selectedRow + 1) - this.scrollY + 0.5
        );
        ctx.stroke();
      }
    }

    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    for (let c = this.viewportStartCol; c <= this.viewportEndCol + 1; c++) {
      const x = this.getColX(c) - this.scrollX;
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, this.canvas.height);
    }
    for (let r = this.viewportStartRow; r <= this.viewportEndRow + 1; r++) {
      const y = this.getRowY(r) - this.scrollY;
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(this.canvas.width, y + 0.5);
    }
    ctx.stroke();

    // Draw cell data
    ctx.font = "14px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
      for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
        const value = this.getCellValue(r, c);
        if (value) {
          const screenX = this.getColX(c) - this.scrollX;
          const screenY = this.getRowY(r) - this.scrollY;
          ctx.fillText(
            value,
            screenX + this.colWidths[c] / 2,
            screenY + this.rowHeights[r] / 2
          );
        }
      }
    }

    // Draw header text (Numbers and Letters)
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
      const screenY = this.getRowY(r) - this.scrollY;
      if (this.highlightedRowHeader === r) {
        ctx.fillStyle = "#fff";
      } else if (this.selectedRow === r) {
        ctx.fillStyle = "#0c8289";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(
        r.toString(),
        this.headerWidth / 2,
        screenY + this.rowHeights[r] / 2
      );
    }
    for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
      const screenX = this.getColX(c) - this.scrollX;
      if (this.highlightedColHeader === c) {
        ctx.fillStyle = "#fff";
      } else if (this.selectedCol === c) {
        ctx.fillStyle = "#0c8289";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(
        this.colToExcelLabel(c - 1),
        screenX + this.colWidths[c] / 2,
        this.headerHeight / 2
      );
    }

    // Draw corner cell background again to cover lines
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    ctx.moveTo(this.headerWidth + 0.5, 0);
    ctx.lineTo(this.headerWidth + 0.5, this.canvas.height);
    ctx.moveTo(0, this.headerHeight + 0.5);
    ctx.lineTo(this.canvas.width, this.headerHeight + 0.5);
    ctx.stroke();

    // Final corner text
    ctx.fillStyle = "#333";
    ctx.fillText("", this.headerWidth / 2, this.headerHeight / 2);
  }
}
