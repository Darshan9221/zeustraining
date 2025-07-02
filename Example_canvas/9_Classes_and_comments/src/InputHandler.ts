// src/InputHandler.ts
import { Grid } from "./Grid";

export class InputHandler {
  private grid: Grid;
  private currentInput: HTMLInputElement | null = null;
  private isNavigating: boolean = false;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public showInputBox(row: number, col: number): void {
    if (this.currentInput && this.currentInput.parentNode) {
      this.currentInput.parentNode.removeChild(this.currentInput);
    }
    if (row === 0 || col === 0) return;
    const screenX = this.grid.getColX(col) - this.grid.scrollX;
    const screenY = this.grid.getRowY(row) - this.grid.scrollY;
    const canvasRect = this.grid.canvas.getBoundingClientRect();
    if (
      screenX < this.grid.headerWidth ||
      screenY < this.grid.headerHeight ||
      screenX > canvasRect.width ||
      screenY > canvasRect.height
    ) {
      return;
    }
    const value = this.grid.getCellValue(row, col);
    const input = document.createElement("input");
    this.currentInput = input;
    input.type = "text";
    input.value = value;
    input.style.position = "absolute";
    input.style.left = `${canvasRect.left + window.scrollX + 0.5 + screenX}px`;
    input.style.top = `${canvasRect.top + window.scrollY + 0.5 + screenY}px`;
    input.style.width = `${this.grid.colWidths[col]}px`;
    input.style.height = `${this.grid.rowHeights[row]}px`;
    input.style.fontSize = "14px";
    input.style.fontFamily = "Arial";
    input.style.paddingLeft = "4px";
    input.style.border = "2px solid #007acc";
    input.style.zIndex = "1000";
    input.style.outline = "none";
    input.style.boxSizing = "border-box";
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.addEventListener("blur", () => {
      if (this.isNavigating) return;
      this.grid.setCellValue(row, col, input.value);
      if (input.parentNode) input.parentNode.removeChild(input);
      this.currentInput = null;
      this.grid.requestRedraw(); // CHANGED
    });
    input.addEventListener("keydown", (e) => this.handleInputKeyDown(e));
  }

  private handleInputKeyDown(e: KeyboardEvent): void {
    const row = this.grid.selectedRow;
    const col = this.grid.selectedCol;
    if (row === null || col === null) return;
    let nextRow = row,
      nextCol = col,
      navigate = false;
    switch (e.key) {
      case "Enter":
      case "ArrowDown":
        nextRow = Math.min(this.grid.rows - 2, row + 1);
        navigate = true;
        break;
      case "ArrowUp":
        nextRow = Math.max(1, row - 1);
        navigate = true;
        break;
      case "ArrowLeft":
        nextCol = Math.max(1, col - 1);
        navigate = true;
        break;
      case "ArrowRight":
      case "Tab":
        nextCol = Math.min(this.grid.cols - 2, col + 1);
        navigate = true;
        break;
      case "Escape":
        this.hideInput();
        this.grid.requestRedraw();
        return;
    }
    if (navigate) {
      e.preventDefault();
      this.isNavigating = true;
      this.grid.setCellValue(row, col, this.currentInput!.value);
      this.hideInput();
      this.grid.selectedRow = nextRow;
      this.grid.selectedCol = nextCol;
      this.ensureCellVisible(nextRow, nextCol);
      this.grid.requestRedraw(); // CHANGED
      document.getElementById(
        "selectedInfo"
      )!.textContent = `R${nextRow}, C${nextCol}`;
      setTimeout(() => {
        this.showInputBox(nextRow, nextCol);
        this.isNavigating = false;
      }, 0);
    }
  }

  public updateInputPosition(): void {
    if (
      !this.currentInput ||
      this.grid.selectedRow === null ||
      this.grid.selectedCol === null
    )
      return;
    const screenX =
      this.grid.getColX(this.grid.selectedCol) - this.grid.scrollX;
    const screenY =
      this.grid.getRowY(this.grid.selectedRow) - this.grid.scrollY;
    const canvasRect = this.grid.canvas.getBoundingClientRect();
    this.currentInput.style.left = `${
      canvasRect.left + window.scrollX + screenX + 0.5
    }px`;
    this.currentInput.style.top = `${
      canvasRect.top + window.scrollY + screenY + 0.5
    }px`;
    this.currentInput.style.width = `${
      this.grid.colWidths[this.grid.selectedCol]
    }px`;
    this.currentInput.style.height = `${
      this.grid.rowHeights[this.grid.selectedRow]
    }px`;
  }

  public hideInput(): void {
    if (this.currentInput && this.currentInput.parentNode) {
      this.currentInput.parentNode.removeChild(this.currentInput);
    }
    this.currentInput = null;
  }

  public isActive(): boolean {
    return this.currentInput !== null;
  }

  public ensureCellVisible(row: number, col: number): void {
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;
    const cellLeft = this.grid.getColX(col) - this.grid.headerWidth;
    const cellTop = this.grid.getRowY(row) - this.grid.headerHeight;
    const cellRight = cellLeft + this.grid.colWidths[col];
    const cellBottom = cellTop + this.grid.rowHeights[row];
    const visibleWidth = this.grid.canvas.clientWidth - this.grid.headerWidth;
    const visibleHeight =
      this.grid.canvas.clientHeight - this.grid.headerHeight;
    if (cellLeft < this.grid.scrollX) hScrollbar.scrollLeft = cellLeft;
    else if (cellRight > this.grid.scrollX + visibleWidth)
      hScrollbar.scrollLeft = cellRight - visibleWidth;
    if (cellTop < this.grid.scrollY) vScrollbar.scrollTop = cellTop;
    else if (cellBottom > this.grid.scrollY + visibleHeight)
      vScrollbar.scrollTop = cellBottom - visibleHeight;
  }
}
