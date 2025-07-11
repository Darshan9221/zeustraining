import { RangeSelectionHandler } from "./handlers/RangeSelectionHandler";
import { RowSelectionHandler } from "./handlers/RowSelectionHandler";
import { ColumnSelectionHandler } from "./handlers/ColumnSelectionHandler";
export class GridInteractionHandler {
    constructor(grid, canvas, inputHandler, actionLogger, autoScrollHandler, handlers) {
        // This will hold the handler that's currently being used (e.g., during a mouse drag)
        this.activeHandler = null;
        this.grid = grid;
        this.canvas = canvas;
        this.inputHandler = inputHandler;
        this.actionLogger = actionLogger;
        this.autoScrollHandler = autoScrollHandler;
        this.handlers = handlers;
        // The order is critical! More specific interactions must come before general ones.
        // e.g., A resize handle is on a header, so we must check for resize first.
        this.handlerPriority = [
            handlers.columnResize,
            handlers.rowResize,
            handlers.column,
            handlers.row,
            handlers.range, // this one is last because it's the "default"
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
            const isSelectionHandler = this.activeHandler instanceof RangeSelectionHandler ||
                this.activeHandler instanceof RowSelectionHandler ||
                this.activeHandler instanceof ColumnSelectionHandler;
            if (isSelectionHandler) {
                this.autoScrollHandler.handleMouseDrag(e, this.activeHandler);
            }
        }
        else {
            // If we're just moving the mouse (not dragging), check for hover effects like changing the cursor
            let cursorSet = false;
            if (this.handlers.columnResize.hitTest(e)) {
                this.canvas.style.cursor = "col-resize";
                cursorSet = true;
            }
            else if (this.handlers.rowResize.hitTest(e)) {
                this.canvas.style.cursor = "row-resize";
                cursorSet = true;
            }
            if (!cursorSet && this.canvas.style.cursor !== "default") {
                this.canvas.style.cursor = "default";
            }
        }
    }
    handleMouseUp(e) {
        if (this.activeHandler) {
            const action = this.activeHandler.handleMouseUp(e);
            if (action) {
                this.actionLogger.logAction({
                    type: this.activeHandler.constructor.name,
                    details: action,
                });
            }
            // a drag is finished, so reset everything
            this.activeHandler = null;
            this.autoScrollHandler.handleMouseUp();
            this.grid.requestRedraw();
        }
    }
    handleDblClick(e) {
        // A double click should start editing the cell
        if (this.handlers.range.hitTest(e)) {
            if (this.grid.selectedRow !== null && this.grid.selectedCol !== null) {
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
            }
        }
    }
}
