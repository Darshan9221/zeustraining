// src/Grid.ts

/**
 * Manages the core state and rendering of the spreadsheet grid.
 * Handles drawing, viewport calculation, scrolling, data, and selection.
 */
export class Grid {
  public readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public readonly rows: number;
  public readonly cols: number;
  public readonly headerWidth: number;
  public readonly headerHeight: number;
  public colWidths: number[];
  public rowHeights: number[];
  private cellData = new Map<string, any>();
  public scrollX: number = 0;
  public scrollY: number = 0;
  public viewportStartRow: number = 0;
  public viewportEndRow: number = 0;
  public viewportStartCol: number = 0;
  public viewportEndCol: number = 0;
  public selectedRow: number | null = null;
  public selectedCol: number | null = null;
  public highlightedRowHeader: number | null = null;
  public highlightedColHeader: number | null = null;

  /** @type {boolean} A flag to indicate if a redraw is required on the next frame. */
  private needsRedraw: boolean = false;

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

    // Start the render loop.
    this.renderLoop();
  }

  private getDPR(): number {
    return window.devicePixelRatio || 1;
  }

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
    this.requestRedraw();
  }

  public setCellValue(row: number, col: number, value: any): void {
    const key = `${row},${col}`;
    if (value === "" || value === null || value === undefined) {
      this.cellData.delete(key);
    } else {
      this.cellData.set(key, value);
    }
  }

  public getCellValue(row: number, col: number): any {
    return this.cellData.get(`${row},${col}`) || "";
  }

  public clearAllCells(): void {
    this.cellData.clear();
  }

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

  public getColX(col: number): number {
    let x = this.headerWidth;
    for (let c = 1; c < col; c++) x += this.colWidths[c];
    return x;
  }

  public getRowY(row: number): number {
    let y = this.headerHeight;
    for (let r = 1; r < row; r++) y += this.rowHeights[r];
    return y;
  }

  public colAtX(x: number): number | null {
    let px = this.headerWidth;
    for (let c = 1; c < this.cols; c++) {
      if (x < px + this.colWidths[c]) return c;
      px += this.colWidths[c];
    }
    return null;
  }

  public rowAtY(y: number): number | null {
    let py = this.headerHeight;
    for (let r = 1; r < this.rows; r++) {
      if (y < py + this.rowHeights[r]) return r;
      py += this.rowHeights[r];
    }
    return null;
  }

  private renderLoop(): void {
    requestAnimationFrame(this.renderLoop.bind(this));
    if (this.needsRedraw) {
      this.drawGrid();
      this.needsRedraw = false;
    }
  }

  public requestRedraw(): void {
    this.needsRedraw = true;
  }

  private drawGrid(): void {
    this.calculateViewport();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, this.canvas.width, this.headerHeight);
    ctx.fillRect(0, 0, this.headerWidth, this.canvas.height);
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
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
      const screenY = this.getRowY(r) - this.scrollY;
      ctx.fillStyle =
        this.highlightedRowHeader === r
          ? "#fff"
          : this.selectedRow === r
          ? "#0c8289"
          : "#666";
      ctx.fillText(
        r.toString(),
        this.headerWidth / 2,
        screenY + this.rowHeights[r] / 2
      );
    }
    for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
      const screenX = this.getColX(c) - this.scrollX;
      ctx.fillStyle =
        this.highlightedColHeader === c
          ? "#fff"
          : this.selectedCol === c
          ? "#0c8289"
          : "#666";
      ctx.fillText(
        this.colToExcelLabel(c - 1),
        screenX + this.colWidths[c] / 2,
        this.headerHeight / 2
      );
    }
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    ctx.moveTo(this.headerWidth + 0.5, 0);
    ctx.lineTo(this.headerWidth + 0.5, this.canvas.height);
    ctx.moveTo(0, this.headerHeight + 0.5);
    ctx.lineTo(this.canvas.width, this.headerHeight + 0.5);
    ctx.stroke();
    ctx.fillStyle = "#333";
    ctx.fillText("", this.headerWidth / 2, this.headerHeight / 2);
  }
}
