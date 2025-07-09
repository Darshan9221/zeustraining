// src/Grid.ts
import { DragState } from "./main";
import { GridModel } from "./gridDrawHandlers/GridModel";
import { GridCalculator } from "./gridDrawHandlers/GridCalculator";
import { GridRenderer } from "./gridDrawHandlers/GridRenderer";

/**
 * The main Grid facade class.
 * It orchestrates the GridModel, GridCalculator, and GridRenderer
 * to provide a unified API to the rest of the application.
 */
export class Grid {
  public readonly canvas: HTMLCanvasElement;
  private model: GridModel;
  private calculator: GridCalculator;
  private renderer: GridRenderer;

  private needsRedraw: boolean = false;

  // Pass-through getters for convenience, so handlers don't need to know about the model
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
    defaultCellWidth: number,
    defaultCellHeight: number,
    dragState: DragState
  ) {
    this.canvas = canvas;
    this.model = new GridModel(rows, cols, defaultCellWidth, defaultCellHeight);
    this.calculator = new GridCalculator(this.model, this.canvas);
    this.renderer = new GridRenderer(
      this.model,
      this.calculator,
      this.canvas,
      dragState
    );

    this.renderLoop();
  }

  // --- Public API ---

  public setCellValue(row: number, col: number, value: any): void {
    this.model.setCellValue(row, col, value);
  }

  public getCellValue(row: number, col: number): any {
    return this.model.getCellValue(row, col);
  }

  public clearAllCells(): void {
    this.model.clearAllCells();
  }

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
    let totalGridWidth = 0;
    for (let i = 1; i < this.model.cols; i++) {
      totalGridWidth += this.model.colWidths[i];
    }
    document.getElementById("hScrollContent")!.style.width =
      totalGridWidth + "px";
    let totalGridHeight = 0;
    for (let i = 1; i < this.model.rows; i++) {
      totalGridHeight += this.model.rowHeights[i];
    }
    document.getElementById("vScrollContent")!.style.height =
      totalGridHeight + "px";
  }

  public resizeCanvas(): void {
    const container = this.canvas.parentElement!;
    const dpr = this.calculator.getDPR();
    this.canvas.width = (container.clientWidth - 20) * dpr;
    this.canvas.height = (container.clientHeight - 20) * dpr;
    this.canvas.style.width = container.clientWidth - 20 + "px";
    this.canvas.style.height = container.clientHeight - 20 + "px";
    this.canvas.getContext("2d")!.setTransform(1, 0, 0, 1, 0, 0);
    this.canvas.getContext("2d")!.scale(dpr, dpr);
    this.updateScrollbarContentSize();
    this.requestRedraw();
  }

  // --- Rendering Loop ---

  private renderLoop(): void {
    requestAnimationFrame(this.renderLoop.bind(this));
    if (this.needsRedraw) {
      this.renderer.drawGrid();
      this.needsRedraw = false;
    }
  }

  public requestRedraw(): void {
    this.needsRedraw = true;
  }
}
