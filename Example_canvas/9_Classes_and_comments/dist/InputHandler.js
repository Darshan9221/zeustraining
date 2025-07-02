/**
 * Manages the floating <input> element for cell editing.
 */
export class InputHandler {
    /**
     * Initializes the InputHandler.
     * @param {Grid} grid The main Grid instance.
     */
    constructor(grid) {
        /** @type {HTMLInputElement | null} The currently active input element. */
        this.currentInput = null;
        /** @type {boolean} A flag to prevent the blur event from firing during keyboard navigation. */
        this.isNavigating = false;
        this.grid = grid;
    }
    /**
     * Creates and displays the input box over a specified cell.
     * @param {number} row The row index of the cell.
     * @param {number} col The column index of the cell.
     */
    showInputBox(row, col) {
        if (this.currentInput && this.currentInput.parentNode) {
            this.currentInput.parentNode.removeChild(this.currentInput);
        }
        if (row === 0 || col === 0)
            return;
        const screenX = this.grid.getColX(col) - this.grid.scrollX;
        const screenY = this.grid.getRowY(row) - this.grid.scrollY;
        const canvasRect = this.grid.canvas.getBoundingClientRect();
        if (screenX < this.grid.headerWidth ||
            screenY < this.grid.headerHeight ||
            screenX > canvasRect.width ||
            screenY > canvasRect.height) {
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
            if (this.isNavigating)
                return;
            this.grid.setCellValue(row, col, input.value);
            if (input.parentNode)
                input.parentNode.removeChild(input);
            this.currentInput = null;
            this.grid.drawGrid();
        });
        // *** THE FIX IS HERE: We no longer pass row/col to the handler. ***
        // It will now read the live state from the grid instance.
        input.addEventListener("keydown", (e) => this.handleInputKeyDown(e));
    }
    /**
     * Handles keyboard navigation within the input box (Arrow keys, Enter, Tab, Escape).
     * @param {KeyboardEvent} e The keyboard event.
     */
    handleInputKeyDown(e) {
        // *** THE FIX IS HERE: Read the current selection from the grid's state. ***
        // This prevents using stale values from a closure.
        const row = this.grid.selectedRow;
        const col = this.grid.selectedCol;
        if (row === null || col === null)
            return; // Should not happen, but a good safeguard
        let nextRow = row, nextCol = col, navigate = false;
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
                return;
        }
        if (navigate) {
            e.preventDefault();
            this.isNavigating = true;
            this.grid.setCellValue(row, col, this.currentInput.value);
            this.hideInput();
            this.grid.selectedRow = nextRow;
            this.grid.selectedCol = nextCol;
            this.ensureCellVisible(nextRow, nextCol);
            this.grid.drawGrid();
            document.getElementById("selectedInfo").textContent = `R${nextRow}, C${nextCol}`;
            setTimeout(() => {
                this.showInputBox(nextRow, nextCol);
                this.isNavigating = false;
            }, 0);
        }
    }
    /**
     * Updates the position of the input box, typically called during a scroll event.
     */
    updateInputPosition() {
        if (!this.currentInput ||
            this.grid.selectedRow === null ||
            this.grid.selectedCol === null)
            return;
        const screenX = this.grid.getColX(this.grid.selectedCol) - this.grid.scrollX;
        const screenY = this.grid.getRowY(this.grid.selectedRow) - this.grid.scrollY;
        const canvasRect = this.grid.canvas.getBoundingClientRect();
        this.currentInput.style.left = `${canvasRect.left + window.scrollX + 0.5 + screenX}px`;
        this.currentInput.style.top = `${canvasRect.top + window.scrollY + 0.5 + screenY}px`;
        this.currentInput.style.width = `${this.grid.colWidths[this.grid.selectedCol]}px`;
        this.currentInput.style.height = `${this.grid.rowHeights[this.grid.selectedRow]}px`;
    }
    /**
     * Safely removes the input box from the DOM.
     */
    hideInput() {
        if (this.currentInput && this.currentInput.parentNode) {
            this.currentInput.parentNode.removeChild(this.currentInput);
        }
        this.currentInput = null;
    }
    /**
     * Checks if the input box is currently active.
     * @returns {boolean} True if the input is active.
     */
    isActive() {
        return this.currentInput !== null;
    }
    /**
     * Scrolls the grid to ensure the specified cell is visible in the viewport.
     * @param {number} row The row index to make visible.
     * @param {number} col The column index to make visible.
     */
    ensureCellVisible(row, col) {
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        const cellLeft = this.grid.getColX(col) - this.grid.headerWidth;
        const cellTop = this.grid.getRowY(row) - this.grid.headerHeight;
        const cellRight = cellLeft + this.grid.colWidths[col];
        const cellBottom = cellTop + this.grid.rowHeights[row];
        const visibleWidth = this.grid.canvas.clientWidth - this.grid.headerWidth;
        const visibleHeight = this.grid.canvas.clientHeight - this.grid.headerHeight;
        if (cellLeft < this.grid.scrollX)
            hScrollbar.scrollLeft = cellLeft;
        else if (cellRight > this.grid.scrollX + visibleWidth)
            hScrollbar.scrollLeft = cellRight - visibleWidth;
        if (cellTop < this.grid.scrollY)
            vScrollbar.scrollTop = cellTop;
        else if (cellBottom > this.grid.scrollY + visibleHeight)
            vScrollbar.scrollTop = cellBottom - visibleHeight;
    }
}
