export class InputHandler {
    constructor(grid) {
        this.currentInput = null;
        this.isNavigating = false;
        this.grid = grid;
    }
    /**
     * show input box on the canvas
     * @param {number} row - row of  input cell
     * @param {number} col -col of input cell
     * @param {string} startingChar - initial characters clicked or not
     */
    showInputBox(row, col, startingChar) {
        if (this.currentInput) {
            this.commitAndHideInput();
        }
        if (row === 0 || col === 0)
            return;
        // find  the cell on the screen
        const screenX = this.grid.getColX(col) - this.grid.scrollX;
        const screenY = this.grid.getRowY(row) - this.grid.scrollY;
        const canvasRect = this.grid.canvas.getBoundingClientRect();
        //Off screen cell
        if (screenX < this.grid.headerWidth ||
            screenY < this.grid.headerHeight ||
            screenX > canvasRect.width ||
            screenY > canvasRect.height) {
            return;
        }
        const value = startingChar || this.grid.getCellValue(row, col);
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
        if (startingChar) {
            input.setSelectionRange(input.value.length, input.value.length);
        }
        else {
            input.select();
        }
        input.addEventListener("blur", () => {
            if (this.isNavigating)
                return;
            this.commitAndHideInput();
            this.grid.requestRedraw();
        });
        input.addEventListener("keydown", (e) => this.handleInputKeyDown(e));
    }
    /**
     *
     * @param {KeyboardEvent} e - input on key events
     * @returns
     */
    handleInputKeyDown(e) {
        const row = this.grid.selectedRow;
        const col = this.grid.selectedCol;
        if (row === null || col === null)
            return;
        let nextRow = row, nextCol = col, doNavigate = false;
        switch (e.key) {
            case "Enter":
                nextRow = e.shiftKey
                    ? Math.max(1, row - 1)
                    : Math.min(this.grid.rows - 1, row + 1);
                doNavigate = true;
                break;
            case "ArrowDown":
                nextRow = Math.min(this.grid.rows - 1, row + 1);
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
                    : Math.min(this.grid.cols - 1, col + 1);
                doNavigate = true;
                break;
            case "Escape":
                this.hideInput(false);
                this.grid.requestRedraw();
                return;
        }
        if (doNavigate) {
            e.preventDefault();
            e.stopPropagation();
            this.isNavigating = true;
            this.commitAndHideInput();
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
    updateInputPosition() {
        if (!this.currentInput ||
            this.grid.selectedRow === null ||
            this.grid.selectedCol === null)
            return;
        const screenX = this.grid.getColX(this.grid.selectedCol) - this.grid.scrollX;
        const screenY = this.grid.getRowY(this.grid.selectedRow) - this.grid.scrollY;
        const canvasRect = this.grid.canvas.getBoundingClientRect();
        this.currentInput.style.left = `${canvasRect.left + window.scrollX + screenX + 0.5}px`;
        this.currentInput.style.top = `${canvasRect.top + window.scrollY + screenY + 0.5}px`;
        this.currentInput.style.width = `${this.grid.colWidths[this.grid.selectedCol]}px`;
        this.currentInput.style.height = `${this.grid.rowHeights[this.grid.selectedRow]}px`;
    }
    commitAndHideInput() {
        if (this.currentInput &&
            this.grid.selectedRow !== null &&
            this.grid.selectedCol !== null) {
            this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, this.currentInput.value);
        }
        this.hideInput(true);
    }
    /**
     * @param {boolean} wasCommitted - remove input box while selection
     */
    hideInput(wasCommitted) {
        if (this.currentInput && this.currentInput.parentNode) {
            this.currentInput.parentNode.removeChild(this.currentInput);
        }
        this.currentInput = null;
    }
    isActive() {
        return this.currentInput !== null;
    }
    /**
     * Ensure cell is visible on scroll
     * @param {number} row - row of selected cell
     * @param {number} col - column of selected cell
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
        // Check horizontal scroll
        if (cellLeft < this.grid.scrollX) {
            hScrollbar.scrollLeft = cellLeft;
        }
        else if (cellRight > this.grid.scrollX + visibleWidth) {
            hScrollbar.scrollLeft = cellRight - visibleWidth;
        }
        // Check vertical scroll
        if (cellTop < this.grid.scrollY) {
            vScrollbar.scrollTop = cellTop;
        }
        else if (cellBottom > this.grid.scrollY + visibleHeight) {
            vScrollbar.scrollTop = cellBottom - visibleHeight;
        }
    }
}
