export class CellNavigationHandler {
    constructor(grid, inputHandler, interactionHandler) {
        this.grid = grid;
        this.inputHandler = inputHandler;
        this.interactionHandler = interactionHandler;
    }
    /**
     * Handles keyboard events for navigation, cell editing (F2, Backspace, direct typing), and deleting cell content.
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    handleKeyDown(e) {
        // don't do anything if the user is dragging the mouse
        if (this.interactionHandler.isDragging()) {
            return;
        }
        // or if the text input box is already open
        if (this.inputHandler.isActive()) {
            return;
        }
        if (this.grid.selectedRow === null || this.grid.selectedCol === null)
            return;
        let nextRow = this.grid.selectedRow;
        let nextCol = this.grid.selectedCol;
        let shouldNavigate = false;
        switch (e.key) {
            case "Enter":
            case "ArrowDown":
                nextRow = Math.min(this.grid.rows - 2, this.grid.selectedRow + 1);
                shouldNavigate = true;
                break;
            case "ArrowUp":
                nextRow = Math.max(1, this.grid.selectedRow - 1);
                shouldNavigate = true;
                break;
            case "ArrowLeft":
                nextCol = Math.max(1, this.grid.selectedCol - 1);
                shouldNavigate = true;
                break;
            case "ArrowRight":
                nextCol = Math.min(this.grid.cols - 2, this.grid.selectedCol + 1);
                shouldNavigate = true;
                break;
            case "Tab":
                e.preventDefault(); // stop it from moving to the next browser element
                if (e.shiftKey) {
                    nextCol = Math.max(1, this.grid.selectedCol - 1); // shift-tab goes left
                }
                else {
                    nextCol = Math.min(this.grid.cols - 1, this.grid.selectedCol + 1); // tab goes right
                }
                shouldNavigate = true;
                break;
            case "F2":
                // open the text editor on the current cell
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
                e.preventDefault();
                return;
            case "Delete":
                // clear out all cells in the current selection
                if (this.grid.selectionStartRow !== null) {
                    const minRow = Math.min(this.grid.selectionStartRow, this.grid.selectionEndRow);
                    const maxRow = Math.max(this.grid.selectionStartRow, this.grid.selectionEndRow);
                    const minCol = Math.min(this.grid.selectionStartCol, this.grid.selectionEndCol);
                    const maxCol = Math.max(this.grid.selectionStartCol, this.grid.selectionEndCol);
                    for (let r_idx = minRow; r_idx <= maxRow; r_idx++) {
                        for (let c_idx = minCol; c_idx <= maxCol; c_idx++) {
                            this.grid.setCellValue(r_idx, c_idx, "");
                        }
                    }
                    this.grid.requestRedraw();
                }
                e.preventDefault();
                return;
            case "Backspace":
                // clear the current cell and start typing
                this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, "");
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
                e.preventDefault();
                return;
        }
        if (shouldNavigate) {
            e.preventDefault();
            if (e.shiftKey) {
                // The selection "anchor" (the start) stays put.
                // We just move the active cell and the end of the selection.
                this.grid.selectedRow = nextRow;
                this.grid.selectedCol = nextCol;
                this.grid.selectionEndRow = nextRow;
                this.grid.selectionEndCol = nextCol;
            }
            else {
                // --- If SHIFT is NOT pressed, we move the whole selection ---
                // The active cell, start, and end all move to the new spot.
                this.grid.selectedRow = nextRow;
                this.grid.selectedCol = nextCol;
                this.grid.selectionStartRow = nextRow;
                this.grid.selectionStartCol = nextCol;
                this.grid.selectionEndRow = nextRow;
                this.grid.selectionEndCol = nextCol;
            }
            // Update UI and make sure the new cell is visible
            document.getElementById("selectedInfo").textContent = `R${nextRow}, C${nextCol}`;
            this.inputHandler.ensureCellVisible(nextRow, nextCol);
            this.grid.requestRedraw();
            return;
        }
        // This handles starting to type directly into a cell
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            // clear the cell first, then show the input box with the typed character
            this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, "");
            this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol, e.key);
        }
    }
}
