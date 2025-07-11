/**
 * @class CellSelectionHandler
 * @description Manages the initial selection of a single cell via a mouse click.
 */
export class CellSelectionHandler {
    constructor(grid, dragState) {
        this.grid = grid;
        this.dragState = dragState;
    }
    /**
     * @public
     * @method handleMouseDown
     * @description Handles mouse down events in the main grid area to select a single cell
     * and initiate the drag state for a potential range selection.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDown(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        if (this.dragState.isResizing) {
            return;
        }
        // Do nothing if the click is on the headers
        if (clickX < this.grid.headerWidth || clickY < this.grid.headerHeight) {
            return;
        }
        const virtualX = clickX + this.grid.scrollX;
        const virtualY = clickY + this.grid.scrollY;
        const row = this.grid.rowAtY(virtualY);
        const col = this.grid.colAtX(virtualX);
        if (row && row < this.grid.rows && col && col < this.grid.cols) {
            // Set the flag that a drag operation for cell selection has started
            this.dragState.isDraggingSelection = true;
            // Update grid state for the newly selected cell
            this.grid.selectedRow = row;
            this.grid.selectedCol = col;
            this.grid.selectionStartRow = row;
            this.grid.selectionStartCol = col;
            this.grid.selectionEndRow = row;
            this.grid.selectionEndCol = col;
            document.getElementById("selectedInfo").textContent = `R${row}, C${col}`;
            this.grid.requestRedraw();
        }
    }
}
