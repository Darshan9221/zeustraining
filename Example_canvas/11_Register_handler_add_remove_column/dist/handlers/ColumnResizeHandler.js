/**
 * @class ColumnResizeHandler
 * @description Manages the resizing of columns in the grid.
 */
export class ColumnResizeHandler {
    /**
     * @constructor
     * @param {Grid} grid - The Grid instance that this handler will interact with.
     * @param {HTMLCanvasElement} canvas - The HTML canvas element associated with the grid.
     * @param {DragState} dragState - The shared drag state object.
     */
    constructor(grid, canvas, dragState) {
        this.resizingCol = null;
        this.resizeStartX = 0;
        this.resizeOrigWidth = 0;
        this.grid = grid;
        this.canvas = canvas;
        this.dragState = dragState;
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    }
    /**
     * @private
     * @method handleMouseMove
     * @description Handles mouse movement over the canvas to change the cursor
     * when it hovers over a resizable column border in the header area.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseMove(e) {
        if (this.resizingCol !== null)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const virtualMouseX = mouseX + this.grid.scrollX;
        let colEdge = null;
        for (let c = this.grid.viewportStartCol; c <= this.grid.viewportEndCol + 1; c++) {
            const borderX = this.grid.getColX(c);
            if (Math.abs(virtualMouseX - borderX) < 5) {
                colEdge = c - 1;
                break;
            }
        }
        if (colEdge !== null && mouseY < this.grid.headerHeight) {
            this.canvas.style.cursor = "col-resize";
        }
        else if (this.canvas.style.cursor === "col-resize") {
            this.canvas.style.cursor = "";
        }
    }
    /**
     * @public
     * @method handleMouseDown
     * @description Handles mouse down events to initiate a column resize operation.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const virtualMouseX = mouseX + this.grid.scrollX;
        for (let c = this.grid.viewportStartCol; c <= this.grid.viewportEndCol + 1; c++) {
            const borderX = this.grid.getColX(c);
            if (Math.abs(virtualMouseX - borderX) < 5 &&
                mouseY < this.grid.headerHeight) {
                this.resizingCol = c - 1;
                this.resizeStartX = mouseX;
                this.resizeOrigWidth = this.grid.colWidths[this.resizingCol];
                this.dragState.isResizing = true; // Set the resizing flag
                e.stopPropagation(); // Prevent other handlers from acting
                return;
            }
        }
    }
    /**
     * @public
     * @method handleMouseDrag
     * @description Handles mouse drag events when a column resize is active.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDrag(e) {
        if (this.resizingCol !== null) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const newWidth = Math.max(24, this.resizeOrigWidth + (mouseX - this.resizeStartX));
            this.grid.colWidths[this.resizingCol] = newWidth;
            this.grid.requestRedraw();
        }
    }
    /**
     * @public
     * @method handleMouseUp
     * @description Handles mouse up events, ending the column resize operation.
     */
    handleMouseUp() {
        if (this.resizingCol !== null) {
            this.grid.updateScrollbarContentSize();
        }
        this.resizingCol = null;
        this.dragState.isResizing = false; // Reset the flag on mouse up
    }
}
