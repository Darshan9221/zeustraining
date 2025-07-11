import { ColumnSelectionHandler } from "./ColumnSelectionHandler";
import { RangeSelectionHandler } from "./RangeSelectionHandler";
import { RowSelectionHandler } from "./RowSelectionHandler";
/**
 * @class AutoScrollHandler
 * @description Manages auto-scrolling when dragging a selection near the edges of the grid viewport.
 */
export class AutoScrollHandler {
    constructor(grid, canvas) {
        this.autoScrollIntervalId = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.grid = grid;
        this.canvas = canvas;
    }
    /**
     * @public
     * @method handleMouseDrag
     * @description Called on mouse move to check if auto-scrolling should be initiated or stopped.
     * @param {MouseEvent} e - The mouse event object.
     * @param {IInteractionHandler} activeHandler - The currently active selection handler.
     */
    handleMouseDrag(e, activeHandler) {
        // Store the latest mouse position.
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        // Manage the auto-scroll interval (start/stop it as needed).
        this.manageAutoScrollInterval(activeHandler);
    }
    /**
     * @public
     * @method handleMouseUp
     * @description Stops any active auto-scroll interval when the mouse is released.
     */
    handleMouseUp() {
        if (this.autoScrollIntervalId) {
            clearInterval(this.autoScrollIntervalId);
            this.autoScrollIntervalId = null;
        }
    }
    /**
     * @private
     * @method manageAutoScrollInterval
     * @description Manages the starting and stopping of the auto-scroll interval based on mouse position.
     * @param {IInteractionHandler} activeHandler - The currently active selection handler.
     */
    manageAutoScrollInterval(activeHandler) {
        const rect = this.canvas.getBoundingClientRect();
        const isOutside = this.lastMouseY < rect.top + this.grid.headerHeight ||
            this.lastMouseY > rect.bottom ||
            this.lastMouseX < rect.left + this.grid.headerWidth ||
            this.lastMouseX > rect.right;
        if (isOutside) {
            // If we need to scroll and there's no interval running, start one.
            if (this.autoScrollIntervalId === null) {
                this.autoScrollIntervalId = window.setInterval(() => {
                    const scrollAmount = 20;
                    let scrollX = 0;
                    let scrollY = 0;
                    const currentRect = this.canvas.getBoundingClientRect();
                    // --- MODIFIED ---
                    // The logic is now split based on the type of selection drag.
                    if (activeHandler instanceof RowSelectionHandler) {
                        // For row selection, ONLY scroll vertically.
                        if (this.lastMouseY < currentRect.top + this.grid.headerHeight) {
                            scrollY = -scrollAmount;
                        }
                        else if (this.lastMouseY > currentRect.bottom) {
                            scrollY = scrollAmount;
                        }
                    }
                    else if (activeHandler instanceof ColumnSelectionHandler) {
                        // For column selection, ONLY scroll horizontally.
                        if (this.lastMouseX < currentRect.left + this.grid.headerWidth) {
                            scrollX = -scrollAmount;
                        }
                        else if (this.lastMouseX > currentRect.right) {
                            scrollX = scrollAmount;
                        }
                    }
                    else if (activeHandler instanceof RangeSelectionHandler) {
                        // For a normal cell range selection, scroll on both axes.
                        if (this.lastMouseY < currentRect.top + this.grid.headerHeight) {
                            scrollY = -scrollAmount;
                        }
                        else if (this.lastMouseY > currentRect.bottom) {
                            scrollY = scrollAmount;
                        }
                        if (this.lastMouseX < currentRect.left + this.grid.headerWidth) {
                            scrollX = -scrollAmount;
                        }
                        else if (this.lastMouseX > currentRect.right) {
                            scrollX = scrollAmount;
                        }
                    }
                    // Apply the calculated scroll
                    if (scrollX !== 0 || scrollY !== 0) {
                        const hScrollbar = document.querySelector(".scrollbar-h");
                        const vScrollbar = document.querySelector(".scrollbar-v");
                        hScrollbar.scrollLeft += scrollX;
                        vScrollbar.scrollTop += scrollY;
                        // After scrolling, we must update the selection end based on the new virtual coordinates
                        const mouseX = this.lastMouseX - currentRect.left;
                        const mouseY = this.lastMouseY - currentRect.top;
                        const virtualX = mouseX + this.grid.scrollX;
                        const virtualY = mouseY + this.grid.scrollY;
                        const endRow = this.grid.rowAtY(virtualY) ||
                            (virtualY < this.grid.headerHeight ? 1 : this.grid.rows - 1);
                        const endCol = this.grid.colAtX(virtualX) ||
                            (virtualX < this.grid.headerWidth ? 1 : this.grid.cols - 1);
                        // Update the appropriate selection end based on drag mode
                        if (activeHandler instanceof RowSelectionHandler)
                            this.grid.selectionEndRow = endRow;
                        else if (activeHandler instanceof ColumnSelectionHandler)
                            this.grid.selectionEndCol = endCol;
                        else if (activeHandler instanceof RangeSelectionHandler) {
                            this.grid.selectionEndRow = endRow;
                            this.grid.selectionEndCol = endCol;
                        }
                        this.grid.requestRedraw();
                    }
                }, 50); // scrolls every 50ms
            }
        }
        else {
            // If we are inside the canvas, clear any existing interval.
            if (this.autoScrollIntervalId !== null) {
                clearInterval(this.autoScrollIntervalId);
                this.autoScrollIntervalId = null;
            }
        }
    }
}
