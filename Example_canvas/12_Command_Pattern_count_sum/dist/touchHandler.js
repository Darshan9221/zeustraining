import { RangeSelection } from "./handlers/rangeSelection";
import { RowSelection } from "./handlers/rowSelection";
import { ColSelection } from "./handlers/colSelection";
export class TouchHandler {
    constructor(grid, canvas, inputHandler, registerHandler, autoScroll, handlers) {
        this.activeHandler = null;
        this.grid = grid;
        this.canvas = canvas;
        this.inputHandler = inputHandler;
        this.registerHandler = registerHandler;
        this.autoScroll = autoScroll;
        this.handlers = handlers;
        this.handlerPriority = [
            handlers.columnResize,
            handlers.rowResize,
            handlers.column,
            handlers.row,
            handlers.range,
        ];
    }
    attachEventListeners() {
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("dblclick", this.handleDblClick.bind(this));
    }
    isDragging() {
        return this.activeHandler !== null;
    }
    /**
     * Behaviour of cell on mouse click
     * @param {MouseEvent} e
     */
    handleMouseDown(e) {
        if (this.inputHandler.isActive()) {
            this.inputHandler.commitAndHideInput();
        }
        // Go through our handlers and find the first one that wants to handle this click
        for (const handler of this.handlerPriority) {
            if (handler.hitTest(e)) {
                // console.log("Activating handler:", handler.constructor.name);
                this.activeHandler = handler;
                this.activeHandler.handleMouseDown(e);
                break; // Stop after the first match
            }
        }
    }
    handleMouseMove(e) {
        if (this.activeHandler) {
            // If we're dragging, let the active handler deal with it
            this.activeHandler.handleMouseDrag(e);
            const isSelectionHandler = this.activeHandler instanceof RangeSelection ||
                this.activeHandler instanceof RowSelection ||
                this.activeHandler instanceof ColSelection;
            if (isSelectionHandler) {
                this.autoScroll.handleMouseDrag(e, this.activeHandler);
            }
        }
        else {
            // If we're just hovering, find the correct handler and set the cursor.
            let cursorSet = false;
            for (const handler of this.handlerPriority) {
                if (handler.hitTest(e)) {
                    this.canvas.style.cursor = handler.setCursor(e);
                    cursorSet = true;
                    break;
                }
            }
            // Fallback if no handler is hit (e.g., mouse is outside canvas but still firing events)
            if (!cursorSet) {
                this.canvas.style.cursor = "default";
            }
        }
    }
    /**
     * Behaviour on leaving mouse click
     * @param {MouseEvent} e
     */
    handleMouseUp(e) {
        if (this.activeHandler) {
            const action = this.activeHandler.handleMouseUp(e);
            if (action) {
                this.registerHandler.logAction({
                    type: this.activeHandler.constructor.name,
                    details: action,
                });
            }
            // a drag is finished, so reset everything
            this.activeHandler = null;
            this.autoScroll.handleMouseUp();
            this.grid.requestRedraw();
        }
    }
    /**
     * Cell behaviour on double click
     * @param {MouseEvent} e
     */
    handleDblClick(e) {
        if (this.handlers.range.hitTest(e)) {
            if (this.grid.selectedRow !== null && this.grid.selectedCol !== null) {
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
            }
        }
    }
}
