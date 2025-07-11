import { Grid } from "./Grid";

export class InputHandler {
  private grid: Grid;
  private currentInput: HTMLInputElement | null = null;
  private isNavigating: boolean = false;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public showInputBox(row: number, col: number, startingChar?: string): void {
    // get rid of any old input box first
    if (this.currentInput) {
      this.commitAndHideInput();
    }

    // can't edit headers
    if (row === 0 || col === 0) return;

    // find where the cell is on the screen
    const screenX = this.grid.getColX(col) - this.grid.scrollX;
    const screenY = this.grid.getRowY(row) - this.grid.scrollY;
    const canvasRect = this.grid.canvas.getBoundingClientRect();

    // don't show the input if the cell is off-screen
    if (
      screenX < this.grid.headerWidth ||
      screenY < this.grid.headerHeight ||
      screenX > canvasRect.width ||
      screenY > canvasRect.height
    ) {
      return;
    }

    const value = startingChar || this.grid.getCellValue(row, col);

    const input = document.createElement("input");
    this.currentInput = input;
    input.type = "text";
    input.value = value;

    // Style the input box to look right
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

    if (startingChar) {
      // if we started by typing, put cursor at the end
      input.setSelectionRange(input.value.length, input.value.length);
    } else {
      // if we started with F2 or double-click, select all text
      input.select();
    }

    input.addEventListener("blur", () => {
      if (this.isNavigating) return; // don't commit if we're just tabbing away
      this.commitAndHideInput();
      this.grid.requestRedraw();
    });
    input.addEventListener("keydown", (e) => this.handleInputKeyDown(e));
  }

  private handleInputKeyDown(e: KeyboardEvent): void {
    const row = this.grid.selectedRow;
    const col = this.grid.selectedCol;
    if (row === null || col === null) return;

    let nextRow = row,
      nextCol = col,
      doNavigate = false;

    switch (e.key) {
      case "Enter":
        nextRow = e.shiftKey
          ? Math.max(1, row - 1)
          : Math.min(this.grid.rows - 2, row + 1);
        doNavigate = true;
        break;
      case "ArrowDown":
        nextRow = Math.min(this.grid.rows - 2, row + 1);
        doNavigate = true;
        break;
      case "ArrowUp":
        nextRow = Math.max(1, row - 1);
        doNavigate = true;
        break;
      case "Tab":
        e.preventDefault();
        nextCol = e.shiftKey
          ? Math.max(1, col - 1)
          : Math.min(this.grid.cols - 2, col + 1);
        doNavigate = true;
        break;
      case "Escape":
        this.hideInput(false); // hide without saving
        this.grid.requestRedraw();
        return;
    }

    if (doNavigate) {
      e.preventDefault();
      e.stopPropagation();
      this.isNavigating = true;

      this.commitAndHideInput(); // save changes

      // move selection
      this.grid.selectedRow = nextRow;
      this.grid.selectedCol = nextCol;
      this.grid.selectionStartRow = nextRow;
      this.grid.selectionStartCol = nextCol;
      this.grid.selectionEndRow = nextRow;
      this.grid.selectionEndCol = nextCol;

      this.ensureCellVisible(nextRow, nextCol);
      this.grid.requestRedraw();
      // document.getElementById(
      //   "selectedInfo"
      // )!.textContent = `R${nextRow}, C${nextCol}`;
      this.isNavigating = false;
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

  public commitAndHideInput(): void {
    if (
      this.currentInput &&
      this.grid.selectedRow !== null &&
      this.grid.selectedCol !== null
    ) {
      this.grid.setCellValue(
        this.grid.selectedRow,
        this.grid.selectedCol,
        this.currentInput.value
      );
    }
    this.hideInput(true);
  }

  public hideInput(wasCommitted: boolean): void {
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

    // Check horizontal scroll
    if (cellLeft < this.grid.scrollX) {
      hScrollbar.scrollLeft = cellLeft;
    } else if (cellRight > this.grid.scrollX + visibleWidth) {
      hScrollbar.scrollLeft = cellRight - visibleWidth;
    }
    // Check vertical scroll
    if (cellTop < this.grid.scrollY) {
      vScrollbar.scrollTop = cellTop;
    } else if (cellBottom > this.grid.scrollY + visibleHeight) {
      vScrollbar.scrollTop = cellBottom - visibleHeight;
    }
  }
}
