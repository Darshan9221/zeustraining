/**
 * @class RowResizeHandler
 * @description Manages the resizing of rows in the grid.
 */
export class RowResizeHandler {
    constructor(grid) {
        this.resizingRow = null;
        this.resizeStartY = 0;
        this.resizeOrigHeight = 0;
        this.hitTestRow = null;
        this.grid = grid;
    }
    hitTest(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (mouseX >= this.grid.headerWidth) {
            this.hitTestRow = null;
            return false;
        }
        const resizeHandleWidth = 5;
        for (let r = this.grid.viewportStartRow; r <= this.grid.viewportEndRow + 1; r++) {
            const borderY = this.grid.getRowY(r) - this.grid.scrollY;
            if (Math.abs(mouseY - borderY) < resizeHandleWidth) {
                this.hitTestRow = r - 1;
                return true;
            }
        }
        this.hitTestRow = null;
        return false;
    }
    handleMouseDown(e) {
        if (this.hitTestRow === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        this.resizingRow = this.hitTestRow;
        this.resizeStartY = mouseY;
        this.resizeOrigHeight = this.grid.rowHeights[this.resizingRow];
    }
    handleMouseDrag(e) {
        if (this.resizingRow === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const newHeight = Math.max(12, this.resizeOrigHeight + (mouseY - this.resizeStartY));
        this.grid.rowHeights[this.resizingRow] = newHeight;
        this.grid.requestRedraw();
    }
    handleMouseUp(e) {
        if (this.resizingRow === null)
            return;
        this.grid.updateScrollbarContentSize();
        const action = {
            row: this.resizingRow,
            from: this.resizeOrigHeight,
            to: this.grid.rowHeights[this.resizingRow],
        };
        this.resizingRow = null;
        return action;
    }
}
