export class CellNavigation {
    constructor(grid, inputHandler, touchHandler) {
        this.grid = grid;
        this.inputHandler = inputHandler;
        this.touchHandler = touchHandler;
    }
    /**
     * Handles keyboard events for navigation, cell editing (F2, Backspace, direct typing), and deleting cell content.
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    handleKeyDown(e) {
        if (this.touchHandler.isDragging()) {
            return;
        }
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
                if (e.shiftKey) {
                    nextRow = Math.max(1, this.grid.selectedRow - 1);
                }
                else {
                    nextRow = Math.min(this.grid.rows - 2, this.grid.selectedRow + 1);
                }
                shouldNavigate = true;
                break;
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
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
                e.preventDefault();
                return;
            case "Delete":
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
                this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, "");
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
                e.preventDefault();
                return;
        }
        if (shouldNavigate) {
            e.preventDefault();
            if (e.shiftKey) {
                let currentEndRow = this.grid.selectionEndRow || this.grid.selectedRow;
                let currentEndCol = this.grid.selectionEndCol || this.grid.selectedCol;
                if (e.key === "ArrowRight") {
                    currentEndCol = Math.min(this.grid.cols - 1, currentEndCol + 1);
                }
                else if (e.key === "ArrowLeft") {
                    currentEndCol = Math.max(1, currentEndCol - 1);
                }
                else if (e.key === "ArrowDown") {
                    currentEndRow = Math.min(this.grid.rows - 1, currentEndRow + 1);
                }
                else if (e.key === "ArrowUp") {
                    currentEndRow = Math.max(1, currentEndRow - 1);
                }
                this.grid.selectionEndRow = currentEndRow;
                this.grid.selectionEndCol = currentEndCol;
            }
            else {
                this.grid.selectedRow = nextRow;
                this.grid.selectedCol = nextCol;
                this.grid.selectionStartRow = nextRow;
                this.grid.selectionStartCol = nextCol;
                this.grid.selectionEndRow = nextRow;
                this.grid.selectionEndCol = nextCol;
            }
            // Update UI and make sure the new cell is visible
            // document.getElementById(
            //   "selectedInfo"
            // )!.textContent = `R${nextRow}, C${nextCol}`;
            this.inputHandler.ensureCellVisible(this.grid.selectionEndRow, this.grid.selectionEndCol);
            this.grid.requestRedraw();
            return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, "");
            this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol, e.key);
        }
    }
}
