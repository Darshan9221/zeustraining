import { Model } from "./grid/model";
import { Calculator } from "./grid/calculation";
import { Renderer } from "./grid/renderer";
import { TouchHandler } from "./touchHandler";

export class Grid {
  public readonly canvas: HTMLCanvasElement;
  private model: Model;
  private calculator: Calculator;
  private renderer: Renderer;
  private touchHandler: TouchHandler | null = null;

  private needsRedraw: boolean = false;

  public get rows(): number {
    return this.model.rows;
  }
  public get cols(): number {
    return this.model.cols;
  }
  public get headerWidth(): number {
    return this.model.headerWidth;
  }
  public get headerHeight(): number {
    return this.model.headerHeight;
  }
  public get colWidths(): number[] {
    return this.model.colWidths;
  }
  public get rowHeights(): number[] {
    return this.model.rowHeights;
  }
  public get scrollX(): number {
    return this.model.scrollX;
  }
  public set scrollX(value: number) {
    this.model.scrollX = value;
  }
  public get scrollY(): number {
    return this.model.scrollY;
  }
  public set scrollY(value: number) {
    this.model.scrollY = value;
  }
  public get viewportStartCol(): number {
    return this.model.viewportStartCol;
  }
  public get viewportEndCol(): number {
    return this.model.viewportEndCol;
  }
  public get viewportStartRow(): number {
    return this.model.viewportStartRow;
  }
  public get viewportEndRow(): number {
    return this.model.viewportEndRow;
  }
  public get selectedRow(): number | null {
    return this.model.selectedRow;
  }
  public set selectedRow(value: number | null) {
    this.model.selectedRow = value;
  }
  public get selectedCol(): number | null {
    return this.model.selectedCol;
  }
  public set selectedCol(value: number | null) {
    this.model.selectedCol = value;
  }
  public get selectionStartRow(): number | null {
    return this.model.selectionStartRow;
  }
  public set selectionStartRow(value: number | null) {
    this.model.selectionStartRow = value;
  }
  public get selectionStartCol(): number | null {
    return this.model.selectionStartCol;
  }
  public set selectionStartCol(value: number | null) {
    this.model.selectionStartCol = value;
  }
  public get selectionEndRow(): number | null {
    return this.model.selectionEndRow;
  }
  public set selectionEndRow(value: number | null) {
    this.model.selectionEndRow = value;
  }
  public get selectionEndCol(): number | null {
    return this.model.selectionEndCol;
  }
  public set selectionEndCol(value: number | null) {
    this.model.selectionEndCol = value;
  }

  constructor(
    canvas: HTMLCanvasElement,
    rows: number,
    cols: number,
    defaultCellW: number,
    defaultCellH: number
  ) {
    this.canvas = canvas;

    // Create the main parts of the grid system
    this.model = new Model(rows, cols, defaultCellW, defaultCellH);
    this.calculator = new Calculator(this.model, this.canvas);
    this.renderer = new Renderer(
      this.model,
      this.calculator,
      this,
      this.canvas
    );

    this.renderLoop();
  }

  public setTouchHandler(handler: TouchHandler): void {
    this.touchHandler = handler;
  }

  public isDragging(): boolean {
    return this.touchHandler?.isDragging() || false;
  }

  public setCellValue(row: number, col: number, value: any): void {
    this.model.setCellValue(row, col, value);
  }

  public getCellValue(row: number, col: number): any {
    return this.model.getCellValue(row, col);
  }

  public clearAllCells(): void {
    this.model.clearAllCells();
  }

  // Pass-through methods to the calculator
  public getColX(col: number): number {
    return this.calculator.getColX(col);
  }
  public getRowY(row: number): number {
    return this.calculator.getRowY(row);
  }
  public colAtX(x: number): number | null {
    return this.calculator.colAtX(x);
  }
  public rowAtY(y: number): number | null {
    return this.calculator.rowAtY(y);
  }

  public updateScrollbarContentSize(): void {
    // TODO: optimize this, It runs after every resize.
    let totalW = 0;
    for (let i = 1; i < this.model.cols; i++) {
      totalW += this.model.colWidths[i];
    }
    document.getElementById("hScrollContent")!.style.width = totalW + "px";

    let totalH = 0;
    for (let i = 1; i < this.model.rows; i++) {
      totalH += this.model.rowHeights[i];
    }
    document.getElementById("vScrollContent")!.style.height = totalH + "px";
  }

  /**
   * Grid behaviour on resizing the canvas
   * @returns {void} nothing
   */
  public resizeCanvas(): void {
    const container = this.canvas.parentElement!;
    const dpr = this.calculator.getDPR();
    this.canvas.width = (container.clientWidth - 20) * dpr;
    this.canvas.height = (container.clientHeight - 20) * dpr;

    this.canvas.style.width = container.clientWidth - 20 + "px";
    this.canvas.style.height = container.clientHeight - 20 + "px";

    // Reset the transform and scale for the new DPR
    const ctx = this.canvas.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    this.updateScrollbarContentSize();
    this.requestRedraw();
  }

  private renderLoop(): void {
    requestAnimationFrame(this.renderLoop.bind(this));
    if (this.needsRedraw) {
      this.renderer.drawGrid();
      this.needsRedraw = false;
    }
  }

  public requestRedraw(): void {
    this.needsRedraw = true;
    // Update statistics whenever redraw is requested (which happens on selection changes)
    this.calculator.updateSelectionStats();
  }
}
