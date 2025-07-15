/**
 * Command for editing the value of a single cell.
 */
export class EditCellCommand {
    constructor(row, col, fromValue, toValue) {
        this.row = row;
        this.col = col;
        this.fromValue = fromValue;
        this.toValue = toValue;
    }
    execute(grid) {
        grid.setCellValue(this.row, this.col, this.toValue);
    }
    undo(grid) {
        grid.setCellValue(this.row, this.col, this.fromValue);
    }
}
/**
 * Command for resizing a column.
 */
export class ResizeColCommand {
    constructor(col, fromWidth, toWidth) {
        this.col = col;
        this.fromWidth = fromWidth;
        this.toWidth = toWidth;
    }
    execute(grid) {
        grid.colWidths[this.col] = this.toWidth;
        grid.updateScrollbarContentSize();
    }
    undo(grid) {
        grid.colWidths[this.col] = this.fromWidth;
        grid.updateScrollbarContentSize();
    }
}
/**
 * Command for resizing a row.
 */
export class ResizeRowCommand {
    constructor(row, fromHeight, toHeight) {
        this.row = row;
        this.fromHeight = fromHeight;
        this.toHeight = toHeight;
    }
    execute(grid) {
        grid.rowHeights[this.row] = this.toHeight;
        grid.updateScrollbarContentSize();
    }
    undo(grid) {
        grid.rowHeights[this.row] = this.fromHeight;
        grid.updateScrollbarContentSize();
    }
}
