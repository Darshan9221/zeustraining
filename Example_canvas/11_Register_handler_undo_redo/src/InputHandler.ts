import { Grid } from "./Grid";

/**
 * @class InputHandler
 * @description Manages the input box for editing cell values within the grid.
 * It handles showing, hiding, positioning, and committing changes from the input field.
 */
export class InputHandler {
  private grid: Grid;
  private currentInput: HTMLInputElement | null = null;
  private isNavigating: boolean = false;

  /**
   * @constructor
   * @param {Grid} grid - The Grid instance that this InputHandler will interact with.
   */
  constructor(grid: Grid) {
    this.grid = grid;
  }

  /**
   * @public
   * @method showInputBox
   * @description Displays an input box over the specified cell, allowing the user to edit its content.
   * If an initial character is provided, it populates the input box with it.
   * @param {number} row - The row index of the cell to edit.
   * @param {number} col - The column index of the cell to edit.
   * @param {string} [initialChar] - An optional initial character to pre-fill the input box.
   */
  public showInputBox(row: number, col: number, initialChar?: string): void {
    // Remove any existing input box
    if (this.currentInput && this.currentInput.parentNode) {
      this.currentInput.parentNode.removeChild(this.currentInput);
    }
    // Do not show input box for header cells
    if (row === 0 || col === 0) return;

    // Calculate screen coordinates for the cell
    const screenX = this.grid.getColX(col) - this.grid.scrollX;
    const screenY = this.grid.getRowY(row) - this.grid.scrollY;
    const canvasRect = this.grid.canvas.getBoundingClientRect();

    // Do not show input box if the cell is outside the visible canvas area
    if (
      screenX < this.grid.headerWidth ||
      screenY < this.grid.headerHeight ||
      screenX > canvasRect.width ||
      screenY > canvasRect.height
    ) {
      return;
    }

    // Get the current value of the cell or use the initial character
    const value = initialChar || this.grid.getCellValue(row, col);

    // Create and style the input element
    const input = document.createElement("input");
    this.currentInput = input;
    input.type = "text";
    input.value = value;
    input.style.position = "absolute";
    // Position the input box accurately over the cell, accounting for scroll and canvas position
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
    document.body.appendChild(input); // Add input to the body
    input.focus(); // Focus the input field

    // Set caret position or select text based on initialChar presence
    if (initialChar) {
      input.setSelectionRange(input.value.length, input.value.length);
    } else {
      input.select();
    }

    // Add event listeners for blur and keydown
    input.addEventListener("blur", () => {
      // Prevent blur from committing if navigating with arrow keys/tab
      if (this.isNavigating) return;
      this.commitAndHideInput();
      this.grid.requestRedraw(); // Request redraw after input is hidden
    });
    input.addEventListener("keydown", (e) => this.handleInputKeyDown(e));
  }

  /**
   * @private
   * @method handleInputKeyDown
   * @description Handles keyboard events when the input box is active,
   * enabling navigation (Enter, Arrow keys, Tab) and committing/canceling input.
   * @param {KeyboardEvent} e - The keyboard event object.
   */
  private handleInputKeyDown(e: KeyboardEvent): void {
    const row = this.grid.selectedRow;
    const col = this.grid.selectedCol;
    if (row === null || col === null) return; // Ensure a cell is selected

    let nextRow = row,
      nextCol = col,
      navigate = false;

    switch (e.key) {
      case "Enter":
        // Move up or down based on Shift key
        if (e.shiftKey) {
          nextRow = Math.max(1, row - 1);
        } else {
          nextRow = Math.min(this.grid.rows - 2, row + 1);
        }
        navigate = true;
        break;
      case "ArrowDown":
        nextRow = Math.min(this.grid.rows - 2, row + 1);
        navigate = true;
        break;
      case "ArrowUp":
        nextRow = Math.max(1, row - 1);
        navigate = true;
        break;
      case "Tab":
        e.preventDefault(); // Prevent default tab behavior (focusing next element)
        // Move left or right based on Shift key
        if (e.shiftKey) {
          nextCol = Math.max(1, col - 1);
        } else {
          nextCol = Math.min(this.grid.cols - 2, col + 1);
        }
        navigate = true;
        break;
      case "Escape":
        // Hide input without committing changes
        this.hideInput(false);
        this.grid.requestRedraw();
        return;
    }

    if (navigate) {
      e.preventDefault(); // Prevent default browser actions for navigation keys
      e.stopPropagation(); // Stop event propagation to prevent main app's keydown listener from firing
      this.isNavigating = true; // Set flag to indicate navigation is occurring

      this.commitAndHideInput(); // Commit changes before navigating

      // Update selected cell and selection range in the grid
      this.grid.selectedRow = nextRow;
      this.grid.selectedCol = nextCol;
      this.grid.selectionStartRow = nextRow;
      this.grid.selectionStartCol = nextCol;
      this.grid.selectionEndRow = nextRow;
      this.grid.selectionEndCol = nextCol;

      this.ensureCellVisible(nextRow, nextCol); // Scroll to make the new selected cell visible
      this.grid.requestRedraw(); // Request grid redraw
      document.getElementById(
        "selectedInfo"
      )!.textContent = `R${nextRow}, C${nextCol}`; // Update selected cell info display

      this.isNavigating = false; // Reset navigation flag
    }
  }

