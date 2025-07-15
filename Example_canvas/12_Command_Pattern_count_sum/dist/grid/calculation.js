export class Calculator {
    constructor(model, canvas) {
        this.updateStatsTimeoutId = null;
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
    updateStats() {
        if (this.updateStatsTimeoutId !== null) {
            clearTimeout(this.updateStatsTimeoutId);
        }
        this.updateStatsTimeoutId = window.setTimeout(() => {
            this.performStatsUpdate();
            this.updateStatsTimeoutId = null;
        }, 150);
    }
    performStatsUpdate() {
        const startRow = this.model.selectionStartRow;
        const endRow = this.model.selectionEndRow;
        const startCol = this.model.selectionStartCol;
        const endCol = this.model.selectionEndCol;
        let totalCnt = 0;
        let cnt = 0;
        let sum = 0;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        let hasNums = false;
        if (startRow !== null &&
            endRow !== null &&
            startCol !== null &&
            endCol !== null) {
            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);
            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    const val = this.model.getCellValue(row, col);
                    if (val !== "" && val !== null && val !== undefined) {
                        totalCnt++;
                        // Check if the cell value is a pure number (not mixed with text)
                        const numValue = parseFloat(val);
                        const isValidNumber = !isNaN(numValue) &&
                            isFinite(numValue) &&
                            String(numValue) === String(val).trim();
                        if (isValidNumber) {
                            cnt++;
                            sum += numValue;
                            min = Math.min(min, numValue);
                            max = Math.max(max, numValue);
                            hasNums = true;
                        }
                    }
                }
            }
        }
        const cnt1 = document.getElementById("statCount");
        const sum1 = document.getElementById("statSum");
        const avg1 = document.getElementById("statAverage");
        const min1 = document.getElementById("statMin");
        const max1 = document.getElementById("statMax");
        if (hasNums && cnt > 0) {
            const avg = sum / cnt;
            if (cnt1)
                cnt1.textContent = totalCnt.toString();
            if (sum1)
                sum1.textContent = sum.toString();
            if (avg1)
                avg1.textContent = avg.toString();
            if (min1)
                min1.textContent = min.toString();
            if (max1)
                max1.textContent = max.toString();
        }
        else {
            if (cnt1)
                cnt1.textContent = totalCnt.toString();
            if (sum1)
                sum1.textContent = "0";
            if (avg1)
                avg1.textContent = "0";
            if (min1)
                min1.textContent = "0";
            if (max1)
                max1.textContent = "0";
        }
    }
}
