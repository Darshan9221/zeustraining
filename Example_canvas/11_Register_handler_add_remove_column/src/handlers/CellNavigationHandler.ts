// src/handlers/CellNavigationHandler.ts
import { Grid } from "../Grid";
import { InputHandler } from "../InputHandler";

/**
 * @class CellNavigationHandler
 * @description Manages all keyboard-driven cell navigation and cell content manipulation.
 */
export class CellNavigationHandler {
  private grid: Grid;
  private inputHandler: InputHandler;

  constructor(grid: Grid, inputHandler: InputHandler) {
    this.grid = grid;
    this.inputHandler = inputHandler;
  }

  /**
   * @public
   * @method handleKeyDown
   * @description Handles keyboard events for navigation, cell editing (F2, Backspace, direct typing), and deleting cell content.
   * @param {KeyboardEvent} e - The keyboard event object.
   */
  public handleKeyDown(e: KeyboardEvent): void {
    if (this.inputHandler.isActive()) return;
    if (this.grid.selectedRow === null || this.grid.selectedCol === null)
      return;

    let nextRow = this.grid.selectedRow;
    let nextCol = this.grid.selectedCol;
    let navigate = false;

    switch (e.key) {
      case "Enter":
      case "ArrowDown":
        nextRow = Math.min(this.grid.rows - 2, this.grid.selectedRow + 1);
        navigate = true;
        break;
      case "ArrowUp":
        nextRow = Math.max(1, this.grid.selectedRow - 1);
        navigate = true;
        break;
      case "ArrowLeft":
        nextCol = Math.max(1, this.grid.selectedCol - 1);
        navigate = true;
        break;
      case "ArrowRight":
        nextCol = Math.min(this.grid.cols - 2, this.grid.selectedCol + 1);
        navigate = true;
        break;
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          nextCol = Math.max(1, this.grid.selectedCol - 1);
        } else {
          nextCol = Math.min(this.grid.cols - 1, this.grid.selectedCol + 1);
        }
        navigate = true;
        break;
      case "F2":
        this.inputHandler.showInputBox(
          this.grid.selectedRow,
          this.grid.selectedCol
        );
        e.preventDefault();
        return;
      case "Delete":
        if (this.grid.selectionStartRow !== null) {
          const minRow = Math.min(
            this.grid.selectionStartRow,
            this.grid.selectionEndRow!
          );
          const maxRow = Math.max(
            this.grid.selectionStartRow,
            this.grid.selectionEndRow!
          );
          const minCol = Math.min(
            this.grid.selectionStartCol!,
            this.grid.selectionEndCol!
          );
          const maxCol = Math.max(
            this.grid.selectionStartCol!,
            this.grid.selectionEndCol!
          );
          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              this.grid.setCellValue(r, c, "");
            }
          }
          this.grid.requestRedraw();
        }
        e.preventDefault();
        return;
      case "Backspace":
        this.grid.setCellValue(
          this.grid.selectedRow,
          this.grid.selectedCol,
          ""
        );
        this.inputHandler.showInputBox(
          this.grid.selectedRow,
          this.grid.selectedCol
        );
        e.preventDefault();
        return;
    }

    if (navigate) {
      e.preventDefault();
      this.grid.selectedRow = nextRow;
      this.grid.selectedCol = nextCol;
      this.grid.selectionStartRow = nextRow;
      this.grid.selectionStartCol = nextCol;
      this.grid.selectionEndRow = nextRow;
      this.grid.selectionEndCol = nextCol;

      document.getElementById(
        "selectedInfo"
      )!.textContent = `R${nextRow}, C${nextCol}`;
      this.inputHandler.ensureCellVisible(nextRow, nextCol);
      this.grid.requestRedraw();
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, "");
      this.inputHandler.showInputBox(
        this.grid.selectedRow,
        this.grid.selectedCol,
        e.key
      );
    }
  }
}
