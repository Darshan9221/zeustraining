/**
 * @class RowSelectionHandler
 * @description Manages the selection of full rows in the grid.
 */
export class RowSelectionHandler {
    constructor(grid) {
        this.startRow = null;
        this.grid = grid;
    }
    hitTest(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        return clickX < this.grid.headerWidth && clickY >= this.grid.headerHeight;
    }
    handleMouseDown(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const virtualY = clickY + this.grid.scrollY;
        const row = this.grid.rowAtY(virtualY);
        if (row === undefined || row === null)
            return;
        this.startRow = row;
        this.grid.selectedRow = row;
        this.grid.selectedCol = 1;
        this.grid.selectionStartRow = this.startRow;
        this.grid.selectionEndRow = row;
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
