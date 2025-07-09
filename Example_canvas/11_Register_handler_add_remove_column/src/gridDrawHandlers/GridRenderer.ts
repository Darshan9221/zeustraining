// src/GridRenderer.ts
import { GridModel } from "./GridModel";
import { GridCalculator } from "./GridCalculator";
import { DragState } from "../main";

/**
 * Handles all rendering logic for the grid.
 * It uses a GridModel for data and a GridCalculator for positioning.
 */
export class GridRenderer {
  private model: GridModel;
  private calculator: GridCalculator;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dragState: DragState;

  constructor(
    model: GridModel,
    calculator: GridCalculator,
    canvas: HTMLCanvasElement,
    dragState: DragState
  ) {
    this.model = model;
    this.calculator = calculator;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.dragState = dragState;
  }

  /**
   * @private
   * @method colToExcelLabel
   * @description Converts a column index to its corresponding Excel-style alphabetical label (e.g., 0 -> A, 1 -> B, 26 -> AA).
   * @param {number} col - The zero-based column index.
   * @returns {string} The Excel-style column label.
   */
  private colToExcelLabel(col: number): string {
    let label = "";
    col++; // Adjust to 1-based index for Excel conversion
    while (col > 0) {
      let rem = (col - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      col = Math.floor((col - 1) / 26);
    }
    return label;
  }

  /**
   * @public
   * @method drawGrid
   * @description Draws the entire grid, including headers, cell data, selection, and grid lines.
   */
  public drawGrid(): void {
    this.calculator.calculateViewport();
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const hasSelection = this.model.selectionStartRow !== null;
    const minRow = hasSelection
      ? Math.min(this.model.selectionStartRow!, this.model.selectionEndRow!)
      : -1;
    const maxRow = hasSelection
      ? Math.max(this.model.selectionStartRow!, this.model.selectionEndRow!)
      : -1;
    const minCol = hasSelection
      ? Math.min(this.model.selectionStartCol!, this.model.selectionEndCol!)
      : -1;
    const maxCol = hasSelection
      ? Math.max(this.model.selectionStartCol!, this.model.selectionEndCol!)
      : -1;

    // --- MODIFIED --- Determine if the selection is for a full row or column.
    const isFullRowSelection =
      hasSelection && minCol === 1 && maxCol === this.model.cols - 1;
    const isFullColSelection =
      hasSelection && minRow === 1 && maxRow === this.model.rows - 1;

    const isNotDragging = !(
      this.dragState.isDraggingSelection ||
      this.dragState.isDraggingRowHeader ||
      this.dragState.isDraggingColHeader ||
      this.dragState.isResizing
    );

    // --- STEP 2: DRAW THE GRID CONTENT WITHIN A CLIPPED AREA ---
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      this.model.headerWidth,
      this.model.headerHeight,
      this.canvas.width - this.model.headerWidth,
      this.canvas.height - this.model.headerHeight
    );
    ctx.clip();

    if (hasSelection) {
      const selectionX = this.calculator.getColX(minCol) - this.model.scrollX;
      const selectionY = this.calculator.getRowY(minRow) - this.model.scrollY;
      const selectionEndGutterX =
        this.calculator.getColX(maxCol + 1) - this.model.scrollX;
      const selectionEndGutterY =
        this.calculator.getRowY(maxRow + 1) - this.model.scrollY;
      const selectionWidth = selectionEndGutterX - selectionX;
      const selectionHeight = selectionEndGutterY - selectionY;

      ctx.fillStyle = "#e8f2ec";
      ctx.fillRect(selectionX, selectionY, selectionWidth, selectionHeight);

      if (this.model.selectedRow !== null && this.model.selectedCol !== null) {
        ctx.fillStyle = "#ffffff";
        const activeCellX =
          this.calculator.getColX(this.model.selectedCol) - this.model.scrollX;
        const activeCellY =
          this.calculator.getRowY(this.model.selectedRow) - this.model.scrollY;
        ctx.fillRect(
          activeCellX,
          activeCellY,
          this.model.colWidths[this.model.selectedCol],
          this.model.rowHeights[this.model.selectedRow]
        );
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    for (
      let c = this.model.viewportStartCol;
      c <= this.model.viewportEndCol + 1;
      c++
    ) {
      const x = this.calculator.getColX(c) - this.model.scrollX;
      ctx.moveTo(x + 0.5, this.model.headerHeight);
      ctx.lineTo(x + 0.5, this.canvas.height);
    }
    for (
      let r = this.model.viewportStartRow;
      r <= this.model.viewportEndRow + 1;
      r++
    ) {
      const y = this.calculator.getRowY(r) - this.model.scrollY;
      ctx.moveTo(this.model.headerWidth, y + 0.5);
      ctx.lineTo(this.canvas.width, y + 0.5);
    }
    ctx.stroke();

    ctx.font = "14px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (
      let r = this.model.viewportStartRow;
      r <= this.model.viewportEndRow;
      r++
    ) {
      for (
        let c = this.model.viewportStartCol;
        c <= this.model.viewportEndCol;
        c++
      ) {
        const value = this.model.getCellValue(r, c);
        if (value) {
          const screenX = this.calculator.getColX(c) - this.model.scrollX;
          const screenY = this.calculator.getRowY(r) - this.model.scrollY;
          ctx.fillText(
            value,
            screenX + this.model.colWidths[c] / 2,
            screenY + this.model.rowHeights[r] / 2
          );
        }
      }
    }

    if (hasSelection) {
      const rangeX = this.calculator.getColX(minCol) - this.model.scrollX;
      const rangeY = this.calculator.getRowY(minRow) - this.model.scrollY;
      const rangeEndGutterX =
        this.calculator.getColX(maxCol + 1) - this.model.scrollX;
      const rangeEndGutterY =
        this.calculator.getRowY(maxRow + 1) - this.model.scrollY;
      const rangeWidth = rangeEndGutterX - rangeX;
      const rangeHeight = rangeEndGutterY - rangeY;
      ctx.strokeStyle = "#107c41";
      ctx.lineWidth = 2;
      ctx.strokeRect(rangeX + 1, rangeY + 1, rangeWidth - 2, rangeHeight - 2);
    }

    ctx.restore();

    // --- STEP 3: DRAW HEADERS AND OVERLAYS ON THE FULL CANVAS ---
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, this.canvas.width, this.model.headerHeight);
    ctx.fillRect(0, 0, this.model.headerWidth, this.canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    for (
      let c = this.model.viewportStartCol;
      c <= this.model.viewportEndCol;
      c++
    ) {
      const x = this.calculator.getColX(c) - this.model.scrollX;
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, this.model.headerHeight);
    }
    for (
      let r = this.model.viewportStartRow;
      r <= this.model.viewportEndRow;
      r++
    ) {
      const y = this.calculator.getRowY(r) - this.model.scrollY;
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(this.model.headerWidth, y + 0.5);
    }
    ctx.stroke();

    if (hasSelection) {
      // --- MODIFIED --- Use special dark green for full row/column selections.
      // Draw row header highlights
      ctx.fillStyle = isFullRowSelection ? "#0f703b" : "#a0d8b9";
      for (
        let r = Math.max(minRow, this.model.viewportStartRow);
        r <= Math.min(maxRow, this.model.viewportEndRow);
        r++
      ) {
        const screenY = this.calculator.getRowY(r) - this.model.scrollY;
        ctx.fillRect(
          0,
          screenY,
          this.model.headerWidth,
          this.model.rowHeights[r]
        );
      }

      // Draw column header highlights
      ctx.fillStyle = isFullColSelection ? "#0f703b" : "#a0d8b9";
      for (
        let c = Math.max(minCol, this.model.viewportStartCol);
        c <= Math.min(maxCol, this.model.viewportEndCol);
        c++
      ) {
        const screenX = this.calculator.getColX(c) - this.model.scrollX;
        ctx.fillRect(
          screenX,
          0,
          this.model.colWidths[c],
          this.model.headerHeight
        );
      }
    }

    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (
      let r = this.model.viewportStartRow;
      r <= this.model.viewportEndRow;
      r++
    ) {
      const screenY = this.calculator.getRowY(r) - this.model.scrollY;
      const isRowInRange = hasSelection && r >= minRow && r <= maxRow;
      // --- MODIFIED --- Use white text color for full row selections.
      if (isRowInRange) {
        ctx.fillStyle = isFullRowSelection ? "#ffffff" : "#0f703b";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(
        r.toString(),
        this.model.headerWidth / 2,
        screenY + this.model.rowHeights[r] / 2
      );
    }
    for (
      let c = this.model.viewportStartCol;
      c <= this.model.viewportEndCol;
      c++
    ) {
      const screenX = this.calculator.getColX(c) - this.model.scrollX;
      const isColInRange = hasSelection && c >= minCol && c <= maxCol;
      // --- MODIFIED --- Use white text color for full column selections.
      if (isColInRange) {
        ctx.fillStyle = isFullColSelection ? "#ffffff" : "#0f703b";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(
        this.colToExcelLabel(c - 1),
        screenX + this.model.colWidths[c] / 2,
        this.model.headerHeight / 2
      );
    }

    ctx.beginPath();
    ctx.strokeStyle = "#ccc";
    ctx.moveTo(this.model.headerWidth + 0.5, 0);
    ctx.lineTo(this.model.headerWidth + 0.5, this.canvas.height);
    ctx.moveTo(0, this.model.headerHeight + 0.5);
    ctx.lineTo(this.canvas.width, this.model.headerHeight + 0.5);
    ctx.stroke();

    if (hasSelection) {
      ctx.beginPath();
      ctx.strokeStyle = "#107c41";
      ctx.lineWidth = 1;
      for (
        let c = Math.max(minCol, this.model.viewportStartCol);
        c <= Math.min(maxCol, this.model.viewportEndCol);
        c++
      ) {
        const x = this.calculator.getColX(c) - this.model.scrollX;
        const w = this.model.colWidths[c];
        const y = this.model.headerHeight - 0.5;
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
      }
      for (
        let r = Math.max(minRow, this.model.viewportStartRow);
        r <= Math.min(maxRow, this.model.viewportEndRow);
        r++
      ) {
        const y = this.calculator.getRowY(r) - this.model.scrollY;
        const h = this.model.rowHeights[r];
        const x = this.model.headerWidth - 0.5;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
      }
      ctx.stroke();
    }

    const isSingleCellSelection =
      this.model.selectionStartRow === this.model.selectionEndRow &&
      this.model.selectionStartCol === this.model.selectionEndCol;

    if (
      this.model.selectedRow !== null &&
      this.model.selectedCol !== null &&
      isNotDragging &&
      isSingleCellSelection
    ) {
      const activeCellX =
        this.calculator.getColX(this.model.selectedCol) - this.model.scrollX;
      const activeCellY =
        this.calculator.getRowY(this.model.selectedRow) - this.model.scrollY;
      const cellWidth = this.model.colWidths[this.model.selectedCol];
      const cellHeight = this.model.rowHeights[this.model.selectedRow];

      const handleSize = 6;
      const handleX = activeCellX + cellWidth - handleSize / 2 - 1;
      const handleY = activeCellY + cellHeight - handleSize / 2 - 1;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(handleX - 1, handleY - 1, handleSize + 2, handleSize + 2);
      ctx.fillStyle = "#107c41";
      ctx.fillRect(handleX, handleY, handleSize, handleSize);
    }
  }
}
