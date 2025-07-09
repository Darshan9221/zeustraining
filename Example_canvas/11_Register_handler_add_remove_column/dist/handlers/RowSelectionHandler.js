/**
 * @class RowSelectionHandler
 * @description Manages the selection of full rows in the grid.
 */
export class RowSelectionHandler {
    constructor(grid, dragState) {
        this.startRow = 0;
        this.grid = grid;
        this.dragState = dragState;
    }
    /**
     * @public
     * @method handleMouseDown
     * @description Handles mouse down events on the row header to initiate full row selection.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDown(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const virtualY = clickY + this.grid.scrollY;
        if (this.dragState.isResizing) {
            return;
        }
        if (clickX < this.grid.headerWidth && clickY >= this.grid.headerHeight) {
            this.dragState.isDraggingRowHeader = true;
            const row = this.grid.rowAtY(virtualY);
            if (row) {
                this.startRow = row;
                this.grid.selectedRow = row;
                this.grid.selectedCol = 1;
                this.grid.selectionStartRow = this.startRow;
                this.grid.selectionEndRow = row;
                this.grid.selectionStartCol = 1;
                this.grid.selectionEndCol = this.grid.cols - 1;
                this.grid.requestRedraw();
            }
        }
    }
    /**
     * @public
     * @method handleMouseDrag
     * @description Handles mouse drag events to extend the full row selection.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDrag(e) {
        if (!this.dragState.isDraggingRowHeader)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const virtualY = mouseY + this.grid.scrollY;
        const row = this.grid.rowAtY(virtualY);
        if (row) {
            this.grid.selectionStartRow = this.startRow;
            this.grid.selectionEndRow = row;
            this.grid.selectionStartCol = 1;
            this.grid.selectionEndCol = this.grid.cols - 1;
            this.grid.requestRedraw();
        }
    }
}
