// export class Model {
//   public readonly rows: number;
//   public readonly cols: number;
//   public readonly headerWidth: number;
//   public readonly headerHeight: number;
//   public colWidths: number[];
//   public rowHeights: number[];
//   private cellData = new Map<string, any>();
//   public scrollX: number = 0;
//   public scrollY: number = 0;
//   public viewportStartRow: number = 0;
//   public viewportEndRow: number = 0;
//   public viewportStartCol: number = 0;
//   public viewportEndCol: number = 0;
//   public selectedRow: number | null = null;
//   public selectedCol: number | null = null;
//   public selectionStartRow: number | null = null;
//   public selectionStartCol: number | null = null;
//   public selectionEndRow: number | null = null;
//   public selectionEndCol: number | null = null;
//   constructor(rows: number, cols: number, cellW: number, cellH: number) {
//     this.rows = rows;
//     this.cols = cols;
//     this.headerWidth = cellW;
//     this.headerHeight = cellH;
//     this.colWidths = Array(cols).fill(cellW);
//     this.rowHeights = Array(rows).fill(cellH);
//   }
//   public setCellValue(row: number, col: number, value: any): void {
//     const key = `${row},${col}`;
//     if (value === "" || value === null || value === undefined) {
//       this.cellData.delete(key);
//     } else {
//       this.cellData.set(key, value);
//     }
//   }
//   public getCellValue(row: number, col: number): any {
//     return this.cellData.get(`${row},${col}`) || "";
//   }
//   public clearAllCells(): void {
//     this.cellData.clear();
//   }
//   /**
//    * Inserts a blank column at the given position, shifting all subsequent data to the right.
//    * @param {number} col - The column index where the new column should be inserted.
//    */
//   public insertColumn(col: number): void {
//     // Shift cell data to the right, starting from the second-to-last column
//     for (let r = 1; r < this.rows; r++) {
//       for (let c = this.cols - 2; c >= col; c--) {
//         const value = this.getCellValue(r, c);
//         this.setCellValue(r, c + 1, value);
//       }
//     }
//     // Clear the inserted column
//     for (let r = 1; r < this.rows; r++) {
//       this.setCellValue(r, col, "");
//     }
//     // Insert a new width into the widths array
//     const newColWidth = this.colWidths[col] || 80; // Use existing or default width
//     this.colWidths.splice(col, 0, newColWidth);
//   }
//   /**
//    * Removes a column at the given position, shifting all subsequent data to the left.
//    * @param {number} col - The column index to remove.
//    */
//   public removeColumn(col: number): void {
//     // Shift cell data to the left
//     for (let r = 1; r < this.rows; r++) {
//       for (let c = col; c < this.cols - 1; c++) {
//         const value = this.getCellValue(r, c + 1);
//         this.setCellValue(r, c, value);
//       }
//     }
//     // Remove the width from the widths array
//     this.colWidths.splice(col, 1);
//   }
//   /**
//    * Inserts a blank row at the given position, shifting all subsequent data down.
//    * @param {number} row - The row index where the new row should be inserted.
//    */
//   public insertRow(row: number): void {
//     // Shift cell data down, starting from the second-to-last row
//     for (let r = this.rows - 2; r >= row; r--) {
//       for (let c = 1; c < this.cols; c++) {
//         const value = this.getCellValue(r, c);
//         this.setCellValue(r + 1, c, value);
//       }
//     }
//     // Clear the inserted row
//     for (let c = 1; c < this.cols; c++) {
//       this.setCellValue(row, c, "");
//     }
//     const newRowHeight = this.rowHeights[row] || 24;
//     this.rowHeights.splice(row, 0, newRowHeight);
//   }
//   /**
//    * Removes a row at the given position, shifting all subsequent data up.
//    * @param {number} row - The row index to remove.
//    */
//   public removeRow(row: number): void {
//     // Shift cell data up
//     for (let r = row; r < this.rows - 1; r++) {
//       for (let c = 1; c < this.cols; c++) {
//         const value = this.getCellValue(r + 1, c);
//         this.setCellValue(r, c, value);
//       }
//     }
//     this.rowHeights.splice(row, 1);
//   }
// }
//Has a flaw of duplicates
// export class Model {
//   public readonly rows: number;
//   public readonly cols: number;
//   public readonly headerWidth: number;
//   public readonly headerHeight: number;
//   public colWidths: number[];
//   public rowHeights: number[];
//   private cellData = new Map<string, any>();
//   public scrollX: number = 0;
//   public scrollY: number = 0;
//   public viewportStartRow: number = 0;
//   public viewportEndRow: number = 0;
//   public viewportStartCol: number = 0;
//   public viewportEndCol: number = 0;
//   public selectedRow: number | null = null;
//   public selectedCol: number | null = null;
//   public selectionStartRow: number | null = null;
//   public selectionStartCol: number | null = null;
//   public selectionEndRow: number | null = null;
//   public selectionEndCol: number | null = null;
//   constructor(rows: number, cols: number, cellW: number, cellH: number) {
//     this.rows = rows;
//     this.cols = cols;
//     this.headerWidth = cellW;
//     this.headerHeight = cellH;
//     this.colWidths = Array(cols).fill(cellW);
//     this.rowHeights = Array(rows).fill(cellH);
//   }
//   public setCellValue(row: number, col: number, value: any): void {
//     const key = `${row},${col}`;
//     if (value === "" || value === null || value === undefined) {
//       this.cellData.delete(key);
//     } else {
//       this.cellData.set(key, value);
//     }
//   }
//   public getCellValue(row: number, col: number): any {
//     return this.cellData.get(`${row},${col}`) || "";
//   }
//   public clearAllCells(): void {
//     this.cellData.clear();
//   }
//   /**
//    * OPTIMIZED: Inserts a blank column by shifting only the cells that contain data.
//    * @param {number} col - The column index where the new column should be inserted.
//    */
//   public insertColumn(col: number): void {
//     const affectedCells: { r: number; c: number }[] = [];
//     // 1. Find all cells that need to be shifted.
//     for (const key of this.cellData.keys()) {
//       const [r_str, c_str] = key.split(",");
//       const r = parseInt(r_str, 10);
//       const c = parseInt(c_str, 10);
//       if (c >= col) {
//         affectedCells.push({ r, c });
//       }
//     }
//     // 2. Sort them in REVERSE order to prevent overwriting data.
//     affectedCells.sort((a, b) => b.c - a.c);
//     // 3. Shift the data.
//     for (const cell of affectedCells) {
//       const value = this.getCellValue(cell.r, cell.c);
//       this.setCellValue(cell.r, cell.c + 1, value);
//     }
//     // 4. Clear the original column (which now has duplicated data).
//     for (const cell of affectedCells) {
//       if (cell.c === col) {
//         this.setCellValue(cell.r, cell.c, "");
//       }
//     }
//     // Update column widths array
//     const newColWidth = this.colWidths[col] || 64;
//     this.colWidths.splice(col, 0, newColWidth);
//   }
//   /**
//    * OPTIMIZED: Removes a column by shifting only the cells that contain data.
//    * @param {number} col - The column index to remove.
//    */
//   public removeColumn(col: number): void {
//     const affectedCells: { r: number; c: number }[] = [];
//     // 1. Find all cells that need to be shifted or deleted.
//     for (const key of this.cellData.keys()) {
//       const [r_str, c_str] = key.split(",");
//       const r = parseInt(r_str, 10);
//       const c = parseInt(c_str, 10);
//       if (c >= col) {
//         affectedCells.push({ r, c });
//       }
//     }
//     // 2. Sort them in FORWARD order to prevent overwriting data.
//     affectedCells.sort((a, b) => a.c - b.c);
//     // 3. Delete the original column and shift the rest.
//     for (const cell of affectedCells) {
//       if (cell.c === col) {
//         this.setCellValue(cell.r, cell.c, ""); // Delete data in the removed column
//       } else {
//         const value = this.getCellValue(cell.r, cell.c);
//         this.setCellValue(cell.r, cell.c - 1, value);
//         this.setCellValue(cell.r, cell.c, ""); // Clear the old cell
//       }
//     }
//     this.colWidths.splice(col, 1);
//   }
//   /**
//    * OPTIMIZED: Inserts a blank row by shifting only the cells that contain data.
//    * @param {number} row - The row index where the new row should be inserted.
//    */
//   public insertRow(row: number): void {
//     const affectedCells: { r: number; c: number }[] = [];
//     for (const key of this.cellData.keys()) {
//       const [r_str, c_str] = key.split(",");
//       const r = parseInt(r_str, 10);
//       const c = parseInt(c_str, 10);
//       if (r >= row) {
//         affectedCells.push({ r, c });
//       }
//     }
//     affectedCells.sort((a, b) => b.r - a.r); // Sort in REVERSE row order
//     for (const cell of affectedCells) {
//       const value = this.getCellValue(cell.r, cell.c);
//       this.setCellValue(cell.r + 1, cell.c, value);
//     }
//     for (const cell of affectedCells) {
//       if (cell.r === row) {
//         this.setCellValue(cell.r, cell.c, "");
//       }
//     }
//     const newRowHeight = this.rowHeights[row] || 20;
//     this.rowHeights.splice(row, 0, newRowHeight);
//   }
//   /**
//    * OPTIMIZED: Removes a row by shifting only the cells that contain data.
//    * @param {number} row - The row index to remove.
//    */
//   public removeRow(row: number): void {
//     const affectedCells: { r: number; c: number }[] = [];
//     for (const key of this.cellData.keys()) {
//       const [r_str, c_str] = key.split(",");
//       const r = parseInt(r_str, 10);
//       const c = parseInt(c_str, 10);
//       if (r >= row) {
//         affectedCells.push({ r, c });
//       }
//     }
//     affectedCells.sort((a, b) => a.r - b.r); // Sort in FORWARD row order
//     for (const cell of affectedCells) {
//       if (cell.r === row) {
//         this.setCellValue(cell.r, cell.c, "");
//       } else {
//         const value = this.getCellValue(cell.r, cell.c);
//         this.setCellValue(cell.r - 1, cell.c, value);
//         this.setCellValue(cell.r, cell.c, "");
//       }
//     }
//     this.rowHeights.splice(row, 1);
//   }
// }
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
        this.colWidths = Array(cols).fill(cellW);
        this.rowHeights = Array(rows).fill(cellH);
    }
    setCellValue(row, col, value) {
        const key = `${row},${col}`;
        if (value === "" || value === null || value === undefined) {
            this.cellData.delete(key);
        }
        else {
            this.cellData.set(key, value);
        }
    }
    getCellValue(row, col) {
        return this.cellData.get(`${row},${col}`) || "";
    }
    clearAllCells() {
        this.cellData.clear();
    }
    /**
     * Inserts a blank column and shifts the selection if necessary.
     * @param {number} col - The column index where the new column should be inserted.
     */
    insertColumn(col) {
        const updates = new Map();
        const deletions = [];
        for (const [key, value] of this.cellData.entries()) {
            const [r_str, c_str] = key.split(",");
            const c = parseInt(c_str, 10);
            if (c >= col) {
                updates.set(`${parseInt(r_str, 10)},${c + 1}`, value);
                deletions.push(key);
            }
        }
        for (const key of deletions) {
            this.cellData.delete(key);
        }
        for (const [key, value] of updates.entries()) {
            this.cellData.set(key, value);
        }
        const newColWidth = this.colWidths[col] || 80;
        this.colWidths.splice(col, 0, newColWidth);
        if (this.selectedCol !== null && this.selectedCol >= col) {
            this.selectedCol++;
        }
        if (this.selectionStartCol !== null && this.selectionStartCol >= col) {
            this.selectionStartCol++;
        }
        if (this.selectionEndCol !== null && this.selectionEndCol >= col) {
            this.selectionEndCol++;
        }
    }
    /**
     * Removes a column and shifts the selection if necessary.
     * @param {number} col - The column index to remove.
     */
    removeColumn(col) {
        const updates = new Map();
        const deletions = [];
        for (const [key, value] of this.cellData.entries()) {
            const [r_str, c_str] = key.split(",");
            const c = parseInt(c_str, 10);
            if (c > col) {
                updates.set(`${parseInt(r_str, 10)},${c - 1}`, value);
                deletions.push(key);
            }
            else if (c === col) {
                deletions.push(key);
            }
        }
        for (const key of deletions) {
            this.cellData.delete(key);
        }
        for (const [key, value] of updates.entries()) {
            this.cellData.set(key, value);
        }
        this.colWidths.splice(col, 1);
        if (this.selectedCol !== null && this.selectedCol > col) {
            this.selectedCol--;
        }
        if (this.selectionStartCol !== null && this.selectionStartCol > col) {
            this.selectionStartCol--;
        }
        // If a selection range ends at or after the deleted column, it must shrink.
        if (this.selectionEndCol !== null && this.selectionEndCol >= col) {
            this.selectionEndCol--;
        }
    }
    /**
     * Inserts a blank row and shifts the selection if necessary.
     * @param {number} row - The row index where the new row should be inserted.
     */
    insertRow(row) {
        const updates = new Map();
        const deletions = [];
        for (const [key, value] of this.cellData.entries()) {
            const [r_str, c_str] = key.split(",");
            const r = parseInt(r_str, 10);
            if (r >= row) {
                updates.set(`${r + 1},${parseInt(c_str, 10)}`, value);
                deletions.push(key);
            }
        }
        for (const key of deletions) {
            this.cellData.delete(key);
        }
        for (const [key, value] of updates.entries()) {
            this.cellData.set(key, value);
        }
        const newRowHeight = this.rowHeights[row] || 24;
        this.rowHeights.splice(row, 0, newRowHeight);
        if (this.selectedRow !== null && this.selectedRow >= row) {
            this.selectedRow++;
        }
        if (this.selectionStartRow !== null && this.selectionStartRow >= row) {
            this.selectionStartRow++;
        }
        if (this.selectionEndRow !== null && this.selectionEndRow >= row) {
            this.selectionEndRow++;
        }
    }
    /**
     * Removes a row and shifts the selection if necessary.
     * @param {number} row - The row index to remove.
     */
    removeRow(row) {
        const updates = new Map();
        const deletions = [];
        for (const [key, value] of this.cellData.entries()) {
            const [r_str, c_str] = key.split(",");
            const r = parseInt(r_str, 10);
            if (r > row) {
                updates.set(`${r - 1},${parseInt(c_str, 10)}`, value);
                deletions.push(key);
            }
            else if (r === row) {
                deletions.push(key);
            }
        }
        for (const key of deletions) {
            this.cellData.delete(key);
        }
        for (const [key, value] of updates.entries()) {
            this.cellData.set(key, value);
        }
        this.rowHeights.splice(row, 1);
        if (this.selectedRow !== null && this.selectedRow > row) {
            this.selectedRow--;
        }
        if (this.selectionStartRow !== null && this.selectionStartRow > row) {
            this.selectionStartRow--;
        }
        // If a selection range ends at or after the deleted row, it must shrink.
        if (this.selectionEndRow !== null && this.selectionEndRow >= row) {
            this.selectionEndRow--;
        }
    }
}
