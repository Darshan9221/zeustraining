export class RowResize {
    constructor(grid) {
        this.resizingRow = null;
        this.resizeStartY = 0;
        this.resizeOriginalHeight = 0;
        this.hitTestRow = null;
        this.grid = grid;
    }
    hitTest(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouse_x = e.clientX - rect.left;
        const mouse_y = e.clientY - rect.top;
        if (mouse_x >= this.grid.headerWidth) {
            this.hitTestRow = null;
            return false;
        }
        const resizeHandleWidth = 5;
        for (let r = this.grid.viewportStartRow; r <= this.grid.viewportEndRow + 1; r++) {
            const borderY = this.grid.getRowY(r) - this.grid.scrollY;
            if (Math.abs(mouse_y - borderY) < resizeHandleWidth) {
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
        this.resizeOriginalHeight = this.grid.rowHeights[this.resizingRow];
    }
    handleMouseDrag(e) {
        if (this.resizingRow === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const dragDistance = mouseY - this.resizeStartY;
        const new_height = Math.max(12, this.resizeOriginalHeight + dragDistance);
        this.grid.rowHeights[this.resizingRow] = new_height;
        this.grid.requestRedraw();
    }
    handleMouseUp(e) {
        if (this.resizingRow === null)
            return;
        this.grid.updateScrollbarContentSize();
        const action = {
            row: this.resizingRow,
            from: this.resizeOriginalHeight,
            to: this.grid.rowHeights[this.resizingRow],
        };
        this.resizingRow = null;
        return action;
    }
}
