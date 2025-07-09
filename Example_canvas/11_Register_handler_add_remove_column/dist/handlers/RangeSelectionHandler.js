/**
 * @class RangeSelectionHandler
 * @description Manages the extension of a cell selection range when dragging.
 */
export class RangeSelectionHandler {
    constructor(grid, dragState) {
        this.grid = grid;
        this.dragState = dragState;
    }
    /**
     * @public
     * @method handleMouseDrag
     * @description Handles mouse drag events to extend the cell selection range.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDrag(e) {
        // This handler only acts if a cell selection drag is in progress.
        if (!this.dragState.isDraggingSelection)
            return;
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const virtualX = mouseX + this.grid.scrollX;
        const virtualY = mouseY + this.grid.scrollY;
        const row = this.grid.rowAtY(virtualY) ||
            (virtualY < this.grid.headerHeight ? 1 : this.grid.rows - 1);
        const col = this.grid.colAtX(virtualX) ||
            (virtualX < this.grid.headerWidth ? 1 : this.grid.cols - 1);
        if (row && col) {
            const endRow = Math.max(1, Math.min(row, this.grid.rows - 1));
            const endCol = Math.max(1, Math.min(col, this.grid.cols - 1));
            // Update the end of the selection range if it has changed.
            if (endRow !== this.grid.selectionEndRow ||
                endCol !== this.grid.selectionEndCol) {
                this.grid.selectionEndRow = endRow;
                this.grid.selectionEndCol = endCol;
                this.grid.requestRedraw();
            }
        }
    }
}
