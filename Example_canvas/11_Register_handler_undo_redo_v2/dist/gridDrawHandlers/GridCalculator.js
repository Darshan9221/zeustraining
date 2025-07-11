export class GridCalculator {
    constructor(model, canvas) {
        this.model = model;
        this.canvas = canvas;
    }
    /**
     * Gets the device pixel ratio for high-resolution drawing.
     * @returns {number} The device pixel ratio.
     */
    getDPR() {
        // For high-res screens
        return window.devicePixelRatio || 1;
    }
    // Calculates the visible range of rows and columns based on the current scroll position and canvas size.
    calculateViewport() {
        // Calculate visible rows
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
            // Allow partial cells at the end of the viewport
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
            // Allow partial cells at the end of the viewport
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
        return null; // Clicked outside the columns
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
        return null; // Clicked outside the rows
    }
}
