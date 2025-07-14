export class Model {
    constructor(rows, cols, cellW, cellH) {
        this.cellData = new Map();
        this.scrollX = 0;
        this.scrollY = 0;
        this.viewportStartRow = 0;
        this.viewportEndRow = 0;
        this.viewportStartCol = 0;
        this.viewportEndCol = 0;
        this.selectedRow = null;
        this.selectedCol = null;
        this.selectionStartRow = null;
        this.selectionStartCol = null;
        this.selectionEndRow = null;
        this.selectionEndCol = null;
        this.rows = rows;
        this.cols = cols;
        this.headerWidth = cellW;
        this.headerHeight = cellH;
        // create arrays to hold the widths and heights for every column and row
        this.colWidths = Array(cols).fill(cellW);
        this.rowHeights = Array(rows).fill(cellH);
    }
    /**
     * Sets the value of a cell at the specified row and column. If the value is empty, the cell data is removed.
     * @param {number} row - The row index of the cell.
     * @param {number} col - The column index of the cell.
     * @param {any} value - The value to set in the cell.
     */
    setCellValue(row, col, value) {
        const key = `${row},${col}`;
        if (value === "" || value === null || value === undefined) {
            this.cellData.delete(key);
        }
        else {
            this.cellData.set(key, value);
        }
    }
    /**
     * Gets the value of a cell at the given row and column.
     * @param {number} row - The row index of the cell.
     * @param {number} col - The column index of the cell.
     */
    getCellValue(row, col) {
        return this.cellData.get(`${row},${col}`) || "";
    }
    // Clears all data from the grid cells.
    clearAllCells() {
        this.cellData.clear();
    }
}