  /**
   * @public
   * @method updateInputPosition
   * @description Updates the position and size of the input box to match the currently selected cell.
   * This is called during scrolling or resizing to keep the input box aligned.
   */
  public updateInputPosition(): void {
    // Only proceed if an input box is active and a cell is selected
    if (
      !this.currentInput ||
      this.grid.selectedRow === null ||
      this.grid.selectedCol === null
    )
      return;

    // Calculate new screen coordinates and dimensions
    const screenX =
      this.grid.getColX(this.grid.selectedCol) - this.grid.scrollX;
    const screenY =
      this.grid.getRowY(this.grid.selectedRow) - this.grid.scrollY;
    const canvasRect = this.grid.canvas.getBoundingClientRect();

    // Apply new styles to the input element
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

  /**
   * @public
   * @method commitAndHideInput
   * @description Commits the current value in the input box to the selected grid cell and then hides the input box.
   */
  public commitAndHideInput(): void {
    // Check if an input box is active and a cell is selected
    if (
      this.currentInput &&
      this.grid.selectedRow !== null &&
      this.grid.selectedCol !== null
    ) {
      // Set the cell's value to the input box's current value
      this.grid.setCellValue(
        this.grid.selectedRow,
        this.grid.selectedCol,
        this.currentInput.value
      );
    }
    this.hideInput(true); // Hide the input box, indicating it was committed
  }

  /**
   * @public
   * @method hideInput
   * @description Hides the input box.
   * @param {boolean} wasCommitted - A flag indicating whether the input's value was committed before hiding.
   */
  public hideInput(wasCommitted: boolean): void {
    if (this.currentInput && this.currentInput.parentNode) {
      this.currentInput.parentNode.removeChild(this.currentInput);
    }
    this.currentInput = null; // Clear the reference to the input box
  }

  /**
   * @public
   * @method isActive
   * @description Checks if the input box is currently active (visible).
   * @returns {boolean} True if the input box is active, false otherwise.
   */
  public isActive(): boolean {
    return this.currentInput !== null;
  }

  /**
   * @public
   * @method ensureCellVisible
   * @description Scrolls the grid horizontally and/or vertically to ensure that the specified cell is visible within the viewport.
   * @param {number} row - The row index of the cell to make visible.
   * @param {number} col - The column index of the cell to make visible.
   */
  public ensureCellVisible(row: number, col: number): void {
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;

    // Calculate the cell's position relative to the scrollable content
    const cellLeft = this.grid.getColX(col) - this.grid.headerWidth;
    const cellTop = this.grid.getRowY(row) - this.grid.headerHeight;
    const cellRight = cellLeft + this.grid.colWidths[col];
    const cellBottom = cellTop + this.grid.rowHeights[row];

    // Get the visible dimensions of the grid area (excluding headers)
    const visibleWidth = this.grid.canvas.clientWidth - this.grid.headerWidth;
    const visibleHeight =
      this.grid.canvas.clientHeight - this.grid.headerHeight;

    // Adjust horizontal scroll if the cell is out of view
    if (cellLeft < this.grid.scrollX) {
      hScrollbar.scrollLeft = cellLeft;
    } else if (cellRight > this.grid.scrollX + visibleWidth) {
      hScrollbar.scrollLeft = cellRight - visibleWidth;
    }

    // Adjust vertical scroll if the cell is out of view
    if (cellTop < this.grid.scrollY) {
      vScrollbar.scrollTop = cellTop;
    } else if (cellBottom > this.grid.scrollY + visibleHeight) {
      vScrollbar.scrollTop = cellBottom - visibleHeight;
    }
  }
}
