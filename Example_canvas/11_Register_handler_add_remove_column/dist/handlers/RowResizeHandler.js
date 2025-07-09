/**
 * @class RowResizeHandler
 * @description Manages the resizing of rows in the grid.
 */
export class RowResizeHandler {
    /**
     * @constructor
     * @param {Grid} grid - The Grid instance that this handler will interact with.
     * @param {HTMLCanvasElement} canvas - The HTML canvas element associated with the grid.
     * @param {DragState} dragState - The shared drag state object.
     */
    constructor(grid, canvas, dragState) {
        this.resizingRow = null;
        this.resizeStartY = 0;
        this.resizeOrigHeight = 0;
        this.grid = grid;
        this.canvas = canvas;
        this.dragState = dragState;
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    }
    /**
     * @private
     * @method handleMouseMove
     * @description Handles mouse movement over the canvas to change the cursor
     * when it hovers over a resizable row border in the header area.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseMove(e) {
        if (this.resizingRow !== null)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const virtualMouseY = mouseY + this.grid.scrollY;
        let rowEdge = null;
        for (let r = this.grid.viewportStartRow; r <= this.grid.viewportEndRow + 1; r++) {
            const borderY = this.grid.getRowY(r);
            if (Math.abs(virtualMouseY - borderY) < 5) {
                rowEdge = r - 1;
                break;
            }
        }
        if (rowEdge !== null && mouseX < this.grid.headerWidth) {
            this.canvas.style.cursor = "row-resize";
        }
        else if (this.canvas.style.cursor === "row-resize") {
            this.canvas.style.cursor = "";
        }
    }
    /**
     * @public
     * @method handleMouseDown
     * @description Handles mouse down events to initiate a row resize operation.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const virtualMouseY = mouseY + this.grid.scrollY;
        for (let r = this.grid.viewportStartRow; r <= this.grid.viewportEndRow + 1; r++) {
            const borderY = this.grid.getRowY(r);
            if (Math.abs(virtualMouseY - borderY) < 5 &&
                mouseX < this.grid.headerWidth) {
                this.resizingRow = r - 1;
                this.resizeStartY = mouseY;
                this.resizeOrigHeight = this.grid.rowHeights[this.resizingRow];
                this.dragState.isResizing = true; // Set the resizing flag
                e.stopPropagation(); // Prevent other handlers from acting
                return;
            }
        }
    }
    /**
     * @public
     * @method handleMouseDrag
     * @description Handles mouse drag events when a row resize is active.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDrag(e) {
        if (this.resizingRow !== null) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            const newHeight = Math.max(12, this.resizeOrigHeight + (mouseY - this.resizeStartY));
            this.grid.rowHeights[this.resizingRow] = newHeight;
            this.grid.requestRedraw();
        }
    }
    /**
     * @public
     * @method handleMouseUp
     * @description Handles mouse up events, ending the row resize operation.
     */
    handleMouseUp() {
        if (this.resizingRow !== null) {
            this.grid.updateScrollbarContentSize();
        }
        this.resizingRow = null;
        this.dragState.isResizing = false; // Reset the flag on mouse up
    }
}
