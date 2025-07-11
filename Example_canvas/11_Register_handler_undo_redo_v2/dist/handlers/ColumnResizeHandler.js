export class ColumnResizeHandler {
    constructor(grid) {
        this.resizingCol = null;
        this.resizeStartX = 0;
        this.resizeOriginalWidth = 0; // Renamed
        // Store which column we're hovering over
        this.hitTestCol = null;
        this.grid = grid;
    }
    hitTest(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouse_x = e.clientX - rect.left;
        const mouse_y = e.clientY - rect.top;
        // We only care about the header area
        if (mouse_y >= this.grid.headerHeight) {
            this.hitTestCol = null;
            return false;
        }
        const resizeHandleWidth = 5; // how close to the border you have to be
        for (let c = this.grid.viewportStartCol; c <= this.grid.viewportEndCol + 1; c++) {
            const borderX = this.grid.getColX(c) - this.grid.scrollX;
            if (Math.abs(mouse_x - borderX) < resizeHandleWidth) {
                // console.log("hit column", c-1);
                this.hitTestCol = c - 1; // we want the column to the left of the border
                return true;
            }
        }
        this.hitTestCol = null;
        return false;
    }
    handleMouseDown(event) {
        if (this.hitTestCol === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouse_x = event.clientX - rect.left;
        this.resizingCol = this.hitTestCol;
        this.resizeStartX = mouse_x;
        this.resizeOriginalWidth = this.grid.colWidths[this.resizingCol];
    }
    handleMouseDrag(e) {
        if (this.resizingCol === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const dragDistance = mouseX - this.resizeStartX;
        // don't let columns get too small
        const new_width = Math.max(24, this.resizeOriginalWidth + dragDistance);
        this.grid.colWidths[this.resizingCol] = new_width;
        this.grid.requestRedraw();
    }
    handleMouseUp(e) {
        if (this.resizingCol === null)
            return;
        this.grid.updateScrollbarContentSize();
        // For the undo/redo system later
        const action = {
            col: this.resizingCol,
            from: this.resizeOriginalWidth,
            to: this.grid.colWidths[this.resizingCol],
        };
        this.resizingCol = null;
        return action;
    }
}
