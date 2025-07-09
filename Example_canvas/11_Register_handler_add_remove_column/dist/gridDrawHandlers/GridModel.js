// src/GridModel.ts
/**
 * Manages the core state of the spreadsheet grid.
 * This class is the single source of truth for grid data and state,
 * but contains no rendering or calculation logic.
 */
export class GridModel {
    constructor(rows, cols, defaultCellWidth, defaultCellHeight) {
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
        this.headerWidth = defaultCellWidth;
        this.headerHeight = defaultCellHeight;
        this.colWidths = Array(cols).fill(defaultCellWidth);
        this.rowHeights = Array(rows).fill(defaultCellHeight);
    }
    /**
     * @public
     * @method setCellValue
     * @description Sets the value of a cell at the specified row and column. If the value is empty, the cell data is removed.
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
     * @public
     * @method getCellValue
     * @description Gets the value of a cell at the specified row and column.
     * @param {number} row - The row index of the cell.
     * @param {number} col - The column index of the cell.
     * @returns {any} The value of the cell, or an empty string if no value is found.
     */
    getCellValue(row, col) {
        return this.cellData.get(`${row},${col}`) || "";
    }
    /**
     * @public
     * @method clearAllCells
     * @description Clears all data from the grid cells.
     */
    clearAllCells() {
        this.cellData.clear();
    }
}
