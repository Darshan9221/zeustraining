export class RowSelection {
    constructor(grid) {
        this.startRow = null;
        this.grid = grid;
    }
    hitTest(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return x < this.grid.headerWidth && y >= this.grid.headerHeight;
    }
    handleMouseDown(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const click_y = e.clientY - rect.top;
        const virtual_y = click_y + this.grid.scrollY;
        const row_index = this.grid.rowAtY(virtual_y);
        if (row_index === null)
            return;
        this.startRow = row_index;
        this.grid.selectedRow = row_index;
        this.grid.selectedCol = 1;
        this.grid.selectionStartRow = this.startRow;
        this.grid.selectionEndRow = row_index;
        this.grid.selectionStartCol = 1;
        this.grid.selectionEndCol = this.grid.cols - 1;
        this.grid.requestRedraw();
    }
    handleMouseDrag(e) {
        if (this.startRow === null)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const virtualY = mouseY + this.grid.scrollY;
        const row = this.grid.rowAtY(virtualY);
        if (row && row !== this.grid.selectionEndRow) {
            this.grid.selectionEndRow = row;
            this.grid.requestRedraw();
        }
    }
    handleMouseUp(e) {
        this.startRow = null;
    }
}
