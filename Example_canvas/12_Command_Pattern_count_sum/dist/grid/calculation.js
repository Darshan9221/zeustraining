export class Calculator {
    constructor(model, canvas) {
        this.model = model;
        this.canvas = canvas;
    }
    /**
     * Gets the device pixel ratio for high-resolution drawing.
     * @returns {number} The device pixel ratio.
     */
    getDPR() {
        return window.devicePixelRatio || 1;
    }
    // Calculates the visible range of rows and columns based on the current scroll position and canvas size.
    calculateViewport() {
        let currentY = 0;
        this.model.viewportStartRow = 1;
        for (let r = 1; r < this.model.rows; r++) {
            if (currentY >= this.model.scrollY) {
                this.model.viewportStartRow = r;
                break;
            }
            currentY += this.model.rowHeights[r];
        }
        const visibleHeight = this.canvas.height / this.getDPR() - this.model.headerHeight;
        let accumulatedHeight = 0;
        this.model.viewportEndRow = this.model.viewportStartRow;
        for (let r = this.model.viewportStartRow; r < this.model.rows && r < this.model.rowHeights.length; r++) {
            if (accumulatedHeight > visibleHeight) {
                break;
            }
            accumulatedHeight += this.model.rowHeights[r];
            this.model.viewportEndRow = r;
        }
        // Calculate visible columns
        let currentX = 0;
        this.model.viewportStartCol = 1;
        for (let c = 1; c < this.model.cols; c++) {
            if (currentX >= this.model.scrollX) {
                this.model.viewportStartCol = c;
                break;
            }
            currentX += this.model.colWidths[c];
        }
        const visibleWidth = this.canvas.width / this.getDPR() - this.model.headerWidth;
        let accumulatedWidth = 0;
        this.model.viewportEndCol = this.model.viewportStartCol;
        for (let c = this.model.viewportStartCol; c < this.model.cols && c < this.model.colWidths.length; c++) {
            if (accumulatedWidth > visibleWidth) {
                break;
            }
            accumulatedWidth += this.model.colWidths[c];
            this.model.viewportEndCol = c;
        }
        // // For debugging
        // document.getElementById(
        //   "visibleInfo"
        // )!.textContent = `Visible Rows: ${this.model.viewportStartRow}-${this.model.viewportEndRow}, Cols: ${this.model.viewportStartCol}-${this.model.viewportEndCol}`;
    }
    /**
     * Calculates the X-coordinate of the left edge of a given column.
     * @param {number} col - The column index.
     */
    getColX(col) {
        let x_pos = this.model.headerWidth;
        for (let i = 1; i < col; i++) {
            x_pos += this.model.colWidths[i];
        }
        return x_pos;
    }
    /**
     * Calculates the Y-coordinate of the top edge of a given row.
     * @param {number} row - The row index.
     */
    getRowY(row) {
        let y_pos = this.model.headerHeight;
        for (let i = 1; i < row; i++) {
            y_pos += this.model.rowHeights[i];
        }
        return y_pos;
    }
    /**
     * Determines the column index at a given X-coordinate.
     * @param {number} x - The X-coordinate.
     */
    colAtX(x) {
        let currentXPosition = this.model.headerWidth;
        for (let c = 1; c < this.model.cols; c++) {
            if (x < currentXPosition + this.model.colWidths[c]) {
                return c;
            }
            currentXPosition += this.model.colWidths[c];
        }
        return null;
    }
    /**
     * Determines the row index at a given Y-coordinate.
     * @param {number} y - The Y-coordinate.
     */
    rowAtY(y) {
        let currentYPosition = this.model.headerHeight;
        for (let r = 1; r < this.model.rows; r++) {
            if (y < currentYPosition + this.model.rowHeights[r]) {
                return r;
            }
            currentYPosition += this.model.rowHeights[r];
        }
        return null;
    }
    /**
     * Updates the statistics display for selected cells containing numeric values
     */
    updateSelectionStats() {
        // Get the current selection bounds
        const startRow = this.model.selectionStartRow;
        const endRow = this.model.selectionEndRow;
        const startCol = this.model.selectionStartCol;
        const endCol = this.model.selectionEndCol;
        // Reset statistics
        let count = 0;
        let sum = 0;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        let hasNumbers = false;
        // If there's a selection, calculate statistics
        if (startRow !== null &&
            endRow !== null &&
            startCol !== null &&
            endCol !== null) {
            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);
            // Iterate through all cells in the selection
            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    const cellValue = this.model.getCellValue(row, col);
                    // Check if the cell value is a number
                    if (cellValue !== "" &&
                        cellValue !== null &&
                        cellValue !== undefined) {
                        const numValue = parseFloat(cellValue);
                        count++;
                        if (!isNaN(numValue)) {
                            sum += numValue;
                            min = Math.min(min, numValue);
                            max = Math.max(max, numValue);
                            hasNumbers = true;
                        }
                    }
                }
            }
        }
        // Update the statistics display
        const countElement = document.getElementById("statCount");
        const sumElement = document.getElementById("statSum");
        const averageElement = document.getElementById("statAverage");
        const minElement = document.getElementById("statMin");
        const maxElement = document.getElementById("statMax");
        if (hasNumbers && count > 0) {
            const average = sum / count;
            if (countElement)
                countElement.textContent = count.toString();
            if (sumElement)
                sumElement.textContent = this.formatNumber(sum);
            if (averageElement)
                averageElement.textContent = this.formatNumber(average);
            if (minElement)
                minElement.textContent = this.formatNumber(min);
            if (maxElement)
                maxElement.textContent = this.formatNumber(max);
        }
        else {
            // No numeric values in selection
            if (countElement)
                countElement.textContent = "0";
            if (sumElement)
                sumElement.textContent = "0";
            if (averageElement)
                averageElement.textContent = "0";
            if (minElement)
                minElement.textContent = "0";
            if (maxElement)
                maxElement.textContent = "0";
        }
    }
    /**
     * Formats a number for display in statistics
     * @param {number} num - The number to format
     * @returns {string} Formatted number string
     */
    formatNumber(num) {
        // Handle very large or very small numbers
        if (Math.abs(num) >= 1000000 || (Math.abs(num) < 0.001 && num !== 0)) {
            return num.toExponential(2);
        }
        // Round to 2 decimal places for display
        return Math.round(num * 100) / 100 + "";
    }
}
