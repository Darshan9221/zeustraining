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
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, this.canvas.width, this.model.headerHeight);
    ctx.fillRect(0, 0, this.model.headerWidth, this.canvas.height);

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

    // A general "is interacting" flag that includes resizing.
    const isNotDragging = !(
      this.dragState.isDraggingSelection ||
      this.dragState.isDraggingRowHeader ||
      this.dragState.isDraggingColHeader ||
      this.dragState.isResizing
    );

    // Draw header highlights from selection range
    if (hasSelection) {
      ctx.fillStyle = "#a0d8b9";
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

    // Draw selection range fill
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

    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    for (
      let c = this.model.viewportStartCol;
      c <= this.model.viewportEndCol + 1;
      c++
    ) {
      const x = this.calculator.getColX(c) - this.model.scrollX;
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, this.canvas.height);
    }
    for (
      let r = this.model.viewportStartRow;
      r <= this.model.viewportEndRow + 1;
      r++
    ) {
      const y = this.calculator.getRowY(r) - this.model.scrollY;
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(this.canvas.width, y + 0.5);
    }
    ctx.stroke();

    // Draw the border around the entire selection range. This now happens even during a drag.
    if (hasSelection) {
      const rangeX = this.calculator.getColX(minCol) - this.model.scrollX;
      const rangeY = this.calculator.getRowY(minRow) - this.model.scrollY;
      const rangeEndGutterX =
        this.calculator.getColX(maxCol + 1) - this.model.scrollX;
      const rangeEndGutterY =
        this.calculator.getRowY(maxRow + 1) - this.model.scrollY;
      const rangeWidth = rangeEndGutterX - rangeX;
      const rangeHeight = rangeEndGutterY - rangeY;

      ctx.strokeStyle = "#107c41"; // Prominent green color
      ctx.lineWidth = 2; // Make it thick
      // Use strokeRect with offsets to ensure the border is drawn just inside the cells
      ctx.strokeRect(rangeX + 1, rangeY + 1, rangeWidth - 2, rangeHeight - 2);
    }

    // Always reset line width after drawing a thick border
    ctx.lineWidth = 1;

    // Draw cell data
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

    // Draw header text
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    for (
      let r = this.model.viewportStartRow;
      r <= this.model.viewportEndRow;
      r++
    ) {
      const screenY = this.calculator.getRowY(r) - this.model.scrollY;
      const isRowInRange = hasSelection && r >= minRow && r <= maxRow;
      ctx.fillStyle = isRowInRange ? "#0f703b" : "#666";
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
      ctx.fillStyle = isColInRange ? "#0f703b" : "#666";
      ctx.fillText(
        this.colToExcelLabel(c - 1),
        screenX + this.model.colWidths[c] / 2,
        this.model.headerHeight / 2
      );
    }

    // Draw top-left corner and its borders
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, this.model.headerWidth, this.model.headerHeight);
    ctx.beginPath();
    ctx.strokeStyle = "#ddd";
    ctx.moveTo(this.model.headerWidth + 0.5, 0);
    ctx.lineTo(this.model.headerWidth + 0.5, this.canvas.height);
    ctx.moveTo(0, this.model.headerHeight + 0.5);
    ctx.lineTo(this.canvas.width, this.model.headerHeight + 0.5);
    ctx.stroke();

    // This section draws the selection borders on the headers.
    if (hasSelection) {
      ctx.beginPath();
      ctx.strokeStyle = "#107c41";
      ctx.lineWidth = 1;
      // Bottom border for all selected and visible column headers
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
      // Right border for all selected and visible row headers
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

    // Draw the fill handle on the bottom-right of the active cell, only for single-cell selections.
    const isSingleCellSelection =
      this.model.selectionStartRow === this.model.selectionEndRow &&
      this.model.selectionStartCol === this.model.selectionEndCol;

    if (
      this.model.selectedRow !== null &&
      this.model.selectedCol !== null &&
      isNotDragging &&
      isSingleCellSelection // Only draw for single cell selections
    ) {
      const activeCellX =
        this.calculator.getColX(this.model.selectedCol) - this.model.scrollX;
      const activeCellY =
        this.calculator.getRowY(this.model.selectedRow) - this.model.scrollY;
      const cellWidth = this.model.colWidths[this.model.selectedCol];
      const cellHeight = this.model.rowHeights[this.model.selectedRow];

      const handleSize = 6;
      // Position the handle so it's centered on the bottom-right corner of the selection border.
      const handleX = activeCellX + cellWidth - handleSize / 2 - 1;
      const handleY = activeCellY + cellHeight - handleSize / 2 - 1;

      // Draw a small white background square first to make the handle pop.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(handleX - 1, handleY - 1, handleSize + 2, handleSize + 2);

      // Draw the green fill handle.
      ctx.fillStyle = "#107c41";
      ctx.fillRect(handleX, handleY, handleSize, handleSize);
    }
  }
}
