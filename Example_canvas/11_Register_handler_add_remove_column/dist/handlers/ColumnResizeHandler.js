/**
 * @class ColumnResizeHandler
 * @description Manages the resizing of columns in the grid.
 */
export class ColumnResizeHandler {
    constructor(grid) {
        this.resizingCol = null;
        this.resizeStartX = 0;
        this.resizeOrigWidth = 0;
        // To store the result of the last successful hit-test
        this.hitTestCol = null;
        this.grid = grid;
    }
    hitTest(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (mouseY >= this.grid.headerHeight) {
            this.hitTestCol = null;
            return false;
        }
        const resizeHandleWidth = 5;
        for (let c = this.grid.viewportStartCol; c <= this.grid.viewportEndCol + 1; c++) {
            const borderX = this.grid.getColX(c) - this.grid.scrollX;
            if (Math.abs(mouseX - borderX) < resizeHandleWidth) {
                this.hitTestCol = c - 1;
                return true;
            }
        }
        this.hitTestCol = null;
        return false;
    }
    handleMouseDown(e) {
        if (this.hitTestCol === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        this.resizingCol = this.hitTestCol;
        this.resizeStartX = mouseX;
        this.resizeOrigWidth = this.grid.colWidths[this.resizingCol];
    }
    handleMouseDrag(e) {
        if (this.resizingCol === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const newWidth = Math.max(24, this.resizeOrigWidth + (mouseX - this.resizeStartX));
        this.grid.colWidths[this.resizingCol] = newWidth;
        this.grid.requestRedraw();
    }
    handleMouseUp(e) {
        if (this.resizingCol === null)
            return;
        this.grid.updateScrollbarContentSize();
        const action = {
            col: this.resizingCol,
            from: this.resizeOrigWidth,
            to: this.grid.colWidths[this.resizingCol],
        };
        this.resizingCol = null;
        return action;
    }
}
